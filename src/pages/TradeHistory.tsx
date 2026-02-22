import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock, Package, MapPin, Leaf, MessageSquare,
    ArrowUpRight, Search,
    Calendar, TrendingUp, Building2, X
} from 'lucide-react';
import { getMyNetworkConnections, type NetworkConnection } from '../lib/db';
import { supabase } from '../lib/supabase';

const TradeHistory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState<NetworkConnection[]>([]);
    const [search, setSearch] = useState('');
    const [filterDirection, setFilterDirection] = useState<'all' | 'buy' | 'sell'>('all');
    const [myId, setMyId] = useState<string | null>(null);
    const [selectedDeal, setSelectedDeal] = useState<NetworkConnection | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setMyId(user.id);
            const conns = await getMyNetworkConnections();
            setConnections(conns);
            setLoading(false);
        };
        load();
    }, []);

    const filtered = connections.filter(c => {
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            (c.partner_name || '').toLowerCase().includes(q) ||
            (c.material_type || '').toLowerCase().includes(q);

        let matchesDir = true;
        if (filterDirection === 'buy') matchesDir = c.from_company_id === myId;
        if (filterDirection === 'sell') matchesDir = c.to_company_id === myId;

        return matchesSearch && matchesDir;
    });

    const totalCO2 = connections.reduce((s, c) => s + (c.co2_saved_kg || 0), 0);

    return (
        <div className="p-6 lg:p-8 max-w-[1480px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                            <Clock size={20} className="text-white" />
                        </div>
                        Trade History
                    </h1>
                    <p className="text-surface-400 text-[15px] font-medium mt-1">
                        Track your completed offers, accepted trades, and past industrial circularity deals.
                    </p>
                </div>

                <div className="flex gap-4 shrink-0">
                    <div className="bg-white px-5 py-2.5 rounded-xl border border-emerald-100 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <Leaf size={14} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Total CO₂ Saved</p>
                            <p className="text-[15px] font-extrabold text-emerald-600">{totalCO2.toLocaleString()} kg</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search partners or materials..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-surface-200 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex p-1 bg-surface-100/50 rounded-xl">
                        {['all', 'buy', 'sell'].map(dir => (
                            <button
                                key={dir}
                                onClick={() => setFilterDirection(dir as any)}
                                className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all capitalize ${filterDirection === dir
                                    ? 'bg-white text-brand-600 shadow-sm border border-surface-200/50'
                                    : 'text-surface-500 hover:text-surface-900 border border-transparent'}`}
                            >
                                {dir === 'all' ? 'All Roles' : dir === 'buy' ? 'Buying' : 'Selling'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white rounded-2xl border border-surface-200/60 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-surface-200/60 p-16 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-6">
                        <Package size={36} className="text-surface-200" />
                    </div>
                    <h3 className="text-[20px] font-extrabold text-surface-900 mb-2">No Trade History Found</h3>
                    <p className="text-[15px] text-surface-400 max-w-sm mx-auto mb-8">
                        Your transaction history will be populated here as you accept opportunities and complete trades.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((conn) => (
                        <div key={conn.id} className="bg-white rounded-2xl border border-surface-200/60 hover:border-brand-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all overflow-hidden group">
                            <div className="p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Partner Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest ${conn.connection_type === 'verified_partner' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {conn.connection_type.replace('_', ' ')}
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-surface-400">
                                            <Calendar size={12} />
                                            {new Date(conn.established_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-[18px] font-extrabold text-surface-900 flex items-center gap-2 mb-1 group-hover:text-brand-600 transition-colors">
                                        <Building2 size={18} className="text-surface-400" />
                                        {conn.partner_name || 'Counterparty'}
                                    </h3>
                                    <div className="flex items-center gap-4 text-[13px] text-surface-500 font-medium">
                                        <span className="flex items-center gap-1.5"><Package size={14} className="text-surface-300" /> {conn.material_type || 'Waste Flow'}</span>
                                        <span className="flex items-center gap-1.5 border-l border-surface-100 pl-4"><MapPin size={14} className="text-surface-300" /> {conn.partner_location || 'Remote'}</span>
                                    </div>
                                </div>

                                {/* Stats Column */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:w-[45%] shrink-0">
                                    <div className="bg-surface-50/50 rounded-xl p-3 border border-surface-100/50">
                                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest leading-none mb-1.5">Quantity</p>
                                        <p className="text-[15px] font-extrabold text-surface-900">{conn.volume_mt || 0} MT</p>
                                    </div>
                                    <div className="bg-emerald-50/30 rounded-xl p-3 border border-emerald-100/20">
                                        <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest leading-none mb-1.5">Impact</p>
                                        <p className="text-[15px] font-extrabold text-emerald-700 flex items-center gap-1">
                                            <Leaf size={13} /> {conn.co2_saved_kg}kg
                                        </p>
                                    </div>
                                    <div className="hidden md:block bg-blue-50/30 rounded-xl p-3 border border-blue-100/20">
                                        <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest leading-none mb-1.5">Efficiency</p>
                                        <p className="text-[15px] font-extrabold text-blue-700 flex items-center gap-1">
                                            <TrendingUp size={13} /> High
                                        </p>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="flex items-center gap-3 shrink-0 lg:ml-4">
                                    <button
                                        onClick={() => {
                                            const partnerId = conn.from_company_id === myId ? conn.to_company_id : conn.from_company_id;
                                            navigate(`/app/messages?partnerId=${partnerId}`);
                                        }}
                                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-[14px] font-bold transition-all shadow-md shadow-brand-500/10 active:scale-95"
                                    >
                                        <MessageSquare size={16} />
                                        Chat with Partner
                                    </button>
                                    <button
                                        onClick={() => setSelectedDeal(conn)}
                                        className="w-10 h-10 rounded-xl border border-surface-200 flex items-center justify-center text-surface-400 hover:text-brand-500 hover:border-brand-200 transition-colors cursor-pointer"
                                    >
                                        <ArrowUpRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Deal Details Modal */}
            {selectedDeal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-surface-200/60 overflow-hidden">
                        <div className="px-6 py-4 border-b border-surface-100 flex justify-between items-center bg-surface-50">
                            <h3 className="text-[16px] font-bold text-surface-900">Trade Details</h3>
                            <button onClick={() => setSelectedDeal(null)} className="text-surface-400 hover:text-surface-600 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-surface-100">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                                    <Package size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[18px] font-extrabold text-surface-900">{selectedDeal.partner_name || 'Counterparty'}</h4>
                                    <p className="text-[13px] font-medium text-surface-500">{selectedDeal.material_type || 'Waste Flow'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface-50/50 rounded-xl p-4 border border-surface-100/50">
                                    <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-1">Volume Exchanged</p>
                                    <p className="text-[16px] font-extrabold text-surface-900">{selectedDeal.volume_mt || 0} MT</p>
                                </div>
                                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                                    <p className="text-[11px] font-bold text-emerald-600/60 uppercase tracking-widest mb-1">Environmental Impact</p>
                                    <p className="text-[16px] font-extrabold text-emerald-700 flex items-center gap-1">
                                        <Leaf size={14} /> {selectedDeal.co2_saved_kg} kg CO₂ Saved
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100/50 border-l-[3px] border-l-brand-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-surface-400" />
                                        <span className="text-[13px] font-bold text-surface-700">Date Established</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-surface-900">{new Date(selectedDeal.established_at).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100/50 border-l-[3px] border-l-blue-400">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-surface-400" />
                                        <span className="text-[13px] font-bold text-surface-700">Location</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-surface-900">{selectedDeal.partner_location || 'Remote'}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100/50 border-l-[3px] border-l-amber-400">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={16} className="text-surface-400" />
                                        <span className="text-[13px] font-bold text-surface-700">Status</span>
                                    </div>
                                    <span className="text-[11px] font-extrabold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-md">Verified & Completed</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-surface-50 border-t border-surface-100 flex justify-end">
                            <button onClick={() => setSelectedDeal(null)} className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-[13px] font-bold transition-colors shadow-sm shadow-brand-500/20">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeHistory;
