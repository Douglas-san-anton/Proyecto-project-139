// @ts-check

import React, { useRef, useEffect, useState } from 'react';
import {
  Modal as BootstrapModal,
  Form,
  Button,
} from 'react-bootstrap';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
// import { useRollbar } from '@rollbar/react';
import { toast } from 'react-toastify';
import leoProfanity from 'leo-profanity';

import getLogger from '../lib/logger.js';
import { getChannelsNames, getChannelById } from '../selectors.js';
import { useApi } from '../hooks/index.js';
import { actions } from '../slices/index.js';

const log = getLogger('client');

const getValidationSchema = (channels) => yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('modals.required')
    .min(3, 'modals.min')
    .max(20, 'modals.max')
    .notOneOf(channels, 'modals.uniq'),
});

const AddChannelForm = ({ handleClose }) => {
  const channels = useSelector(getChannelsNames);
  const inputRef = useRef(null);
  const api = useApi();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  // const rollbar = useRollbar();

  useEffect(() => {
    // @ts-ignore
    inputRef.current.focus();
  }, []);

  const f = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: getValidationSchema(channels),
    onSubmit: async ({ name }, { setSubmitting }) => {
      const filteredName = leoProfanity.clean(name);
      const channel = { name: filteredName };
      try {
        // @ts-ignore
        const data = await api.createChannel(channel);
        log('channel.create', data);
        dispatch(actions.setCurrentChannel({ channelId: data.id }));
        // @ts-ignore
        toast.success(t('channels.created'));
        handleClose();
      } catch (e) {
        // rollbar.error(e);
        log('channel.create.error', e);
        setSubmitting(false);
        // @ts-ignore
        inputRef.current.select();
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <>
      <BootstrapModal.Header>
        <BootstrapModal.Title>{t('modals.add')}</BootstrapModal.Title>
        <Button
          variant="close"
          type="button"
          onClick={handleClose}
          aria-label="Close"
          data-bs-dismiss="modal"
        />
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <Form onSubmit={f.handleSubmit}>
          <Form.Group>
            <Form.Control
              className="mb-2"
              disabled={f.isSubmitting}
              ref={inputRef}
              onChange={f.handleChange}
              onBlur={f.handleBlur}
              value={f.values.name}
              // @ts-ignore
              isInvalid={f.errors.name && f.touched.name}
              name="name"
              id="name"
            />
            <label className="visually-hidden" htmlFor="name">{t('modals.channelName')}</label>
            <Form.Control.Feedback type="invalid">
              {t(
// @ts-ignore
              f.errors.name)}
            </Form.Control.Feedback>
            <div className="d-flex justify-content-end">
              <Button
                className="me-2"
                variant="secondary"
                type="button"
                onClick={handleClose}
              >
                {t('modals.cancel')}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={f.isSubmitting}
              >
                {t('modals.submit')}
              </Button>
            </div>
          </Form.Group>
        </Form>
      </BootstrapModal.Body>
    </>
  );
};

const RemoveChannelForm = ({ handleClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const api = useApi();
  // @ts-ignore
  const channelId = useSelector((state) => state.modal.extra?.channelId);
  // const rollbar = useRollbar();
  const handleRemove = async () => {
    setLoading(true);
    try {
      log('channel.delete');
      // @ts-ignore
      await api.removeChannel({ id: channelId });
      // @ts-ignore
      toast.success(t('channels.removed'));
      handleClose();
    } catch (e) {
      // rollbar.error(e);
      log('channel.remove.error', e);
      setLoading(false);
    }
  };

  return (
    <>
      <BootstrapModal.Header>
        <BootstrapModal.Title>{t('modals.remove')}</BootstrapModal.Title>
        <Button
          variant="close"
          type="button"
          onClick={handleClose}
          aria-label="Close"
          data-bs-dismiss="modal"
        />
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <p className="lead">{t('modals.confirmation')}</p>
        <div className="d-flex justify-content-end">
          <Button
            className="me-2"
            variant="secondary"
            type="button"
            onClick={handleClose}
            disabled={loading}
          >
            {t('modals.cancel')}
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={handleRemove}
            disabled={loading}
          >
            {t('modals.confirm')}
          </Button>
        </div>
      </BootstrapModal.Body>
    </>
  );
};

const RenameChannelForm = ({ handleClose }) => {
  const { t } = useTranslation();
  const channels = useSelector(getChannelsNames);
  // @ts-ignore
  const channelId = useSelector((state) => state.modal.extra?.channelId);
  const channel = useSelector(getChannelById(channelId));
  const inputRef = useRef(null);
  const api = useApi();
  // const rollbar = useRollbar();
  useEffect(() => {
    // @ts-ignore
    setTimeout(() => inputRef.current.select());
  }, []);
  const f = useFormik({
    initialValues: {
      name: channel.name,
    },
    validationSchema: getValidationSchema(channels),
    onSubmit: async ({ name }, { setSubmitting }) => {
      const filteredName = leoProfanity.clean(name);
      const data = { name: filteredName, id: channelId };

      try {
        log('channel.rename');
        // @ts-ignore
        await api.renameChannel(data);
        // @ts-ignore
        toast.success(t('channels.renamed'));
        handleClose();
      } catch (e) {
        // rollbar.error(e);
        log('channel.rename.error', e);
        setSubmitting(false);
        // @ts-ignore
        inputRef.current.select();
        if (!e.isAxiosError) {
          throw e;
        }
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <>
      <BootstrapModal.Header>
        <BootstrapModal.Title>{t('modals.rename')}</BootstrapModal.Title>
        <Button
          variant="close"
          type="button"
          onClick={handleClose}
          aria-label="Close"
          data-bs-dismiss="modal"
        />
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <Form onSubmit={f.handleSubmit}>
          <Form.Group>
            <Form.Control
              className="mb-2"
              disabled={f.isSubmitting}
              ref={inputRef}
              onChange={f.handleChange}
              onBlur={f.handleBlur}
              value={f.values.name}
              // @ts-ignore
              isInvalid={f.errors.name && f.touched.name}
              name="name"
              id="name"
            />
            <label className="visually-hidden" htmlFor="name">{t('modals.channelName')}</label>
            <Form.Control.Feedback type="invalid">
              {t(
// @ts-ignore
              f.errors.name)}
            </Form.Control.Feedback>
            <div className="d-flex justify-content-end">
              <Button
                className="me-2"
                variant="secondary"
                type="button"
                onClick={handleClose}
              >
                {t('modals.cancel')}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={f.isSubmitting}
              >
                {t('modals.submit')}
              </Button>
            </div>
          </Form.Group>
        </Form>
      </BootstrapModal.Body>
    </>
  );
};

const mapping = {
  addChannel: AddChannelForm,
  removeChannel: RemoveChannelForm,
  renameChannel: RenameChannelForm,
};

const Modal = () => {
  const dispatch = useDispatch();
  // @ts-ignore
  const isOpened = useSelector((state) => state.modal.isOpened);

  const handleClose = () => {
    dispatch(actions.closeModal());
  };
  // @ts-ignore
  const modalType = useSelector((state) => state.modal.type);

  const Component = mapping[modalType];

  return (
    <BootstrapModal show={isOpened} onHide={handleClose} centered>
      {Component && <Component handleClose={handleClose} />}
    </BootstrapModal>
  );
};

export default Modal;
