// eslint-disable-next-line max-classes-per-file
class ScriptExecError extends Error {
  constructor(scriptId, fun, name, message, stack) {
    super(message);
    this.scriptId = scriptId;
    this.fun = fun;
    this.name = name;
    this.message = message;
    this.stack = stack;
  }
}

exports.ScriptExecError = ScriptExecError;

class ScriptHaltError extends ScriptExecError {
  constructor(scriptId, fun, message) {
    super(scriptId, fun, 'ScriptHaltError', message, null);
  }
}

exports.ScriptHaltError = ScriptHaltError;

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
