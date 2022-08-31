// eslint-disable-next-line max-classes-per-file
const {
  Transform,
  Readable,
  Writable,
} = require('stream');
const { EOL } = require('os');

class NullOrUndefinedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NullOrUndefinedError';
  }
}
exports.NullOrUndefinedError = NullOrUndefinedError;

class NonObjectModeReadableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NonObjectModeReadableError';
  }
}
exports.NonObjectModeReadableError = NonObjectModeReadableError;

class ChildResponseReceiver extends Readable {
  constructor(childProcess) {
    super({
      objectMode: true,
    });
    this.childProcess = childProcess;
    this.pendingChunks = [];
  }

  // queue chunks when downstream reader signals backpressure
  buffer(chunk) {
    this.pendingChunks.push(chunk);
  }

  _read() {
    let backpressure = false;
    // enqueue chunks now that downstream reader signals it is ready for more
    while (this.pendingChunks.length > 0) {
      backpressure = !this.push(this.pendingChunks.shift());
      this.childProcess.send({ ack: 1 });
      if (backpressure) {
        // stop loop if reader signals backpressure again during enqueueing
        return;
      }
    }
  }
}
exports.ChildResponseReceiver = ChildResponseReceiver;

class PayloadTransform extends Transform {
  constructor() {
    super({
      readableObjectMode: false,
      writableObjectMode: true,
    });
  }

  _transform(chunk, _, callback) {
    this.push(JSON.stringify(chunk) + EOL);
    callback();
  }
}
exports.PayloadTransform = PayloadTransform;

class StreamFlowControl {
  constructor(highWaterMark) {
    this.highWaterMark = highWaterMark;
    this.pending = 0;
    this.nextCallbacks = [];
  }

  onSent(sent, next) {
    this.pending += sent;
    if (this.pending > this.highWaterMark) {
      this.nextCallbacks.push(next);
    } else {
      next();
    }
  }

  onAck(acked) {
    this.pending -= acked;
    if (this.pending < this.highWaterMark) {
      const nextCallback = this.nextCallbacks.shift();
      if (typeof nextCallback === 'function') {
        nextCallback();
      }
    }
  }
}
exports.StreamFlowControl = StreamFlowControl;

class ParentProcessSender extends Writable {
  constructor(process, flow) {
    super({
      objectMode: true,
    });
    this.process = process;
    this.flow = flow;
  }

  _write(chunk, _, callback) {
    this.process.send({
      type: 'chunk',
      chunk,
    });
    this.flow.onSent(1, callback);
  }
}
exports.ParentProcessSender = ParentProcessSender;
