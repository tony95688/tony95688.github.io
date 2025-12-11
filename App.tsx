import React, { useState, useEffect, useCallback } from 'react';
import { 
  Send, 
  Settings, 
  Bot, 
  Trash2, 
  Sparkles, 
  RefreshCcw, 
  CheckCircle, 
  AlertCircle, 
  Hash
} from 'lucide-react';
import { STORAGE_KEYS } from './constants';
import { WebhookConfig, MessageHistoryItem, AIStyle } from './types';
import { sendToDiscord, validateWebhookUrl } from './services/discordService';
import { refineMessageWithAI } from './services/geminiService';
import Preview from './components/Preview';
import SettingsInput from './components/SettingsInput';

const App: React.FC = () => {
  // Config State
  const [config, setConfig] = useState<WebhookConfig>({
    url: '',
    username: '',
    avatarUrl: ''
  });
  
  // App State
  const [content, setContent] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [history, setHistory] = useState<MessageHistoryItem[]>([]);
  const [urlError, setUrlError] = useState(false);

  // Load configuration from local storage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL) || '';
    const savedUser = localStorage.getItem(STORAGE_KEYS.DEFAULT_USERNAME) || '';
    const savedAvatar = localStorage.getItem(STORAGE_KEYS.DEFAULT_AVATAR) || '';
    
    // Simple check if URL seems existing to auto-close config on load
    if (savedUrl && validateWebhookUrl(savedUrl)) {
        setIsConfigOpen(false);
    }

    setConfig({
      url: savedUrl,
      username: savedUser,
      avatarUrl: savedAvatar
    });

    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save config changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, config.url);
    localStorage.setItem(STORAGE_KEYS.DEFAULT_USERNAME, config.username);
    localStorage.setItem(STORAGE_KEYS.DEFAULT_AVATAR, config.avatarUrl);
    
    if (config.url && !validateWebhookUrl(config.url)) {
      setUrlError(true);
    } else {
      setUrlError(false);
    }
  }, [config]);

  // Handle Send
  const handleSend = async () => {
    if (!content.trim() || !config.url) return;
    if (urlError) {
      setFeedback({ type: 'error', message: "Invalid Webhook URL" });
      return;
    }

    setIsSending(true);
    setFeedback(null);

    try {
      await sendToDiscord(config.url, {
        content: content,
        username: config.username || undefined,
        avatar_url: config.avatarUrl || undefined,
      });

      setFeedback({ type: 'success', message: "Message sent successfully!" });
      
      // Update history
      const newHistoryItem: MessageHistoryItem = {
        id: Date.now().toString(),
        content: content,
        timestamp: Date.now(),
        status: 'success'
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
      
      setContent(''); // Clear input on success
      
      // Clear success message after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message || "Failed to send message" });
    } finally {
      setIsSending(false);
    }
  };

  // Handle AI Refinement
  const handleAIRefine = async (style: AIStyle) => {
    if (!content.trim()) {
        setFeedback({ type: 'error', message: "Please enter some text first for the AI to refine."});
        setTimeout(() => setFeedback(null), 3000);
        return;
    }

    setIsThinking(true);
    try {
      const refined = await refineMessageWithAI(content, style);
      setContent(refined);
    } catch (error) {
      setFeedback({ type: 'error', message: "AI generation failed." });
    } finally {
      setIsThinking(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  return (
    <div className="min-h-screen bg-discord-bg text-discord-text font-sans flex flex-col md:flex-row">
      
      {/* Sidebar / Configuration Panel */}
      <div className={`
        fixed md:relative z-20 w-full md:w-80 bg-discord-sidebar h-full md:h-auto border-r border-discord-divider flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isConfigOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-80'}
      `}>
        <div className="p-4 border-b border-discord-divider flex justify-between items-center">
          <h1 className="font-bold text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration
          </h1>
          <button 
            onClick={() => setIsConfigOpen(false)}
            className="md:hidden text-discord-text-muted hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <SettingsInput 
            label="Webhook URL" 
            value={config.url} 
            onChange={(val) => setConfig({...config, url: val})}
            placeholder="https://discord.com/api/webhooks/..."
            isValid={!urlError}
            required
          />
          
          <div className="h-px bg-discord-divider my-4"></div>

          <h3 className="text-xs font-bold text-discord-text-muted uppercase tracking-wide mb-4">Overrides (Optional)</h3>
          
          <SettingsInput 
            label="Username" 
            value={config.username} 
            onChange={(val) => setConfig({...config, username: val})}
            placeholder="Bot Name"
          />
          
          <SettingsInput 
            label="Avatar URL" 
            value={config.avatarUrl} 
            onChange={(val) => setConfig({...config, avatarUrl: val})}
            placeholder="https://example.com/image.png"
            type="url"
          />

          <div className="mt-8 p-4 bg-discord-element rounded border border-discord-divider">
            <h4 className="flex items-center gap-2 font-bold text-sm mb-2 text-discord-blurple">
              <Bot className="w-4 h-4" />
              How to get a Webhook?
            </h4>
            <ol className="list-decimal list-inside text-xs text-discord-text-muted space-y-1">
              <li>Open Discord Channel Settings</li>
              <li>Go to Integrations &gt; Webhooks</li>
              <li>Create Webhook</li>
              <li>Copy Webhook URL</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-discord-bg border-b border-discord-divider p-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="md:hidden p-2 rounded hover:bg-discord-hover text-discord-text-muted"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-discord-text-muted font-bold text-xl">
              <Hash className="w-6 h-6" />
              <span>Webhook Messenger</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {urlError ? (
               <span className="text-discord-red text-xs font-bold flex items-center gap-1 bg-discord-red/10 px-2 py-1 rounded">
                 <AlertCircle className="w-3 h-3" /> Invalid Webhook
               </span>
            ) : (
                config.url && <span className="text-discord-green text-xs font-bold flex items-center gap-1 bg-discord-green/10 px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3" /> Connected
              </span>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full">
          
          {/* Live Preview */}
          <section className="mb-8">
            <h2 className="text-sm font-bold text-discord-text-muted uppercase tracking-wide mb-3">Live Preview</h2>
            <Preview 
              content={content} 
              username={config.username} 
              avatarUrl={config.avatarUrl}
            />
          </section>

          {/* Editor */}
          <section className="mb-8">
             <div className="flex justify-between items-end mb-2">
               <h2 className="text-sm font-bold text-discord-text-muted uppercase tracking-wide">Message Content</h2>
                {isThinking && (
                  <span className="text-xs text-discord-blurple animate-pulse flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI is rewriting...
                  </span>
                )}
             </div>
             
             <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-40 bg-discord-element text-discord-text p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blurple transition-all resize-none border border-transparent shadow-inner"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                    <div className="group relative">
                        <button 
                          className="p-2 bg-discord-bg hover:bg-discord-blurple text-discord-text-muted hover:text-white rounded-full transition-colors border border-discord-divider"
                          title="Refine with AI"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        {/* AI Dropdown */}
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-discord-element border border-discord-divider rounded-md shadow-xl overflow-hidden hidden group-hover:block z-50">
                            <div className="p-2 bg-discord-sidebar text-xs font-bold text-discord-text-muted uppercase">Refine Tone</div>
                            {Object.values(AIStyle).map((style) => (
                                <button
                                    key={style}
                                    onClick={() => handleAIRefine(style)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-discord-blurple hover:text-white transition-colors"
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
             </div>

             <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
               {/* Feedback Message */}
               <div className="flex-1 text-sm font-medium min-h-[20px]">
                 {feedback && (
                   <span className={`flex items-center gap-2 ${feedback.type === 'success' ? 'text-discord-green' : 'text-discord-red'}`}>
                      {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {feedback.message}
                   </span>
                 )}
               </div>

               <button
                  onClick={handleSend}
                  disabled={isSending || !content.trim() || urlError || !config.url}
                  className={`
                    flex items-center justify-center gap-2 px-6 py-2.5 rounded font-medium transition-all w-full sm:w-auto
                    ${isSending || !content.trim() || urlError || !config.url
                      ? 'bg-discord-element text-discord-text-muted cursor-not-allowed opacity-50' 
                      : 'bg-discord-blurple hover:bg-discord-blurple-hover text-white shadow-lg active:transform active:scale-95'}
                  `}
               >
                 {isSending ? (
                   <RefreshCcw className="w-4 h-4 animate-spin" />
                 ) : (
                   <Send className="w-4 h-4" />
                 )}
                 {isSending ? 'Sending...' : 'Send Message'}
               </button>
             </div>
          </section>

          {/* History */}
          {history.length > 0 && (
            <section className="border-t border-discord-divider pt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-discord-text-muted uppercase tracking-wide">Recent History</h2>
                <button 
                  onClick={clearHistory}
                  className="text-xs text-discord-red hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear History
                </button>
              </div>
              
              <div className="space-y-2">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setContent(item.content)}
                    className="bg-discord-element p-3 rounded border border-discord-divider hover:border-discord-blurple/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-discord-text-muted">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-discord-green/20 text-discord-green">
                        Sent
                      </span>
                    </div>
                    <p className="text-sm text-discord-text line-clamp-2">{item.content}</p>
                    <div className="text-xs text-discord-blurple mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to load content
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;
