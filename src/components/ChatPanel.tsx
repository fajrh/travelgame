import { FormEvent } from 'react';
import type { ChatMessage } from '../types';

type ChatPanelProps = {
  messages: ChatMessage[];
  draft: string;
  onChangeDraft: (value: string) => void;
  onSendMessage: () => void;
};

const ChatPanel = ({ messages, draft, onChangeDraft, onSendMessage }: ChatPanelProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSendMessage();
  };

  return (
    <section className="panel chat-panel" aria-label="Trip chat">
      <header className="panel-header">
        <h2>Terminal Chat</h2>
        <p>Plan your adventures with your travel buddies. Messages auto-sync locally.</p>
      </header>
      <div className="chat-history" role="log" aria-live="polite">
        {messages.map((message) => {
          const authorLabel =
            message.author === 'player' ? 'You' : message.author === 'guide' ? 'Guide' : 'Control';

          return (
            <article key={message.id} className={`chat-message chat-message--${message.author}`}>
              <header>
                <span className="chat-message__author">{authorLabel}</span>
                <time className="chat-message__timestamp">{message.timestamp}</time>
              </header>
              <p>{message.text}</p>
            </article>
          );
        })}
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <label htmlFor="chat-draft" className="visually-hidden">
          Message
        </label>
        <input
          id="chat-draft"
          type="text"
          value={draft}
          onChange={(event) => onChangeDraft(event.target.value)}
          placeholder="Share an idea..."
          maxLength={240}
        />
        <button type="submit" className="primary-button">
          Send
        </button>
      </form>
    </section>
  );
};

export default ChatPanel;
