import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Package, MessageSquare } from 'lucide-react';
import { getAllWasteListings, type WasteListingPublic } from '../lib/db';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    listings?: WasteListingPublic[];
}

const initialMessages: ChatMessage[] = [
    {
        id: '1',
        text: 'Hello! I am your AI assistant for the waste management platform. I can help you find sellers, provide information about projects, or answer questions about materials. How can I assist you today?',
        sender: 'bot'
    }
];

const AIChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [input, setInput] = useState('');
    const [allListings, setAllListings] = useState<WasteListingPublic[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        getAllWasteListings(100).then(res => setAllListings(res));
    }, []);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        const userMsg: ChatMessage = { id: Date.now().toString(), text: userText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate bot response
        setTimeout(() => {
            let botReply = "I'm looking into that for you. As an AI assistant, I can connect you with sellers or analyze your project needs.";
            let matchedListings: WasteListingPublic[] = [];

            const lowerInput = userText.toLowerCase();

            if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                botReply = "Hi there! Feel free to ask me anything related to industrial waste sourcing and sales.";
            } else if (lowerInput.includes('saw dust') || lowerInput.includes('sawdust')) {
                botReply = "Sawdust is highly versatile! You can generate several valuable products from it, including: \n1. Particleboard and MDF for furniture.\n2. Biomass fuel briquettes or pellets.\n3. Animal bedding and agricultural compost.\n4. Wood pulp for certain paper products.";
            } else if (lowerInput.includes('plastic') && (lowerInput.includes('generate') || lowerInput.includes('make') || lowerInput.includes('do with'))) {
                botReply = "Plastic waste can be recycled into various items such as:\n1. Recycled PET pellets for new bottles or packaging.\n2. Synthetic fibers for clothing (like polyester).\n3. Eco-bricks or construction materials.\n4. 3D printing filament.";
            } else if (lowerInput.includes('generate') || lowerInput.includes('make') || lowerInput.includes('do with')) {
                botReply = "That depends heavily on the material! For instance, organic waste can be turned into biogas or compost, while metals can be smelted down endlessly without losing quality. Could you specify which waste material you have in mind?";
            } else if (lowerInput.includes('project') || lowerInput.includes('info')) {
                botReply = "Your current project involves sourcing secondary materials to reduce carbon footprint. Reusing industrial waste can save up to 45% in operational costs.";
            } else {
                // Try to find material matches
                const searchKeywords = lowerInput.replace(/buy|seller|find|need|want/g, '').trim().split(' ').filter(w => w.length > 2);

                matchedListings = allListings.filter(l => {
                    const materialStr = `${l.waste_type} ${l.description || ''}`.toLowerCase();
                    return searchKeywords.some(kw => materialStr.includes(kw));
                });

                // Sort by price if possible
                matchedListings.sort((a, b) => (a.price_per_unit || Infinity) - (b.price_per_unit || Infinity));

                // Limit to top 3
                matchedListings = matchedListings.slice(0, 3);

                if (matchedListings.length > 0) {
                    botReply = "I found some potential sellers for you based on material, location, and price. Here are the top matches:";
                } else {
                    botReply = "I couldn't find any exact matches for that right now. Could you provide a different material name or specify the type of waste you're looking for?";
                }
            }

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: botReply,
                sender: 'bot',
                listings: matchedListings.length > 0 ? matchedListings : undefined
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <div className="p-6 lg:p-8 max-w-[1000px] mx-auto animate-fade-in h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-md">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        AI Assistant
                    </h1>
                    <p className="text-surface-400 text-[15px] font-medium mt-1">
                        Find sellers, get project info, and more.
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white border border-surface-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-surface-100 text-surface-600' : 'bg-brand-50 text-brand-600'}`}>
                                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className="flex flex-col gap-2 max-w-[80%]">
                                <div className={`rounded-2xl p-4 text-[14px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-brand-500 text-white rounded-tr-sm' : 'bg-surface-50 text-surface-800 rounded-tl-sm border border-surface-100'}`}>
                                    {msg.text}
                                </div>
                                {msg.listings && (
                                    <div className="flex flex-col gap-3 mt-2">
                                        {msg.listings.map(listing => (
                                            <div key={listing.id} className="bg-white border text-left border-surface-200 rounded-xl p-4 shadow-sm hover:border-brand-300 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-[15px] text-surface-900 capitalize flex items-center gap-2">
                                                            <Package size={16} className="text-brand-500" />
                                                            {listing.waste_type.replace(/_/g, ' ')}
                                                        </h4>
                                                        <p className="text-[12px] text-surface-500 font-medium">{listing.companies?.company_name || 'Verified Seller'}</p>
                                                    </div>
                                                    {listing.price_per_unit != null && (
                                                        <span className="bg-emerald-50 text-emerald-700 text-[12px] font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                                                            ₹{listing.price_per_unit} / {listing.unit}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-[12px] text-surface-500 font-medium mb-4">
                                                    <span className="flex items-center gap-1"><MapPin size={13} /> {listing.listing_location || listing.companies?.location || 'Unknown'}</span>
                                                    <span>•</span>
                                                    <span>{listing.quantity} {listing.unit}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{listing.frequency}</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/app/messages?partnerId=${listing.company_id}`)}
                                                    className="w-full flex items-center justify-center gap-2 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-[13px] transition-colors"
                                                >
                                                    <MessageSquare size={14} />
                                                    Chat with Seller
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-surface-100 relative z-10">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="w-full bg-surface-50 border border-surface-200 rounded-2xl pl-4 pr-14 py-3.5 text-[15px] font-medium text-surface-900 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:bg-surface-200 disabled:text-surface-400 text-white rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
