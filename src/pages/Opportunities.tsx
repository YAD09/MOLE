import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Lightbulb, Building2, Package, Search,
    ChevronLeft, ChevronRight, MessageSquare, Send, X, AlertCircle, Loader, CheckCircle2
} from 'lucide-react';
import { getAllWasteListings, sendOffer, type WasteListingPublic } from '../lib/db';

const hazardColor = (h: string) =>
    h === 'non-hazardous'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
        : 'bg-amber-50 text-amber-600 border-amber-100';

/* ───────── OFFER FORM MODAL ───────── */
const OfferModal = ({ listing, onClose, onSuccess }: {
    listing: WasteListingPublic;
    onClose: () => void;
    onSuccess: (id: string) => void;
}) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        material_to: '',
        volume: String(listing.quantity),
        frequency: 'one-time',
        notes: ''
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const { error: err } = await sendOffer({
            waste_listing_id: listing.id,
            counterparty_id: listing.company_id,
            title: `Offer for ${listing.waste_type}`,
            material_from: listing.waste_type,
            material_to: form.material_to,
            volume: form.volume,
            frequency: form.frequency,
            notes: form.notes
        });

        if (err) {
            setError(err);
            setSubmitting(false);
        } else {
            onSuccess(listing.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-24 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-surface-200/60 overflow-hidden">
                <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
                    <div>
                        <h3 className="text-[16px] font-bold text-surface-900">Send Resource Offer</h3>
                        <p className="text-[12px] text-surface-500 font-medium">To: {listing.companies?.company_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-surface-400">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-brand-600 shrink-0">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-surface-900">{listing.waste_type}</p>
                            <p className="text-[11px] text-surface-500 font-medium">Available: {listing.quantity} {listing.unit}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-bold text-surface-700 uppercase tracking-wide mb-1.5">Intended Use / Product</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Recycled aggregate, Fuel component..."
                            value={form.material_to}
                            onChange={e => setForm(f => ({ ...f, material_to: e.target.value }))}
                            className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-[13px] text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[12px] font-bold text-surface-700 uppercase tracking-wide mb-1.5">Volume Needed</label>
                            <input
                                type="text"
                                value={form.volume}
                                onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                                className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-[13px] text-surface-900 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-surface-700 uppercase tracking-wide mb-1.5">Frequency</label>
                            <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                                className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-[13px] text-surface-900 font-medium focus:outline-none focus:border-brand-400 transition-all">
                                <option value="one-time">One-time</option>
                                <option value="recurring">Recurring</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-bold text-surface-700 uppercase tracking-wide mb-1.5">Message / Notes</label>
                        <textarea
                            rows={3}
                            placeholder="Describe your specific requirements, collection arrangements, quality standards..."
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-[13px] text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                            <p className="text-[13px] text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 text-[13px] font-bold text-surface-600 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="flex-1 py-2.5 text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/20">
                            {submitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                            {submitting ? 'Sending...' : 'Submit Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ITEMS_PER_PAGE = 6;

const Opportunities = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<WasteListingPublic[]>([]);
    const [search, setSearch] = useState('');
    const [filterHazard, setFilterHazard] = useState<'all' | 'non-hazardous' | 'hazardous'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const loadListings = async () => {
        setLoading(true);
        const data = await getAllWasteListings(100); // Fetch a good number for pagination
        setListings(data);
        setLoading(false);
    };

    useEffect(() => {
        loadListings();
    }, []);

    const filtered = listings.filter(l => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            l.waste_type.toLowerCase().includes(q) ||
            (l.companies?.company_name ?? '').toLowerCase().includes(q) ||
            (l.companies?.location ?? '').toLowerCase().includes(q) ||
            (l.description ?? '').toLowerCase().includes(q);
        const matchHazard = filterHazard === 'all' || l.hazard_level === filterHazard;
        return matchSearch && matchHazard;
    });

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    // Ensure current page is within bounds after filtering
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
        else if (currentPage === 0 && totalPages > 0) setCurrentPage(1);
    }, [filtered.length, totalPages, currentPage]);

    const paginatedListings = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const generatePageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="p-6 lg:p-8 max-w-[1480px] mx-auto animate-fade-in space-y-6">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-2">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Lightbulb size={20} className="text-white" />
                        </div>
                        <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900">Active Opportunities</h1>
                    </div>
                    <p className="text-surface-400 text-[15px] font-medium leading-relaxed max-w-2xl">
                        Browse all active materials listed on the platform. Connect with verified partners to find the resources you need.
                    </p>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" size={15} />
                    <input
                        type="text"
                        placeholder="Search materials, companies, or locations..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-white border border-surface-200 rounded-xl pl-10 pr-4 py-3 text-[14px] text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'non-hazardous', 'hazardous'].map(h => (
                        <button
                            key={h}
                            onClick={() => { setFilterHazard(h as any); setCurrentPage(1); }}
                            className={`px-5 py-3 text-[13px] font-bold rounded-xl border transition-all capitalize shadow-sm ${filterHazard === h ? 'bg-surface-900 text-white border-surface-900' : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'}`}
                        >
                            {h.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[240px] bg-white rounded-2xl border border-surface-200 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-surface-200 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-surface-50 mx-auto flex items-center justify-center mb-4">
                        <Search size={24} className="text-surface-300" />
                    </div>
                    <h3 className="text-[18px] font-bold text-surface-900 mb-2">No opportunities found</h3>
                    <p className="text-surface-500 text-[14px]">Try adjusting your search or filters to see more results.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginatedListings.map(listing => {
                        return (
                            <div key={listing.id} className="bg-white rounded-2xl border border-surface-200/60 overflow-hidden group hover:border-brand-200 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col">
                                <div className="p-5 flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center shrink-0 border border-surface-100 text-surface-400 ${hazardColor(listing.hazard_level)}`}>
                                            <Package size={22} />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border shadow-sm ${hazardColor(listing.hazard_level)}`}>
                                            {listing.hazard_level.replace('-', ' ')}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-[18px] font-bold text-surface-900 leading-tight mb-1.5 line-clamp-1">{listing.waste_type}</h4>
                                        <div className="flex text-surface-500 text-[13px] font-medium items-center gap-1.5">
                                            <Building2 size={14} className="text-surface-300" />
                                            {listing.companies?.company_name}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-surface-50 border border-surface-100/50 rounded-xl p-3">
                                            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Available</p>
                                            <p className="text-[15px] font-bold text-surface-900">{listing.quantity} {listing.unit}</p>
                                        </div>
                                        <div className="bg-surface-50 border border-surface-100/50 rounded-xl p-3">
                                            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Location</p>
                                            <p className="text-[15px] font-bold text-surface-900 truncate">{listing.companies?.location}</p>
                                        </div>
                                    </div>

                                    {listing.description && (
                                        <p className="text-[13px] text-surface-500 line-clamp-2 pt-1">{listing.description}</p>
                                    )}
                                </div>

                                {/* Footer / CTA */}
                                <div className="px-5 py-4 bg-surface-50/50 border-t border-surface-100 mt-auto">
                                    <button
                                        onClick={() => navigate(`/app/messages?partnerId=${listing.company_id}&oppId=${listing.id}`)}
                                        className="w-full bg-surface-900 hover:bg-black text-white text-[13px] font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-surface-900/10"
                                    >
                                        <MessageSquare size={14} className="text-white" />
                                        Chat with Seller
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center pt-8 pb-4">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-surface-200 shadow-sm">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-surface-500 hover:bg-surface-50 hover:text-surface-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1">
                            {generatePageNumbers().map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-[14px] font-bold transition-all ${currentPage === pageNum
                                        ? 'bg-surface-900 text-white'
                                        : 'text-surface-600 hover:bg-surface-100'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-surface-500 hover:bg-surface-50 hover:text-surface-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Opportunities;
