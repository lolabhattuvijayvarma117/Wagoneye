import { useState } from 'react';
import { Send, Bot, User, Sparkles, FileText, Database } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  sources?: { type: string; title: string }[];
}

const suggestions = [
  "How many bags were unloaded from wagon WG-1102 yesterday?",
  "What was the peak load time this week?",
  "Show me the incident report for WG-3391",
  "Are there any active wagons currently delayed?"
];

export default function AskAI() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I am your WagonEye assistant. I can help you query logistics data, summarize reports, or check the status of specific wagons. How can I help you today?'
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), type: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Based on the records from yesterday, wagon WG-1102 was unloaded starting at 14:30 and finishing at 16:15. A total of **890 bags** were unloaded. The computer vision model maintained a 99.8% confidence score throughout the session.`,
        sources: [
          { type: 'database', title: 'WG-1102 Session Logs (Oct 25)' },
          { type: 'report', title: 'Daily Summary: Oct 25' }
        ]
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
        <div className="p-2 bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-lg">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">WagonEye Intelligence</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ask questions about your logistics data in natural language</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-4 max-w-3xl", msg.type === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              msg.type === 'user' ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" : "bg-brand-600 text-white"
            )}>
              {msg.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={cn(
              "flex flex-col gap-2 text-sm",
              msg.type === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-3 rounded-2xl",
                msg.type === 'user' 
                  ? "bg-brand-600 text-white rounded-tr-sm" 
                  : "bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 rounded-tl-sm"
              )}>
                {msg.content}
              </div>
              
              {/* Sources */}
              {msg.sources && (
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                    Sources:
                  </span>
                  {msg.sources.map((src, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                      {src.type === 'report' ? <FileText className="w-3 h-3 text-brand-500" /> : <Database className="w-3 h-3 text-amber-500" />}
                      {src.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mb-4 flex flex-wrap gap-2 max-w-4xl mx-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(suggestion)}
              className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-brand-500" />
              {suggestion}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about wagons, reports, or anomalies..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white transition-shadow"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="absolute right-2 top-2 p-1.5 text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
