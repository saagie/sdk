import React, { useState } from 'react';
import {
  Button,
  LabelValue,
  Modal,
  ModalHeader,
  ModalCloseButton,
  ModalTitle,
  ModalBody,
  useDisclosure,
  Tooltip,
} from 'saagie-ui/react';
import {
  useScriptCallHistoryContext,
  useScriptCallMutation,
} from '../contexts/ScriptCallHistoryContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const loggerName = (name) => {
  if (name.startsWith('console.')) {
    return name.substring(8)
      .toUpperCase();
  }
  return name;
};

const parseJsonSafely = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

export function SidePanel() {
  const [selectedScriptCallIndex, setSelectedScriptCallIndex] = useState();
  const [sandboxScript, setSandboxScript] = useState();
  const [sandboxFunction, setSandboxFunction] = useState();
  const [sandboxArg, setSandboxArg] = useState();
  const { setItem: setSandboxLocalData, getItem: getSandboxLocalData } = useLocalStorage('sandbox');

  const {
    isOpen,
    open,
    close,
  } = useDisclosure();
  const {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
  } = useDisclosure();
  const {
    isOpen: isSandboxModalOpen,
    open: openSandboxModal,
    close: closeSandboxModal,
  } = useDisclosure();

  const {
    history,
    clearHistory,
  } = useScriptCallHistoryContext();

  const handleOpenModal = (scriptCallIndex) => {
    setSelectedScriptCallIndex(scriptCallIndex);
    openModal();
  };

  const getErrorSummary = (error) => `${error?.name ?? ''}${error?.name && error?.message ? ' - ' : ''}${error?.message ?? ''}`;

  const getScriptCallSummary = (scriptCall) => {
    let message = '';
    if (scriptCall?.error) {
      message = ` - ${getErrorSummary(scriptCall?.error)}`;
    }
    return `${scriptCall?.function}${message}`;
  };

  const historyIndex = selectedScriptCallIndex + (selectedScriptCallIndex < 0 ? history.length : 0);
  const selectedScriptCall = history[historyIndex];
  const {
    name: errorName,
    message: errorMessage,
    stack: errorStack,
    ...error
  } = selectedScriptCall?.error ?? {};

  const sidePanelLabel = 'Script Call History';

  const sandboxLocalData = getSandboxLocalData();
  const setSandboxData = (script, fun, arg) => {
    if (fun !== null) {
      setSandboxFunction(fun);
    }
    if (script !== null) {
      setSandboxScript(script);
    }
    if (arg !== null) {
      setSandboxArg(arg);
    }
    setSandboxLocalData({
      script: script || sandboxScript || sandboxLocalData?.script,
      fun: fun || sandboxFunction || sandboxLocalData?.fun,
      arg: arg || sandboxArg || sandboxLocalData?.arg,
    });
  };

  const {
    mutateAsync: callSandboxScript,
  } = useScriptCallMutation('',
    {
      script: sandboxScript ?? sandboxLocalData?.script,
      function: sandboxFunction ?? sandboxLocalData?.fun,
    },
    parseJsonSafely(sandboxArg ?? sandboxLocalData?.arg),
  );

  const callSandbox = async () => {
    closeSandboxModal();
    await callSandboxScript();
    setSelectedScriptCallIndex(-1);
    openModal();
  };

  return (
    <>
      <Tooltip defaultPlacement="right" label={sidePanelLabel}>
        <button
          className="sdk-o-side-panel__trigger"
          type="button"
          onClick={open}
        >
          <span role="img" aria-label="Bug emoji" className="sdk-o-side-panel__trigger-label">
            🐛
          </span>
        </button>
      </Tooltip>
      <div className={`sui-o-side-panel ${isOpen ? 'as--open' : ''} as--left`}>
        <div className="sui-o-side-panel__header">
          <button
            type="button"
            className="sui-o-side-panel__close"
            tabIndex="-1"
            onClick={close}
          >
            &times;
          </button>
          <div className="sui-o-side-panel__title">{sidePanelLabel}</div>
        </div>
        <div className="sui-o-side-panel__body">
          <div className="sui-o-side-panel__scroll">
            {history.length === 0 && (
              <div className="sui-m-message">
                Any action or error will be shown in this panel. Try to click on
                the <code>Run</code> button to try.
              </div>
            )}
            <div>
              {history.map((scriptCall, scriptCallIndex) => (
                <div
                  className="sui-h-mb-md"
                  key={scriptCall.id}
                >
                  <div
                    role="button"
                    tabIndex="0"
                    className={`sdk-m-card ${scriptCall.error ? 'as--error' : 'as--success'}`}
                    onClick={() => handleOpenModal(scriptCallIndex)}
                    onKeyDown={(event) => {
                      if (event.keyCode !== 13) {
                        return;
                      }

                      handleOpenModal(scriptCall);
                    }}
                  >
                    {getScriptCallSummary(scriptCall)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sui-o-side-panel__footer">
          <div className="sui-g-grid">
            <div className="sui-g-grid__item as--pull">
              <Button onClick={clearHistory}>Clear History</Button>
            </div>
            <div className="sui-g-grid__item as--push">
              <Button onClick={openSandboxModal}>Sandbox</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isSandboxModalOpen} onClose={closeSandboxModal} size="xxl">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>Sandbox</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="sui-m-form-group">
            <label className="sui-a-form-label as--lg">JS file path</label>
            <input className="sui-a-form-control" value={sandboxScript ?? sandboxLocalData?.script} onChange={(e) => setSandboxData(e.target.value, null, null)} />
          </div>
          <div className="sui-m-form-group">
            <label className="sui-a-form-label as--lg">Function</label>
            <input className="sui-a-form-control" value={sandboxFunction ?? sandboxLocalData?.fun} onChange={(e) => setSandboxData(null, e.target.value, null)} />
          </div>
          <div className="sui-m-form-group">
            <label className="sui-a-form-label as--lg">Argument</label>
            <input className="sui-a-form-control" value={sandboxArg ?? sandboxLocalData?.arg} onChange={(e) => setSandboxData(null, null, e.target.value)} />
          </div>
          <Button onClick={callSandbox}>Call</Button>
        </ModalBody>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="xxl">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>{getScriptCallSummary(selectedScriptCall)}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <LabelValue label="Script">
            <pre>{selectedScriptCall?.script}</pre>
          </LabelValue>
          <LabelValue label="Function">
            <pre>{selectedScriptCall?.function}</pre>
          </LabelValue>
          <LabelValue label="Params">
            <pre>{JSON.stringify(selectedScriptCall?.params, null, 2)}</pre>
          </LabelValue>
          {selectedScriptCall?.data
            && (
              <LabelValue label="Result">
                <pre>{JSON.stringify(selectedScriptCall?.data, null, 2)}</pre>
              </LabelValue>
            )}
          {(errorName || errorMessage)
            && (
              <LabelValue label="Result: ERROR">
                <pre>{getErrorSummary(selectedScriptCall?.error)}</pre>
              </LabelValue>
            )}
          {errorStack
            && (
              <LabelValue label="Result: Stack">
                <pre>{errorStack}</pre>
              </LabelValue>
            )}
          {Object.keys(error).length > 0
            && (
              <LabelValue label="Result: error data">
                <pre>{JSON.stringify(error)}</pre>
              </LabelValue>
            )}
          {selectedScriptCall?.logs?.length > 0
            && (
              <LabelValue label="Console">
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedScriptCall?.logs.map((log) => `[${loggerName(log.name)}] ${log.message}\n`)}
                </pre>
              </LabelValue>
            )}
        </ModalBody>
      </Modal>
    </>
  );
}
