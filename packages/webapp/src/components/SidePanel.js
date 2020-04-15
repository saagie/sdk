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
import { useErrorContext } from '../contexts/ErrorContext';

export const SidePanel = () => {
  const [selectedError, setSelectedError] = useState();

  const { isOpen, open, close } = useDisclosure();
  const {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
  } = useDisclosure();

  const {
    errors,
    clearErrors,
  } = useErrorContext();

  const handleOpenModal = (error) => {
    console.log(error);
    setSelectedError(error);

    openModal();
  };

  const isObject = (value) => typeof value === 'object' && value !== null;

  const objectToLabelValue = (anObject) => {
    if (!anObject) {
      return null;
    }

    if (isObject(anObject)) {
      const keys = Object.keys(anObject);

      return keys.map((key) => {
        const value = anObject[key];
        return (
          <LabelValue key={key} label={key.toUpperCase()}>
            <pre>{!isObject(value) ? value : JSON.stringify(value)}</pre>
          </LabelValue>
        );
      });
    }

    try {
      return objectToLabelValue(JSON.parse(anObject));
    } catch (err) {
      return objectToLabelValue({
        label: 'Raw Value',
        value: anObject,
      });
    }
  };

  const getErrorSummary = (error) => `${error?.on?.action} - ${error?.response?.status} - ${error?.response?.statusText}`;

  const sidePanelLabel = 'Instance Actions Debug Panel';

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
            {errors.length === 0 && (
              <div className="sui-m-message">
                Any action or error will be shown in this panel. Try to click on
                the <code>Run</code> button to try.
              </div>
            )}
            <div>
              {errors.map((error) => (
                <div
                  className="sui-h-mb-md"
                  key={error.id}
                >
                  <Tooltip label={error?.on?.date?.toISOString()} defaultPlacement="right">
                    <div
                      role="button"
                      tabIndex="0"
                      className="sdk-m-card as--error"
                      onClick={() => handleOpenModal(error)}
                      onKeyDown={(event) => {
                        if (event.keyCode !== 13) {
                          return;
                        }

                        handleOpenModal(error);
                      }}
                    >
                      {getErrorSummary(error)}
                    </div>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sui-o-side-panel__footer">
          <div className="sui-g-grid">
            <div className="sui-g-grid__item as--pull">
              <Button onClick={clearErrors}>Clear Errors</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="xxl">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>{getErrorSummary(selectedError)}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <details open className="sui-h-mt-lg">
            <summary>Response Body</summary>
            {objectToLabelValue(selectedError?.response?.data)}
          </details>
          <hr />
          <details>
            <summary>Response Headers</summary>
            {objectToLabelValue(selectedError?.response?.headers)}
          </details>
          <hr />
          <details>
            <summary>Request Body</summary>
            {objectToLabelValue(selectedError?.response?.config?.data)}
          </details>
          <hr />
          <details className="sui-h-mb-lg">
            <summary>Request Headers</summary>
            {objectToLabelValue(selectedError?.response?.config?.headers)}
          </details>
        </ModalBody>
      </Modal>
    </>
  );
};
