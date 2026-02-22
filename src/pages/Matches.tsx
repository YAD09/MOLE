import { useState, useEffect } from 'react';
import {
    Leaf, DollarSign, MapPin, Target, Zap, Activity, ArrowRight,
    Sparkles, CheckCircle2, AlertTriangle, Eye, Package,
    Factory, Clock, ChevronRight, Recycle, Search,
    BarChart3, TrendingUp, Layers, Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getMyOpportunities, getMyWasteListings, type Opportunity, type WasteListing } from '../lib/db';

/* ─── Score Ring ─── */
const ScoreRing = ({ score, size = 60, strokeWidth = 5 }: { score: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 90 ? '#10B981' : score >= 75 ? '#059669' : score >= 50 ? '#F59E0B' : '#EF4444';
    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F5F5F7" strokeWidth={strokeWidth} />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                className="transition-all duration-1000 ease-out" />
            <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
                className="fill-surface-900 font-black text-[16px] transform rotate-90"
                style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}>{score}</text>
        </svg>
    );
};



/* ═══════════════════════════════════════════════════
   MAIN MATCHES COMPONENT
═══════════════════════════════════════════════════ */
const Matches = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showMarketplace, setShowMarketplace] = useState(false);

    /* ── Load accepted opportunities as "AI Matches" ── */
    const loadData = async () => {
        setLoading(true);
        // Show accepted (confirmed) deals as matches; fall back to active if none
        let data = await getMyOpportunities('accepted');
        if (data.length === 0) data = await getMyOpportunities('active');
        setOpportunities(data);
        if (data.length > 0) setSelectedId(data[0].id);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        const channel = supabase
            .channel('matches-rt')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, loadData)
            .subscribe();
        return () => { channel.unsubscribe(); };
    }, []);

    const selected = opportunities.find(o => o.id === selectedId) ?? opportunities[0];
    const noMatches = !loading && opportunities.length === 0;

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <Loader size={32} className="text-surface-300 animate-spin" />
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in">

            {/* ─── Header ─── */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-[28px] font-bold tracking-tight text-surface-900 flex items-center gap-3">
                        <span className="p-2 bg-brand-50 rounded-xl border border-brand-100">
                            <Sparkles size={20} className="text-brand-600" />
                        </span>
                        AI Match Results
                        {!noMatches && (
                            <span className="bg-brand-50 text-brand-700 text-[12px] px-2.5 py-1 rounded-full border border-brand-200 font-bold">
                                {opportunities.length} {opportunities.length === 1 ? 'Pathway' : 'Pathways'} Found
                            </span>
                        )}
                    </h1>
                    <p className="text-surface-500 mt-1.5 text-[14px] font-medium">
                        {noMatches
                            ? 'No matches yet. Accept opportunities to see them here.'
                            : `${opportunities.length} circular economy pathway${opportunities.length !== 1 ? 's' : ''} matched to your waste streams.`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowMarketplace(!showMarketplace)}
                        className="text-[13px] font-semibold text-surface-600 bg-white border border-surface-200 hover:bg-surface-50 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all">
                        <Eye size={15} /> Waste Marketplace
                    </button>
                    <button onClick={() => navigate('/app/list-waste')}
                        className="text-[13px] font-semibold text-surface-600 bg-white border border-surface-200 hover:bg-surface-50 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all">
                        <Activity size={15} className="text-brand-500" /> New Listing
                    </button>
                </div>
            </div>

            {/* ─── No Matches Empty State ─── */}
            {noMatches && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                    <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
                    <h3 className="text-[18px] font-bold text-amber-900 mb-2">No AI Matches Yet</h3>
                    <p className="text-[14px] text-amber-800/70 max-w-md mx-auto mb-6">
                        List your waste streams and browse opportunities. Accept an opportunity to see it appear here as a confirmed match pathway.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => navigate('/app/opportunities')}
                            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all">
                            View Opportunities <ArrowRight size={14} />
                        </button>
                        <button onClick={() => navigate('/app/list-waste')}
                            className="px-6 py-3 bg-white text-surface-700 font-bold rounded-xl border border-surface-200 flex items-center gap-2 transition-all">
                            List Waste <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Match Results ─── */}
            {!noMatches && !showMarketplace && (
                <div className="flex gap-6 min-h-[calc(100vh-280px)]">

                    {/* Left: Match Cards */}
                    <div className="w-[380px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar shrink-0">
                        {opportunities.map((opp, idx) => (
                            <div key={opp.id} onClick={() => setSelectedId(opp.id)}
                                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative group ${selectedId === opp.id
                                    ? 'bg-white border-brand-500/40 shadow-[0_8px_30px_rgba(16,185,129,0.1)] scale-[1.01]'
                                    : 'bg-white border-surface-200 hover:border-surface-300 hover:shadow-card'}`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="font-bold text-[15px] text-surface-900 leading-tight truncate">{opp.title}</h3>
                                        <p className="text-[12px] font-medium text-surface-400 mt-0.5">{opp.material_from} → {opp.material_to}</p>
                                    </div>
                                    <ScoreRing score={Math.round(opp.compatibility_score)} size={52} strokeWidth={4} />
                                </div>

                                {/* Material tag */}
                                <p className="text-[13px] font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100 mb-3 flex items-center gap-1.5 truncate">
                                    <Recycle size={13} /> {opp.material_from} → {opp.material_to}
                                </p>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {opp.is_urgent && <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100">🔥 Hot Deal</span>}
                                    {opp.compatibility_score >= 95 && <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md border border-brand-100">Top Pick</span>}
                                    {opp.certifications?.map(c => (
                                        <span key={c} className="text-[10px] font-bold bg-surface-50 text-surface-600 px-2 py-0.5 rounded-md border border-surface-200">{c}</span>
                                    ))}
                                </div>

                                {/* Stats */}
                                <div className="flex justify-between text-[12px] font-semibold text-surface-500 pt-3 border-t border-surface-100">
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {opp.distance_km ? `${opp.distance_km} km` : '—'}</span>
                                    <span className="flex items-center gap-1 text-brand-600"><DollarSign size={12} /> ₹{(opp.cost_savings / 1000).toFixed(0)}K</span>
                                    <span className="flex items-center gap-1 text-blue-600"><Leaf size={12} /> {(opp.co2_saved_kg / 1000).toFixed(1)} MT</span>
                                </div>
                            </div>
                        ))}

                        <button onClick={() => setShowMarketplace(true)}
                            className="p-4 rounded-2xl border-2 border-dashed border-surface-200 hover:border-brand-300 bg-surface-50 hover:bg-brand-50/30 text-center transition-all group">
                            <Eye size={20} className="mx-auto text-surface-400 group-hover:text-brand-500 mb-2" />
                            <p className="text-[13px] font-semibold text-surface-600 group-hover:text-brand-700">Browse Waste Marketplace</p>
                            <p className="text-[11px] text-surface-400 mt-0.5">View all listed waste & materials</p>
                        </button>
                    </div>

                    {/* Right: Detail Panel */}
                    {selected && (
                        <div className="flex-1 bg-white border border-surface-200 rounded-[24px] shadow-card flex flex-col overflow-hidden">
                            <div className="p-8 border-b border-surface-100 bg-gradient-to-br from-white to-surface-50/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="p-2.5 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
                                                <Target size={22} />
                                            </span>
                                            <div>
                                                <h2 className="text-[22px] font-bold text-surface-900 tracking-tight">{selected.title}</h2>
                                                <p className="text-[13px] font-medium text-surface-500">{selected.material_from} → {selected.material_to}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right bg-white p-3 rounded-xl border border-surface-200 shadow-sm">
                                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-0.5">Match</p>
                                        <div className="text-3xl font-black text-brand-600 leading-none">{Math.round(selected.compatibility_score)}%</div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-5 flex-wrap">
                                    {selected.distance_km && (
                                        <div className="flex items-center gap-2 bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                                            <MapPin size={14} className="text-surface-400" />
                                            <span className="text-[13px] font-semibold text-surface-700">{selected.distance_km} km</span>
                                        </div>
                                    )}
                                    {selected.volume && (
                                        <div className="flex items-center gap-2 bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                                            <Package size={14} className="text-surface-400" />
                                            <span className="text-[13px] font-semibold text-surface-700">{selected.volume}</span>
                                        </div>
                                    )}
                                    {selected.time_to_close && (
                                        <div className="flex items-center gap-2 bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                                            <Clock size={14} className="text-surface-400" />
                                            <span className="text-[13px] font-semibold text-surface-700">{selected.time_to_close}</span>
                                        </div>
                                    )}
                                    {selected.is_urgent && (
                                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                            <Zap size={14} className="text-amber-500" />
                                            <span className="text-[13px] font-semibold text-amber-700">Urgent Deal</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detail Body */}
                            <div className="p-8 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                                {/* Why This Match */}
                                {selected.why_match?.length > 0 && (
                                    <div>
                                        <h3 className="text-[12px] font-bold text-surface-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Zap size={14} className="text-brand-500" /> AI Logic Summary
                                        </h3>
                                        <div className="bg-brand-50 border border-brand-100 p-5 rounded-xl space-y-2">
                                            {selected.why_match.map((reason, i) => (
                                                <div key={i} className="flex items-start gap-2.5">
                                                    <CheckCircle2 size={14} className="text-brand-500 mt-0.5 shrink-0" />
                                                    <p className="text-[14px] text-surface-800 font-medium leading-relaxed">{reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Economics + Environment */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
                                        <div className="flex items-center gap-2 text-brand-600 mb-4 pb-3 border-b border-surface-100">
                                            <div className="p-1.5 bg-brand-50 rounded-lg"><DollarSign size={16} /></div>
                                            <h4 className="font-bold text-[15px] text-surface-900">Economic Output</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[13px] font-medium">
                                                <span className="text-surface-500">Cost Savings</span>
                                                <span className="text-brand-600 font-bold">₹{selected.cost_savings.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-[13px] font-medium">
                                                <span className="text-surface-500">vs Virgin Material</span>
                                                <span className="text-surface-900 font-bold">-{selected.cost_savings_pct}%</span>
                                            </div>
                                            {selected.estimated_roi && (
                                                <div className="flex justify-between text-[15px] font-black pt-3 border-t border-surface-100">
                                                    <span className="text-surface-900">Est. ROI</span>
                                                    <span className="text-brand-600">{selected.estimated_roi}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
                                        <div className="flex items-center gap-2 text-blue-600 mb-4 pb-3 border-b border-surface-100">
                                            <div className="p-1.5 bg-blue-50 rounded-lg"><Leaf size={16} /></div>
                                            <h4 className="font-bold text-[15px] text-surface-900">Impact Assessment</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[13px] font-medium">
                                                <span className="text-surface-500">CO₂ Avoided</span>
                                                <span className="text-blue-600 font-bold">{selected.co2_saved_kg.toLocaleString()} kg</span>
                                            </div>
                                            <div className="flex justify-between text-[13px] font-medium">
                                                <span className="text-surface-500">Energy Saved</span>
                                                <span className="text-surface-900 font-bold">{selected.energy_saved_pct}%</span>
                                            </div>
                                            {selected.water_saved_l > 0 && (
                                                <div className="flex justify-between text-[13px] font-medium">
                                                    <span className="text-surface-500">Water Saved</span>
                                                    <span className="text-surface-900 font-bold">{(selected.water_saved_l / 1000).toFixed(1)} KL</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-surface-200 bg-white flex justify-between items-center shrink-0">
                                <div className="flex gap-3">
                                    <button onClick={() => navigate('/app/analytics')}
                                        className="text-[13px] font-bold text-surface-500 hover:text-surface-900 bg-surface-50 hover:bg-surface-100 px-5 py-2.5 rounded-xl border border-surface-200 flex items-center gap-1.5 transition-all">
                                        <BarChart3 size={13} /> Analytics
                                    </button>
                                </div>
                                <button onClick={() => navigate('/app/simulate')}
                                    style={{ backgroundColor: '#1C1C1E', color: '#fff' }}
                                    className="hover:opacity-90 transition-all px-8 py-3 rounded-xl font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 group">
                                    Simulate Deal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Waste Marketplace ─── */}
            {showMarketplace && (
                <WasteMarketplace
                    onBack={() => setShowMarketplace(false)}
                    navigate={navigate}
                />
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   WASTE MARKETPLACE — Real Supabase data
═══════════════════════════════════════════════════ */
const WasteMarketplace = ({ onBack, navigate }: { onBack: () => void; navigate: (path: string) => void }) => {
    const [loading, setLoading] = useState(true);
    const [myListings, setMyListings] = useState<WasteListing[]>([]);
    const [allListings, setAllListings] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'own' | 'available'>('all');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            // Fetch my listings
            const mine = await getMyWasteListings();
            setMyListings(mine);

            // Fetch ALL listings (platform-wide — public read)
            const { data } = await supabase
                .from('waste_listings')
                .select('*, companies(company_name, location)')
                .order('created_at', { ascending: false })
                .limit(50);
            setAllListings(data ?? []);
            setLoading(false);
        };
        load();
    }, []);

    const myIds = new Set(myListings.map(l => l.id));

    const filtered = allListings
        .filter(w => {
            if (activeFilter === 'own') return myIds.has(w.id);
            if (activeFilter === 'available') return !myIds.has(w.id);
            return true;
        })
        .filter(w =>
            searchQuery === '' ||
            (w.waste_type ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (w.companies?.company_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (w.companies?.location ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button onClick={onBack}
                className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors">
                <ArrowRight size={14} className="rotate-180" /> Back to AI Match Results
            </button>

            {/* Filters & Search */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    {(['all', 'own', 'available'] as const).map(f => (
                        <button key={f} onClick={() => setActiveFilter(f)}
                            className={`text-[13px] font-semibold px-4 py-2 rounded-xl border transition-all ${activeFilter === f
                                ? 'text-white border-surface-900'
                                : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-50'}`}
                            style={activeFilter === f ? { backgroundColor: '#1C1C1E' } : {}}>
                            {f === 'all' ? 'All Listings' : f === 'own' ? 'My Listings' : 'Available Waste'}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input type="text" placeholder="Search waste, company..."
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="bg-white border border-surface-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-medium text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 w-[280px] transition-all" />
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { icon: Layers, color: 'from-blue-500 to-blue-600', value: allListings.length, label: 'Total Listed' },
                    { icon: CheckCircle2, color: 'from-brand-500 to-emerald-600', value: allListings.filter(w => !myIds.has(w.id)).length, label: 'Available' },
                    { icon: Factory, color: 'from-amber-500 to-orange-500', value: myListings.length, label: 'My Listings' },
                    { icon: TrendingUp, color: 'from-purple-500 to-violet-600', value: allListings.length - myListings.length, label: 'Network Items' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-surface-200 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                            <s.icon size={18} className="text-white" />
                        </div>
                        <div>
                            {loading ? <div className="h-5 w-8 bg-surface-100 rounded animate-pulse" /> : <p className="text-[20px] font-bold text-surface-900">{s.value}</p>}
                            <p className="text-[11px] font-semibold text-surface-400 uppercase">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_160px_140px_100px_100px_90px] gap-4 px-6 py-3.5 bg-surface-50 border-b border-surface-200 text-[11px] font-bold text-surface-400 uppercase tracking-widest">
                    <span>Waste Material</span><span>Company</span><span>Location</span><span>Quantity</span><span>Hazard</span><span>Action</span>
                </div>
                {loading && (
                    <div className="p-8 flex items-center justify-center">
                        <Loader size={24} className="text-surface-300 animate-spin" />
                    </div>
                )}
                {!loading && (
                    <div className="divide-y divide-surface-100">
                        {filtered.map(listing => {
                            const isOwn = myIds.has(listing.id);
                            return (
                                <div key={listing.id}
                                    className={`grid grid-cols-[1fr_160px_140px_100px_100px_90px] gap-4 px-6 py-4 items-center hover:bg-surface-50/50 transition-colors ${isOwn ? 'bg-brand-50/20' : ''}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isOwn ? 'bg-brand-50 border border-brand-100' : 'bg-surface-100 border border-surface-200'}`}>
                                            <Package size={16} className={isOwn ? 'text-brand-600' : 'text-surface-500'} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-bold text-surface-900 truncate capitalize flex items-center gap-1.5">
                                                {listing.waste_type?.replace(/-/g, ' ')}
                                                {isOwn && <span className="text-[9px] font-bold bg-brand-500 text-white px-1.5 py-0.5 rounded shrink-0">YOU</span>}
                                            </p>
                                            <p className="text-[11px] font-medium text-surface-400 capitalize">{listing.frequency} · {listing.condition}</p>
                                        </div>
                                    </div>
                                    <span className="text-[13px] font-medium text-surface-700 truncate">{listing.companies?.company_name ?? '—'}</span>
                                    <span className="text-[12px] font-medium text-surface-500 flex items-center gap-1 truncate">
                                        <MapPin size={11} className="shrink-0" /> {listing.companies?.location ?? listing.listing_location ?? '—'}
                                    </span>
                                    <span className="text-[13px] font-bold text-surface-900">{listing.quantity} {listing.unit}</span>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize text-center ${listing.hazard_level === 'non-hazardous' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                        {listing.hazard_level?.replace(/-/g, ' ')}
                                    </span>
                                    <button onClick={() => navigate(isOwn ? '/app/list-waste' : '/app/opportunities')}
                                        className="text-[12px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
                                        {isOwn ? 'Edit' : 'Match'} <ChevronRight size={13} />
                                    </button>
                                </div>
                            );
                        })}
                        {filtered.length === 0 && (
                            <div className="text-center py-12">
                                <Search size={32} className="mx-auto text-surface-300 mb-3" />
                                <p className="text-[15px] font-semibold text-surface-500">No listings match your search</p>
                                <p className="text-[13px] text-surface-400 mt-1">Try different keywords or remove filters</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2">
                <p className="text-[12px] text-surface-400 font-medium">
                    Showing {filtered.length} of {allListings.length} listings · Live from Supabase
                </p>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/app/opportunities')}
                        className="text-[13px] font-semibold text-surface-600 bg-white border border-surface-200 hover:bg-surface-50 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all">
                        <Sparkles size={14} className="text-brand-500" /> View Opportunities
                    </button>
                    <button onClick={() => navigate('/app/list-waste')}
                        style={{ backgroundColor: '#1C1C1E', color: '#fff' }}
                        className="text-[13px] font-semibold hover:opacity-90 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all">
                        List New Waste <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Matches;
