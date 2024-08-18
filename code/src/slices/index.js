// @ts-check

import { combineReducers } from '@reduxjs/toolkit';
import channelsInfo, { actions as channelsInfoActions } from './channelsInfo.js';
import messagesInfo, { actions as messagesInfoActions } from './messagesInfo.js';
import modal, { actions as modalActions } from './modal.js';

const actions = {
  ...channelsInfoActions,
  ...messagesInfoActions,
  ...modalActions,
};

export {
  actions,
};

export default combineReducers({
  channelsInfo,
  messagesInfo,
  modal,
});
