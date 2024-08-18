// @ts-nocheck

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import leoProfanity from 'leo-profanity';

import { ApiContext } from './contexts/index.js';
import App from './components/App.jsx';
import getLogger from './lib/logger.js';
import reducer, { actions } from './slices/index.js';
import resources from './locales/index.js';
import badWords from './locales/badWords.js';

const logSocket = getLogger('socket');

export default async (socket) => {

  // @ts-ignore
  const ruDict = leoProfanity.getDictionary('en');
  leoProfanity.add(ruDict);
  leoProfanity.add(badWords);

  const withAcknowledgement = (socketFunc) => (...args) => new Promise((resolve, reject) => {
    let state = 'pending'; // eslint-disable-line
    const timer = setTimeout(() => {
      state = 'rejected';
      reject();
    }, 3000);

    socketFunc(...args, (response) => {
      if (state !== 'pending') return;

      clearTimeout(timer);

      if (response.status === 'ok') {
        state = 'resolved';
        resolve(response.data);
      }

      reject();
    });
  });

  const api = {
    sendMessage: withAcknowledgement((...args) => socket.volatile.emit('newMessage', ...args)),
    createChannel: withAcknowledgement((...args) => socket.volatile.emit('newChannel', ...args)),
    renameChannel: withAcknowledgement((...args) => socket.volatile.emit('renameChannel', ...args)),
    removeChannel: withAcknowledgement((...args) => socket.volatile.emit('removeChannel', ...args)),
  };

  const store = configureStore({
    reducer,
  });

  socket.on('newMessage', (payload) => {
    logSocket('newMessage', payload);
    store.dispatch(actions.addMessage({ message: payload }));
  });
  socket.on('newChannel', (payload) => {
    logSocket('newChannel', payload);
    store.dispatch(actions.addChannel({ channel: payload }));
  });
  socket.on('removeChannel', (payload) => {
    logSocket('removeChannel', payload);
    store.dispatch(actions.removeChannel({ channelId: payload.id }));
  });
  socket.on('renameChannel', (payload) => {
    logSocket('renameChannel', payload);
    store.dispatch(actions.renameChannel({
      channelId: payload.id,
      channelName: payload.name,
    }));
  });

  const i18n = i18next.createInstance();

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
    });

  const vdom = (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <ApiContext.Provider value={api}>
          <App />
        </ApiContext.Provider>
      </I18nextProvider>
    </Provider>
  );

  return vdom;
};
