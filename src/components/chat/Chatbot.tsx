import { useState, useRef, useEffect, useCallback } from 'react';
import { runAgent, loadConfig } from '../../services/chatAgent';
import type { ChatMessage, AgentStep, ChatConfig } from '../../services/chatAgent';
import { ChatMarkdown } from './ChatMarkdown';

// ── Key prompt ───────────────────────────────────────────────────────────────

function ApiKeyPrompt({ onSubmit }: { onSubmit: (key: string) => void }) {
  const [key, setKey] = useState('');
  return (
    <div className="chatbot-key-prompt">
      <p>Enter your Gemini API key to get started.</p>
      <p className="chatbot-key-hint">Your key is stored locally in this browser only.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (key.trim()) onSubmit(key.trim());
        }}
      >
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Gemini API Key"
          className="chatbot-key-input"
        />
        <button type="submit" className="chatbot-key-btn" disabled={!key.trim()}>
          Save
        </button>
      </form>
    </div>
  );
}

// ── Reasoning block ──────────────────────────────────────────────────────────

function ReasoningBlock({ steps }: { steps: AgentStep[] }) {
  const [open, setOpen] = useState(false);
  if (!steps.length) return null;

  return (
    <div className="chatbot-reasoning">
      <button className="chatbot-reasoning-toggle" onClick={() => setOpen(!open)}>
        <span className="chatbot-reasoning-icon">{open ? '\u25BC' : '\u25B6'}</span>
        Reasoning ({steps.length} step{steps.length > 1 ? 's' : ''})
      </button>
      {open && (
        <div className="chatbot-reasoning-body">
          {steps.map((step, i) => (
            <div key={i} className={`chatbot-step chatbot-step-${step.type}`}>
              <span className="chatbot-step-label">
                {step.type === 'thinking' && 'Thinking'}
                {step.type === 'tool_call' && `Tool: ${step.toolName}`}
                {step.type === 'tool_result' && `Result`}
              </span>
              {step.type === 'tool_call' && step.toolArgs && (
                <pre className="chatbot-step-args">{JSON.stringify(step.toolArgs, null, 2)}</pre>
              )}
              {step.type === 'tool_result' && (
                <pre className="chatbot-step-result">{step.content}</pre>
              )}
              {step.type === 'thinking' && (
                <span className="chatbot-step-text">{step.content}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`chatbot-message ${isUser ? 'chatbot-message-user' : 'chatbot-message-ai'}`}>
      {!isUser && message.steps && <ReasoningBlock steps={message.steps} />}
      {isUser ? (
        <div className="chatbot-message-text">{message.text}</div>
      ) : (
        <div className="chatbot-message-text">
          <ChatMarkdown text={message.text} />
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [liveSteps, setLiveSteps] = useState<AgentStep[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load config & saved key
  useEffect(() => {
    loadConfig().then(setConfig);
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) setApiKey(saved);
  }, []);

  // Use key from config if provided, otherwise localStorage
  const effectiveKey = config?.geminiApiKey || apiKey;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveSteps]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && effectiveKey && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, effectiveKey]);

  const handleKeySubmit = useCallback((key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !effectiveKey || !config) return;

    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setLiveSteps([]);

    const steps: AgentStep[] = [];

    try {
      const text = await runAgent(
        effectiveKey,
        config.geminiModel || 'gemini-2.5-flash',
        messages,
        trimmed,
        (step) => {
          if (step.type !== 'text') {
            steps.push(step);
            setLiveSteps([...steps]);
          }
        },
      );

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text,
        steps: steps.filter((s) => s.type !== 'text'),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Error: ${errorText}`, steps },
      ]);
    } finally {
      setIsLoading(false);
      setLiveSteps([]);
    }
  }, [input, isLoading, effectiveKey, config, messages]);

  if (!config) return null;

  return (
    <>
      {/* FAB */}
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Ask AI"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '\u2715' : '\u2728'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className={`chatbot-panel ${isExpanded ? 'chatbot-panel-expanded' : ''}`}>
          <div className="chatbot-header">
            <span className="chatbot-header-title">Ask AI</span>
            <div className="chatbot-header-actions">
              {effectiveKey && !config?.geminiApiKey && (
                <button
                  className="chatbot-reset-key"
                  onClick={() => {
                    localStorage.removeItem('gemini_api_key');
                    setApiKey(null);
                    setMessages([]);
                  }}
                  title="Change API key"
                >
                  {'\u2699'}
                </button>
              )}
              <button
                className="chatbot-expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
              <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                {'\u2715'}
              </button>
            </div>
          </div>

          <div className="chatbot-body">
            {!effectiveKey ? (
              <ApiKeyPrompt onSubmit={handleKeySubmit} />
            ) : (
              <>
                <div className="chatbot-messages">
                  {messages.length === 0 && !isLoading && (
                    <div className="chatbot-welcome">
                      <p><strong>Welcome!</strong> Ask me anything about Indian education data.</p>
                      <p className="chatbot-welcome-hint">
                        Try: "How many colleges are in India?" or "Compare dropout rates of boys vs girls in primary school"
                      </p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                  ))}
                  {isLoading && (
                    <div className="chatbot-message chatbot-message-ai">
                      {liveSteps.length > 0 && <ReasoningBlock steps={liveSteps} />}
                      <div className="chatbot-loading">
                        <span className="chatbot-dot" />
                        <span className="chatbot-dot" />
                        <span className="chatbot-dot" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  className="chatbot-input-area"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    className="chatbot-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about education data..."
                    disabled={isLoading}
                  />
                  <button type="submit" className="chatbot-send" disabled={isLoading || !input.trim()}>
                    {'\u2191'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
