import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Shield, Terminal } from 'lucide-react';
import { api } from '../services/api';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export function ThreatHuntingPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: 'Hello! I am CyberShield AI. I have access to your system\'s security logs and vulnerability data. How can I assist you with threat hunting today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Send history excluding the very first welcome message if we want, 
            // but the backend handles history. We should send the conversation so far.
            // The backend expects "history" to NOT include the current message being sent in "message" field.
            // So we pass the *previous* messages.
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            const res = await api.chat(userMsg.content, history);

            const botMsg: Message = { role: 'model', content: res.response };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error processing your request.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-slate-900/80 flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <Bot size={24} />
                </div>
                <div>
                    <h2 className="font-semibold text-slate-100">AI Threat Hunter</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online & Connected to Security Data
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-1">
                                <Shield size={14} />
                            </div>
                        )}

                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                            }`}>
                            {msg.role === 'model' ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-1 last:mb-0">{line}</p>
                                    ))}
                                </div>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                                <User size={14} />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                            <Shield size={14} />
                        </div>
                        <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-slate-900/80">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about threats, logs, or vulnerabilities..."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {['Show recent critical alerts', 'Explain the last SQL injection', 'How do I fix the SCA issues?'].map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => { setInput(suggestion); }}
                            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 border border-white/5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors flex items-center gap-1"
                        >
                            <Terminal size={10} />
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
