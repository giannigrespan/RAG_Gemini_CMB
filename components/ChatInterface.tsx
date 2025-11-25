import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, User, StopCircle, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatInterfaceProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (text: string) => void;
    onClearChat: () => void;
    hasDocuments: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    messages, 
    isLoading, 
    onSendMessage, 
    onClearChat,
    hasDocuments 
}) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (!inputValue.trim() || isLoading) return;
        onSendMessage(inputValue);
        setInputValue('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 mt-20">
                            <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Inizia una conversazione con l'assistente.</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 border border-brand-200">
                                    <Bot className="w-5 h-5 text-brand-600" />
                                </div>
                            )}
                            
                            <div 
                                className={`
                                    max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm md:text-base leading-relaxed
                                    ${msg.role === 'user' 
                                        ? 'bg-brand-600 text-white rounded-tr-none' 
                                        : msg.isError 
                                            ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'}
                                `}
                            >
                                <div className="markdown-content">
                                    {msg.role === 'model' ? (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                </div>
                                <div className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-brand-100' : 'text-slate-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                             <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 border border-brand-200">
                                <Bot className="w-5 h-5 text-brand-600" />
                            </div>
                            <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4 md:p-6 z-10">
                <div className="max-w-3xl mx-auto flex flex-col gap-2">
                    {!hasDocuments && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 mb-2">
                            <UploadCloud className="w-4 h-4" />
                            Attenzione: La Knowledge Base è vuota. L'assistente non ha documenti da consultare.
                        </div>
                    )}
                    <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 rounded-2xl p-2 transition-all">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Chiedi qualcosa sui documenti..."
                            className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-2 text-slate-700 placeholder-slate-400"
                            rows={1}
                            style={{ height: 'auto', minHeight: '44px' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                            }}
                        />
                        <div className="flex flex-col gap-2 pb-1 pr-1">
                             <button 
                                onClick={handleSend}
                                disabled={isLoading || !inputValue.trim()}
                                className={`p-2 rounded-xl flex items-center justify-center transition-all duration-200
                                    ${isLoading || !inputValue.trim() 
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                        : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-200'}
                                `}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] text-slate-400">
                            Gemini 2.5 Flash • Knowledge Base Attiva
                        </p>
                        <button 
                            onClick={onClearChat}
                            className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" /> Cancella cronologia
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                .markdown-content ul { list-style-type: disc; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
                .markdown-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
                .markdown-content h1, .markdown-content h2, .markdown-content h3 { font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                .markdown-content p { margin-bottom: 0.5rem; }
                .markdown-content strong { font-weight: 600; color: inherit; }
                .markdown-content a { color: #0ea5e9; text-decoration: underline; }
            `}</style>
        </div>
    );
};