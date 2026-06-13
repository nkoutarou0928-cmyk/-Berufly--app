import React, { useRef, useEffect, useState } from 'react';
import { X, Send, Bot, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

interface BeruDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeruDrawer: React.FC<BeruDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    state: { companies, todos, selfAnalysis, profile } 
  } = useApp();

  // Create the RAG context string
  const ragContext = {
    profile: profile,
    companies: companies.slice(0, 50).map(c => ({
      name: c.name,
      status: c.status,
      deadline: c.deadline,
      memo: c.memo
    })),
    todos: todos.filter(t => !t.completed).slice(0, 20).map(t => ({
      text: t.text,
      deadline: t.deadline
    })),
    selfAnalysis: selfAnalysis
  };

  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          ragContext
        })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let assistantMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: '' };
      
      setMessages((prev) => [...prev, assistantMsg]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantMsg.content += value;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg };
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: 'エラーが発生しました。( ；∀；) もう一度試してみてね！' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg"
                >
                  <Bot size={24} />
                </motion.div>
                <div>
                  <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    就活相談AI ベル <span className="text-xl">🔔</span>
                  </h2>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    (🔔 * ॑꒳ ॑* ) いつでも相談してね！
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-white/50 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center"
                  >
                    <Bot size={40} className="text-indigo-500" />
                  </motion.div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm max-w-[250px]">
                    ESの書き方、面接対策、気になる企業のことなど、なんでも聞いてね！
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                    }`}
                  >
                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex gap-1.5 items-center h-5">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              {messages.length > 0 && (
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {messages.length} messages
                  </span>
                  <button
                    onClick={() => setMessages([])}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    Clear Chat
                  </button>
                </div>
              )}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1 pl-4 border border-transparent focus-within:border-indigo-300 dark:focus-within:border-indigo-600 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="ベルに相談してみる..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 dark:text-white py-2"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full transition-colors flex-shrink-0 shadow-md"
                >
                  <Send size={18} className={isLoading ? "opacity-50" : ""} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
