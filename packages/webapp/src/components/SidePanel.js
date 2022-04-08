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
import { useScriptCallHistoryContext } from '../contexts/ScriptCallHistoryContext';

const loggerName = (name) => {
  if (name.startsWith('console.')) {
    return name.substring(8).toUpperCase();
  }
  return name;
};

export function SidePanel() {
  const [selectedScriptCall, setSelectedScriptCall] = useState();

  const { isOpen, open, close } = useDisclosure();
  const {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
  } = useDisclosure();

  const {
    history,
    clearHistory,
  } = useScriptCallHistoryContext();

  const handleOpenModal = (scriptCall) => {
    setSelectedScriptCall(scriptCall);

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

  const {
    name: errorName, message: errorMessage, stack: errorStack, ...error
  } = selectedScriptCall?.error ?? {};

  const sidePanelLabel = 'Script Call History';

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
              {history.map((scriptCall) => (
                <div
                  className="sui-h-mb-md"
                  key={scriptCall.id}
                >
                  <div
                    role="button"
                    tabIndex="0"
                    className={`sdk-m-card ${scriptCall.error ? 'as--error' : 'as--success'}`}
                    onClick={() => handleOpenModal(scriptCall)}
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
          </div>
        </div>
      </div>

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
                <pre>
                  {selectedScriptCall?.logs.map((log) => `[${loggerName(log.name)}] ${log.message}\n`)}
                </pre>
              </LabelValue>
            )}
        </ModalBody>
      </Modal>
    </>
  );
}
