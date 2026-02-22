import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendMessage, getMessages, type Message } from '../lib/db';

interface ChatModalProps {
    opportunityId: string;
    partnerId: string;
    partnerName: string;
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ opportunityId, partnerId, partnerName, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [myId, setMyId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setMyId(user.id);

            const msgs = await getMessages(opportunityId);
            setMessages(msgs);
            setLoading(false);
        };
        init();

        // Subscribe to real-time messages
        const channel = supabase
            .channel(`chat-${opportunityId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `opportunity_id=eq.${opportunityId}`
            }, (payload) => {
                const msg = payload.new as Message;
                setMessages(prev => {
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [opportunityId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const { error } = await sendMessage({
            receiver_id: partnerId,
            opportunity_id: opportunityId,
            content: newMessage.trim()
        });

        if (error) {
            console.error('Failed to send message:', error);
        } else {
            setNewMessage('');
        }
        setSending(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-surface-200/60 overflow-hidden flex flex-col h-[600px]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-surface-100 bg-gradient-to-r from-brand-50 to-emerald-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20">
                            <Building2 size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-[16px] font-bold text-surface-900">{partnerName}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                <p className="text-[12px] text-surface-500 font-medium">Negotiation Channel</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/80 transition-colors">
                        <X size={18} className="text-surface-400" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-50/30" ref={scrollRef}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <Loader size={24} className="animate-spin text-brand-500" />
                            <p className="text-[13px] text-surface-400 font-medium">Loading history...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60 px-10">
                            <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto">
                                <Send size={20} className="text-surface-300" />
                            </div>
                            <p className="text-[14px] font-bold text-surface-900">Start the conversation</p>
                            <p className="text-[13px] text-surface-500 font-medium">Discuss pricing, volume, logistics or quality details directly with {partnerName}.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMine = msg.sender_id === myId;
                            return (
                                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[14px] ${isMine
                                        ? 'bg-brand-500 text-white rounded-tr-none shadow-sm'
                                        : 'bg-white border border-surface-200 text-surface-900 rounded-tl-none shadow-sm'}`}>
                                        <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${isMine ? 'text-brand-100' : 'text-surface-400'} font-bold text-right`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-surface-100">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={`Message ${partnerName}...`}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-4 pr-12 py-3 text-[14px] text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 transition-all shadow-sm"
                        >
                            {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                    </div>
                    <p className="text-[11px] text-surface-400 mt-2 text-center font-medium italic">
                        All communications are recorded for compliance and verified carbon auditing.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ChatModal;
