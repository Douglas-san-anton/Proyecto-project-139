// @ts-check

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { animateScroll } from 'react-scroll';
import { useTranslation } from 'react-i18next';

import { getCurrentChannel, getMessagesForCurrentChannel } from '../selectors.js';
import NewMessageForm from './NewMessageForm.jsx';

const Message = ({ username, body }) => (
  <div className="text-break mb-2">
    <b>{username}</b>
    {': '}
    {body}
  </div>
);

const ChatBox = () => {
  const channel = useSelector(getCurrentChannel);
  const messages = useSelector(getMessagesForCurrentChannel);
  const { t } = useTranslation();
  useEffect(() => {
    animateScroll.scrollToBottom({ containerId: 'messages-box', delay: 0, duration: 0 });
  }, [messages.length]);

  return (
    <div className="d-flex flex-column h-100">
      <div className="bg-light mb-4 p-3 shadow-sm small">
        <p className="m-0">
          <b>
            {`# ${channel?.name}`}
          </b>
        </p>
        <span className="text-muted">
          {`${messages.length} ${t('chat.messageCount', { count: messages.length })}`}
        </span>
      </div>
      <div id="messages-box" className="chat-messages overflow-auto px-5 ">
        {messages.map(({ id, username, body }) => (
          <Message
            key={id}
            username={username}
            body={body}
          />
        ))}
      </div>
      <div className="mt-auto px-5 py-3">
        <NewMessageForm channel={channel} />
      </div>
    </div>
  );
};

export default ChatBox;
