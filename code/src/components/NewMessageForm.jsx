// @ts-check

import React, { useEffect, useRef } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { ArrowRightSquare } from 'react-bootstrap-icons';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import leoProfanity from 'leo-profanity';

import getLogger from '../lib/logger.js';
import { useApi, useAuth } from '../hooks/index.js';

const log = getLogger('client');

const NewMessageForm = ({ channel }) => {
  const { t } = useTranslation();
  const { user: { username } } = useAuth();
  const inputRef = useRef(null);
  const api = useApi();

  const validationSchema = yup.object().shape({
    body: yup
      .string()
      .trim()
      .required('Required'),
  });

  const f = useFormik({
    initialValues: { body: '' },
    validationSchema,
    onSubmit: async ({ body }) => {
      const filtered = leoProfanity.clean(body);
      const message = {
        body: filtered,
        channelId: channel.id,
        username,
      };

      try {
        log('message.send');
        await api.sendMessage(message);
        f.resetForm();
      } catch (err) {
        // rollbar.error(err);
        log('message.send.error', err);
      }
      f.setSubmitting(false);
      inputRef.current.focus();
    },
    validateOnBlur: false,
  });

  useEffect(() => {
    inputRef.current.focus();
  }, [channel]);

  const isInvalid = !f.dirty || !f.isValid;

  return (
    <Form noValidate onSubmit={f.handleSubmit} className="py-1 border rounded-2">
      <InputGroup hasValidation={isInvalid}>
        <Form.Control
          ref={inputRef}
          onChange={f.handleChange}
          onBlur={f.handleBlur}
          value={f.values.body}
          name="body"
          aria-label={t('chat.newMessage')}
          disabled={f.isSubmitting}
          placeholder="Start typing..."
          className="border-0 p-0 ps-2"
        />
        <Button variant="group-vertical" type="submit" disabled={isInvalid}>
          <ArrowRightSquare size={20} />
          <span className="visually-hidden">{t('chat.send')}</span>
        </Button>
      </InputGroup>
    </Form>
  );
};

export default NewMessageForm;
