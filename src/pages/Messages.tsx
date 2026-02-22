import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search, Send, Building2, MoreVertical,
    Loader, MessageSquare, Clock,
    CheckCircle2, Info, ArrowLeft, Check, CheckCheck, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
    getConversations, getConversationMessages, sendMessage, markMessagesAsRead,
    type Conversation, type Message
} from '../lib/db';

const Messages = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const partnerIdParam = searchParams.get('partnerId');

    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [myId, setMyId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isChatStarted, setIsChatStarted] = useState(false);

    // Deal Done Modal State
    const [showDealModal, setShowDealModal] = useState(false);
    const [dealForm, setDealForm] = useState({ material: '', amount: '', price: '', notes: '' });

    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setMyId(user.id);

            const convs = await getConversations();
            setConversations(convs);

            if (partnerIdParam) {
                const existing = convs.find(c => c.partner_id === partnerIdParam);
                if (existing) {
                    setSelectedPartner(existing);
                } else {
                    // Start new conversation if partner found in DB
                    const { data: partnerComp } = await supabase
                        .from('companies')
                        .select('id, company_name')
                        .eq('id', partnerIdParam)
                        .single();

                    if (partnerComp) {
                        const newConv: Conversation = {
                            partner_id: partnerComp.id,
                            partner_name: partnerComp.company_name,
                            last_message: '',
                            last_message_at: new Date().toISOString(),
                            unread_count: 0
                        };
                        setSelectedPartner(newConv);
                        setConversations(prev => [newConv, ...prev]);
                    }
                }
            }
            setLoading(false);
        };
        init();
    }, [partnerIdParam]);

    // Load messages when partner changes
    useEffect(() => {
        setIsChatStarted(false);
        if (!selectedPartner) return;

        const loadMsgs = async () => {
            const msgs = await getConversationMessages(selectedPartner.partner_id);
            setMessages(msgs);
            // Mark as read when opened
            await markMessagesAsRead(selectedPartner.partner_id);
            // Update sidebar unread count locally
            setConversations(prev => prev.map(c =>
                c.partner_id === selectedPartner.partner_id ? { ...c, unread_count: 0 } : c
            ));
        };
        loadMsgs();

        // Subscribe to real-time chat (both INSERT and UPDATE for read status)
        const channel = supabase
            .channel(`chat-partner-${selectedPartner.partner_id}`)
            .on('postgres_changes', {
                event: '*', // Listen to all changes
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                const msg = (payload.new || payload.old) as Message;

                // Only handle if it belongs to this conversation
                const isRelevant = (msg.sender_id === selectedPartner.partner_id && msg.receiver_id === myId) ||
                    (msg.sender_id === myId && msg.receiver_id === selectedPartner.partner_id);

                if (!isRelevant) return;

                if (payload.eventType === 'INSERT') {
                    setMessages(prev => {
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });

                    // If we are the receiver, mark as read immediately
                    if (msg.receiver_id === myId) {
                        await markMessagesAsRead(selectedPartner.partner_id);
                    }
                } else if (payload.eventType === 'UPDATE') {
                    // Update read status in local state
                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: msg.is_read } : m));

                    // Update sidebar last message status if needed
                    const updatedConvs = await getConversations();
                    setConversations(updatedConvs);
                }
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [selectedPartner, myId]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner || sending) return;

        setSending(true);
        const { error } = await sendMessage({
            receiver_id: selectedPartner.partner_id,
            content: newMessage.trim(),
            opportunity_id: searchParams.get('oppId') ?? undefined
        });

        if (!error) {
            setNewMessage('');
            // Refresh conversation list to show latest message
            const updated = await getConversations();
            setConversations(updated);
        }
        setSending(false);
    };

    const filteredConvs = conversations.filter(c =>
        c.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-surface-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="animate-spin text-brand-500" size={32} />
                    <p className="text-[14px] font-bold text-surface-400">Restoring Encrypted Chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex bg-white overflow-hidden animate-fade-in">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-[380px] border-r border-surface-100 flex flex-col bg-surface-50/20 ${selectedPartner ? 'hidden md:flex' : 'flex'}`}>
                {/* Search Header */}
                <div className="p-4 bg-white border-b border-surface-100">
                    <h2 className="text-[20px] font-extrabold text-surface-900 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-300" size={16} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-10 pr-4 py-2 text-[14px] focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/5 transition-all"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConvs.length === 0 ? (
                        <div className="p-8 text-center mt-10">
                            <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
                                <MessageSquare size={20} className="text-surface-300" />
                            </div>
                            <p className="text-[14px] font-bold text-surface-900">No chats yet</p>
                            <p className="text-[12px] text-surface-400 mt-1 font-medium">Start a conversation from the Marketplace or Opportunities tab.</p>
                        </div>
                    ) : (
                        filteredConvs.map((conv) => (
                            <button
                                key={conv.partner_id}
                                onClick={() => {
                                    setSelectedPartner(conv);
                                    setSearchParams({ partnerId: conv.partner_id });
                                }}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-all border-b border-surface-50 ${selectedPartner?.partner_id === conv.partner_id ? 'bg-white shadow-[inset_4px_0_0_#10B981]' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center text-surface-400 font-bold shrink-0">
                                    <Building2 size={20} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-[14px] font-bold text-surface-900 truncate">{conv.partner_name}</p>
                                        <p className="text-[10px] font-bold text-surface-400">{new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[12px] text-surface-500 font-medium truncate max-w-[200px]">{conv.last_message || 'No messages yet'}</p>
                                        {conv.unread_count > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-[#F9FBFC] ${!selectedPartner ? 'hidden md:flex' : 'flex'}`}>
                {selectedPartner ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-surface-100 shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedPartner(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-surface-50 rounded-lg"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                                    <Building2 size={18} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-extrabold text-surface-900">{selectedPartner.partner_name}</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[11px] text-surface-400 font-bold uppercase tracking-wider">Trading Partner</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>

                            {messages.map((msg, i) => {
                                const isMine = msg.sender_id === myId;
                                const showTimestamp = i === 0 ||
                                    (new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 300000);

                                return (
                                    <div key={msg.id} className="space-y-1">
                                        {showTimestamp && (
                                            <div className="flex justify-center my-4">
                                                <span className="text-[10px] font-extrabold text-surface-300 uppercase tracking-widest bg-white px-2 py-1 rounded-lg">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[14px] shadow-sm transform transition-all hover:scale-[1.01] ${isMine
                                                ? 'bg-brand-500 text-white rounded-tr-none'
                                                : 'bg-white border border-surface-200 text-surface-900 rounded-tl-none'
                                                }`}>
                                                <p className="font-medium whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMine && (
                                                        <div className="flex items-center ml-0.5">
                                                            {msg.is_read ? (
                                                                <CheckCheck size={12} className="text-white" />
                                                            ) : (
                                                                <Check size={12} className="text-white/60" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-surface-100">
                            <div className="flex items-center gap-2 mb-3">
                                {!(messages.length > 0 || isChatStarted) ? (
                                    <button
                                        onClick={() => setIsChatStarted(true)}
                                        className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl text-[12px] font-bold transition-colors"
                                    >
                                        Let's Talk
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowDealModal(true)}
                                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-[12px] font-bold transition-colors shadow-sm shadow-brand-500/20 flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 size={14} /> Deal Done
                                    </button>
                                )}
                            </div>
                            <form onSubmit={handleSend} className="relative flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        disabled={!(messages.length > 0 || isChatStarted)}
                                        rows={1}
                                        placeholder={(messages.length > 0 || isChatStarted) ? "Type your message..." : "Click 'Let's Talk' to initiate the conversation."}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend(e as any);
                                            }
                                        }}
                                        className={`w-full bg-surface-50 border border-surface-200 rounded-2xl pl-4 pr-4 py-3 text-[14px] focus:outline-none focus:border-brand-400 transition-all resize-none max-h-[200px] ${!(messages.length > 0 || isChatStarted) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {sending ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                        <div className="w-24 h-24 rounded-3xl bg-surface-50 flex items-center justify-center mb-6">
                            <MessageSquare size={40} className="text-surface-200" />
                        </div>
                        <h2 className="text-[24px] font-extrabold text-surface-900 mb-2">MOLE Secure Messaging</h2>
                        <p className="text-[15px] text-surface-400 max-w-[400px] font-medium leading-relaxed">
                            Connect with verified sellers and buyers to negotiate volume, pricing, and logistics for industrial circularity.
                        </p>
                        <div className="mt-8 flex items-center gap-8 opacity-40">
                            <div className="flex flex-col items-center gap-1">
                                <CheckCircle2 size={24} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Clock size={24} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Real-time</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Building2 size={24} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Compliant</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showDealModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-surface-200/60 overflow-hidden">
                        <div className="px-6 py-4 border-b border-surface-100 flex justify-between items-center bg-surface-50">
                            <h3 className="text-[16px] font-bold text-surface-900">Finalize Deal Parameters</h3>
                            <button onClick={() => setShowDealModal(false)} className="text-surface-400 hover:text-surface-600 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const msgText = `**DEAL FINALIZED**\n• Material: ${dealForm.material}\n• Amount: ${dealForm.amount}\n• Price: ${dealForm.price}\n• Notes: ${dealForm.notes || 'N/A'}\n\nLet's arrange the logistics!`;
                            setNewMessage(prev => prev ? prev + '\n\n' + msgText : msgText);
                            setShowDealModal(false);
                            setDealForm({ material: '', amount: '', price: '', notes: '' }); // Reset
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[12px] font-bold text-surface-700 uppercase tracking-wide mb-1.5">Material</label>
                                <input required placeholder="e.g. Steel Scrap" type="text" value={dealForm.material} onChange={e => setDealForm(prev => ({ ...prev, material: e.target.value }))} className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-brand-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-bold text-surface-700 uppercase tracking-wide mb-1.5">Amount / Volume</label>
                                    <input required placeholder="e.g. 5 Tons" type="text" value={dealForm.amount} onChange={e => setDealForm(prev => ({ ...prev, amount: e.target.value }))} className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-brand-400" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-surface-700 uppercase tracking-wide mb-1.5">Price Agreed</label>
                                    <input required placeholder="e.g. ₹50,000" type="text" value={dealForm.price} onChange={e => setDealForm(prev => ({ ...prev, price: e.target.value }))} className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-brand-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-surface-700 uppercase tracking-wide mb-1.5">Additional Notes</label>
                                <textarea placeholder="Delivery terms, specifics..." rows={2} value={dealForm.notes} onChange={e => setDealForm(prev => ({ ...prev, notes: e.target.value }))} className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-brand-400 resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowDealModal(false)} className="flex-1 py-2.5 text-[13px] font-bold text-surface-600 bg-surface-50 border border-surface-200 hover:bg-surface-100 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-sm shadow-brand-500/20">Draft Agreement</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;

