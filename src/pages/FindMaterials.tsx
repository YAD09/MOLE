import React, { useState, useEffect } from 'react';
import {
    Search, MapPin, ChevronDown, Loader, ArrowRight, Sparkles,
    Package, Recycle, CheckCircle2, Leaf,
    ShieldCheck, Truck, Clock, Factory,
    Filter, Layers, Send, X, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    createMaterialRequest, getAllWasteListings, sendOffer, getMyOpportunities,
    type WasteListingPublic, type OpportunityWithCounterparty
} from '../lib/db';
import { detectLocation } from '../lib/location';

/* ─── Types ─── */
interface SourcingForm {
    materialNeeded: string;
    quantity: string;
    unit: string;
    frequency: string;
    qualityGrade: string;
    qualityConstraints: string;
    handlingCapabilities: string[];
    location: string;
    maxDistance: string;
}



/* ─── Material Categories ─── */
const materialCategories = [
    { value: '', label: 'Select material needed...' },
    { value: 'steel-scrap', label: 'Steel & Iron Scrap' },
    { value: 'aluminum', label: 'Aluminum & Light Alloys' },
    { value: 'copper', label: 'Copper & Brass' },
    { value: 'plastics-hdpe', label: 'HDPE Plastics' },
    { value: 'plastics-pp', label: 'Polypropylene (PP)' },
    { value: 'rubber', label: 'Rubber & Elastomers' },
    { value: 'glass-cullet', label: 'Glass Cullet' },
    { value: 'wood-biomass', label: 'Wood & Biomass' },
    { value: 'chemical-solvents', label: 'Chemical Solvents' },
    { value: 'textile-fiber', label: 'Textile & Fibers' },
    { value: 'electronic-pcb', label: 'Electronic Components' },
    { value: 'concrete-aggregate', label: 'Concrete Aggregate' },
];

/* ─── Handling Capabilities Options ─── */
const handlingOptions = [
    { id: 'forklift', label: 'Forklift Loading', icon: Truck },
    { id: 'crane', label: 'Crane / Heavy Lift', icon: Layers },
    { id: 'tanker', label: 'Tanker / Liquid', icon: Factory },
    { id: 'covered', label: 'Covered Storage', icon: ShieldCheck },
    { id: 'hazmat', label: 'Hazmat Certified', icon: ShieldCheck },
    { id: 'bulk', label: 'Bulk Containers', icon: Package },
];

/* ─── FormField Component ─── */
const FormField = ({ label, required, children, hint }: {
    label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) => (
    <div>
        <label className="flex items-center gap-1.5 text-[13px] font-bold text-surface-900 mb-2 uppercase tracking-wide">
            {label}
            {required && <span className="text-brand-500">*</span>}
        </label>
        {children}
        {hint && <p className="text-[11px] text-surface-400 font-medium mt-1.5 pl-1">{hint}</p>}
    </div>
);




/* ─── Main Component ─── */
const FindMaterials = () => {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [animateResults, setAnimateResults] = useState(false);
    const [matches, setMatches] = useState<WasteListingPublic[]>([]);
    const [sentOffers, setSentOffers] = useState<OpportunityWithCounterparty[]>([]);

    const [form, setForm] = useState<SourcingForm>({
        materialNeeded: '',
        quantity: '',
        unit: 'Tons',
        frequency: 'recurring',
        qualityGrade: '',
        qualityConstraints: '',
        handlingCapabilities: [],
        location: 'Facility Alpha, 142 Industrial Pkwy, Mumbai',
        maxDistance: '100',
    });

    const [isDetecting, setIsDetecting] = useState(false);

    const loadSentOffers = async () => {
        const offers = await getMyOpportunities('all');
        setSentOffers(offers);
    };

    React.useEffect(() => {
        loadSentOffers();
    }, []);

    const handleDetectLocation = async () => {
        setIsDetecting(true);
        try {
            const address = await detectLocation();
            update('location', address);
        } catch (error) {
            console.error('Location detection failed:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    const update = (key: keyof SourcingForm, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const toggleHandling = (id: string) => {
        setForm(prev => ({
            ...prev,
            handlingCapabilities: prev.handlingCapabilities.includes(id)
                ? prev.handlingCapabilities.filter(h => h !== id)
                : [...prev.handlingCapabilities, id]
        }));
    };

    const [searchError, setSearchError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.materialNeeded || !form.quantity) return;

        setIsSearching(true);
        setShowResults(false);
        setAnimateResults(false);
        setSearchError('');
        setMatches([]);

        // 1. Save material request to Supabase
        const { error } = await createMaterialRequest({
            material_needed: form.materialNeeded,
            quantity_required: parseFloat(form.quantity),
            unit: form.unit,
            frequency: form.frequency,
            quality_grade: form.qualityGrade,
            quality_constraints: form.qualityConstraints,
            delivery_location: form.location,
            max_distance_km: form.maxDistance ? parseFloat(form.maxDistance) : undefined,
        });

        if (error) {
            setIsSearching(false);
            setSearchError(error);
            return;
        }

        // 2. Perform Real-Time "AI" Matching
        // Logic: Find waste_listings where waste_type matches material_needed
        try {
            const allListings = await getAllWasteListings();
            const filtered = allListings.filter(l => l.waste_type === form.materialNeeded);
            setMatches(filtered);
        } catch (err) {
            console.error('[FindMaterials] matching error:', err);
        }

        // Simulate AI matching delay for UX feel
        setTimeout(() => {
            setIsSearching(false);
            setShowResults(true);
            setTimeout(() => setAnimateResults(true), 100);
        }, 1800);
    };



    const inputClasses = "w-full bg-surface-50/80 border border-surface-200 rounded-xl px-4 py-3 text-[14px] text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/8 transition-all";
    const selectClasses = `${inputClasses} appearance-none cursor-pointer`;

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in">

            {/* ─── Page Header ─── */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900">Source Materials</h1>
                    <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-[12px] px-3 py-1.5 rounded-full border border-brand-100 font-bold w-max">
                        <Sparkles size={13} /> AI Waste-Stream Matching
                    </span>
                </div>
                <p className="text-surface-400 text-[15px] font-medium">
                    Describe what you need — our AI matches you with ranked waste streams from verified industrial partners.
                </p>
            </div>

            <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* ═══════ LEFT: Sourcing Request Form (2 cols) ═══════ */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Card 1: Material Requirements */}
                        <div className="bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 lg:p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Package size={18} className="text-surface-400" />
                                <h2 className="text-[16px] font-bold text-surface-900">Material Requirements</h2>
                            </div>

                            {/* Material Needed */}
                            <FormField label="Material Needed" required hint="Select the category of material you are sourcing">
                                <div className="relative">
                                    <select
                                        value={form.materialNeeded}
                                        onChange={e => update('materialNeeded', e.target.value)}
                                        className={selectClasses}
                                    >
                                        {materialCategories.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-300 pointer-events-none" />
                                </div>
                            </FormField>

                            {/* Quantity + Frequency */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Quantity Required" required>
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            value={form.quantity}
                                            onChange={e => update('quantity', e.target.value)}
                                            placeholder="0.00"
                                            className="flex-1 bg-surface-50/80 border border-surface-200 rounded-[18px] px-5 py-4 text-[15px] text-surface-900 placeholder-surface-300 font-semibold focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/8 transition-all"
                                        />
                                        <div className="relative">
                                            <select
                                                value={form.unit}
                                                onChange={e => update('unit', e.target.value)}
                                                className="w-[110px] h-full bg-surface-50/80 border border-surface-200 rounded-[18px] px-4 text-[15px] text-surface-900 font-bold focus:outline-none focus:bg-white focus:border-brand-400 transition-all appearance-none cursor-pointer text-center"
                                            >
                                                <option>Tons</option>
                                                <option>Kg</option>
                                                <option>Liters</option>
                                                <option>m³</option>
                                            </select>
                                        </div>
                                    </div>
                                </FormField>

                                <FormField label="Frequency">
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['one-time', 'recurring', 'continuous'] as const).map(freq => (
                                            <button
                                                key={freq}
                                                type="button"
                                                onClick={() => update('frequency', freq)}
                                                className={`py-3 rounded-xl text-[12px] font-bold transition-all border-2 flex items-center justify-center gap-1.5 ${form.frequency === freq
                                                    ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-[0_2px_8px_rgba(16,185,129,0.1)]'
                                                    : 'bg-surface-50 border-surface-200 text-surface-500 hover:border-surface-300 hover:bg-surface-100'
                                                    }`}
                                            >
                                                {freq === 'one-time' ? <Clock size={13} /> : freq === 'recurring' ? <Recycle size={13} /> : <Leaf size={13} />}
                                                {freq === 'one-time' ? 'One-Time' : freq === 'recurring' ? 'Recurring' : 'Continuous'}
                                            </button>
                                        ))}
                                    </div>
                                </FormField>
                            </div>

                            {/* Quality Constraints */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Quality Grade">
                                    <div className="relative">
                                        <select
                                            value={form.qualityGrade}
                                            onChange={e => update('qualityGrade', e.target.value)}
                                            className={selectClasses}
                                        >
                                            <option value="">Select grade...</option>
                                            <option value="premium">Premium — Near-virgin / Clean</option>
                                            <option value="standard">Standard — Industry accepted / Sorted</option>
                                            <option value="economy">Economy — Functional grade / Mixed</option>
                                            <option value="raw">Raw — As-generated / Contaminated</option>
                                            <option value="processed">Processed — Pre-processed / Shredded</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-300 pointer-events-none" />
                                    </div>
                                </FormField>

                                <FormField label="Quality Constraints" hint="Any specific purity, composition, or compliance requirements">
                                    <textarea
                                        value={form.qualityConstraints}
                                        onChange={e => update('qualityConstraints', e.target.value)}
                                        className={`${inputClasses} resize-none h-[86px]`}
                                        placeholder="e.g., Must be free of lead contamination, minimum 95% purity, ISO 14001 certified supplier..."
                                    />
                                </FormField>
                            </div>
                        </div>

                        {/* Card 2: Handling & Location */}
                        <div className="bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 lg:p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Truck size={18} className="text-surface-400" />
                                <h2 className="text-[16px] font-bold text-surface-900">Handling & Logistics</h2>
                            </div>

                            {/* Handling Capabilities */}
                            <FormField label="Handling Capabilities" hint="Select all capabilities available at your facility">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {handlingOptions.map(h => (
                                        <button
                                            key={h.id}
                                            type="button"
                                            onClick={() => toggleHandling(h.id)}
                                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-[12px] font-bold transition-all border-2 text-left ${form.handlingCapabilities.includes(h.id)
                                                ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-[0_2px_8px_rgba(16,185,129,0.08)]'
                                                : 'bg-surface-50/50 border-surface-200 text-surface-500 hover:border-surface-300 hover:bg-surface-100'
                                                }`}
                                        >
                                            <h.icon size={14} className={form.handlingCapabilities.includes(h.id) ? 'text-brand-500' : 'text-surface-300'} />
                                            {h.label}
                                            {form.handlingCapabilities.includes(h.id) && (
                                                <CheckCircle2 size={13} className="ml-auto text-brand-500 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </FormField>

                            {/* Location + Max Distance */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <FormField label="Delivery Location">
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
                                            <input
                                                type="text"
                                                value={form.location}
                                                onChange={e => update('location', e.target.value)}
                                                className={`${inputClasses} pl-11 pr-28`}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleDetectLocation}
                                                disabled={isDetecting}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isDetecting ? (
                                                    <Loader size={12} className="animate-spin" />
                                                ) : (
                                                    <MapPin size={12} />
                                                )}
                                                {isDetecting ? 'Detecting...' : 'Auto-detect'}
                                            </button>
                                        </div>
                                    </FormField>
                                </div>
                                <FormField label="Max Distance" hint="Search radius in km">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={form.maxDistance}
                                            onChange={e => update('maxDistance', e.target.value)}
                                            className={`${inputClasses} pr-12`}
                                            placeholder="100"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-surface-400">km</span>
                                    </div>
                                </FormField>
                            </div>
                        </div>

                        {/* Error Banner */}
                        {searchError && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-semibold">
                                <Filter size={16} className="shrink-0" />
                                {searchError}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="group relative overflow-hidden bg-brand-500 hover:bg-brand-600 text-white font-bold text-[15px] py-4 px-10 rounded-2xl shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/25 transition-all flex items-center gap-3 disabled:opacity-80 disabled:cursor-not-allowed hover:-translate-y-0.5"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader className="animate-spin" size={18} />
                                        Saving & Scanning Waste Streams...
                                    </>
                                ) : (
                                    <>
                                        <Search size={18} />
                                        Find Matching Waste Streams
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                    </>
                                )}
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                            </button>
                        </div>
                    </div>

                    {/* ═══════ RIGHT: Summary Sidebar ═══════ */}
                    <div className="space-y-6">

                        {/* SENT OFFERS SECTION */}
                        {sentOffers.length > 0 && (
                            <div className="bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
                                <div className="bg-surface-900 px-6 py-4 flex items-center justify-between border-b border-surface-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center shadow-sm">
                                            <Send size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-bold text-white">My Sent Offers</h3>
                                            <p className="text-[11px] text-surface-400 font-medium">Your sourcing requests</p>
                                        </div>
                                    </div>
                                    <span className="bg-white/10 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/5">
                                        {sentOffers.length}
                                    </span>
                                </div>
                                <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-3">
                                    {sentOffers.map(offer => (
                                        <div key={offer.id} className="p-3 bg-surface-50 border border-surface-100 rounded-xl relative group hover:border-brand-200 hover:bg-white transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-surface-900">Offer for {offer.material_from}</h4>
                                                    <p className="text-[11px] text-surface-500 font-medium mt-0.5">
                                                        To: {offer.companies?.company_name || 'Verified Supplier'}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0 ml-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight 
                                                        ${offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                            offer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'}`}>
                                                        {offer.status === 'active' ? 'Pending' : offer.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 text-[11px] font-medium text-surface-500 border-t border-surface-200/50 pt-2 mt-2">
                                                <span><strong className="text-surface-900">Vol:</strong> {offer.volume}</span>
                                                <span><strong className="text-surface-900">Freq:</strong> {offer.frequency}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </form>


            {/* ─── Scanning indicator ─── */}
            {isSearching && (
                <div className="mt-10 animate-fade-in">
                    <div className="bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5 border border-brand-100">
                            <Loader size={28} className="text-brand-500 animate-spin" />
                        </div>
                        <h3 className="text-[18px] font-bold text-surface-900 mb-2">Saving Your Request...</h3>
                        <p className="text-[14px] text-surface-400 font-medium max-w-md mx-auto">
                            Recording your sourcing criteria to Supabase and preparing the AI matching engine.
                        </p>
                        <div className="w-full max-w-sm mx-auto mt-6 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full animate-[shimmer_1.5s_infinite] w-2/3" />
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Request saved confirmation ─── */}
            {showResults && (
                <div className={`mt-10 transition-all duration-700 ${animateResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <div className="bg-white rounded-2xl border border-brand-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">

                        {/* Success header */}
                        <div className="bg-gradient-to-r from-brand-50 to-emerald-50 border-b border-brand-100/60 px-8 py-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
                                <CheckCircle2 size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-extrabold text-surface-900">Sourcing Request Saved</h3>
                                <p className="text-[13px] text-surface-500 font-medium mt-0.5">
                                    Your request for <strong className="text-surface-800">{form.materialNeeded.replace(/-/g, ' ')}</strong> has been recorded in the database.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* What was saved */}
                            <div>
                                <h4 className="text-[13px] font-bold text-surface-400 uppercase tracking-wider mb-4">Request Summary</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Material Needed', value: form.materialNeeded.replace(/-/g, ' ') },
                                        { label: 'Quantity Required', value: `${form.quantity} ${form.unit}` },
                                        { label: 'Frequency', value: form.frequency },
                                        form.qualityGrade ? { label: 'Quality Grade', value: form.qualityGrade } : null,
                                        form.location ? { label: 'Delivery Location', value: form.location } : null,
                                        form.maxDistance ? { label: 'Search Radius', value: `${form.maxDistance} km` } : null,
                                    ].filter(Boolean).map((row: any) => (
                                        <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-surface-100 last:border-0">
                                            <span className="text-[13px] text-surface-500 font-medium">{row.label}</span>
                                            <span className="text-[13px] font-bold text-surface-900 capitalize">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Next steps */}
                            <div>
                                <h4 className="text-[13px] font-bold text-surface-400 uppercase tracking-wider mb-4">What Happens Next</h4>
                                <div className="space-y-4">
                                    {[
                                        { step: '1', title: 'Listed in Marketplace', desc: 'Your sourcing need is now visible to verified suppliers.', done: true },
                                        { step: '2', title: 'AI Matching (Coming Soon)', desc: 'Our ML engine will rank waste streams by compatibility, price, and location.', done: false },
                                        { step: '3', title: 'Supplier Introductions', desc: 'Best-matched suppliers will reach out to confirm availability.', done: false },
                                    ].map(item => (
                                        <div key={item.step} className="flex items-start gap-3">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[12px] font-bold ${item.done ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-400 border border-surface-200'}`}>
                                                {item.done ? <CheckCircle2 size={14} /> : item.step}
                                            </div>
                                            <div>
                                                <p className={`text-[13px] font-bold ${item.done ? 'text-surface-900' : 'text-surface-500'}`}>{item.title}</p>
                                                <p className="text-[12px] text-surface-400 font-medium leading-relaxed mt-0.5">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => { setShowResults(false); setAnimateResults(false); }}
                                        className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white text-[13px] font-bold rounded-xl shadow-md shadow-brand-500/15 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        <Search size={14} /> New Search
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/app/dashboard')}
                                        className="flex-1 py-3 bg-surface-50 hover:bg-surface-100 text-surface-700 text-[13px] font-bold rounded-xl border border-surface-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        View Dashboard <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ─── AI Matching Results Section ─── */}
                        <div className="p-8 border-t border-surface-100 bg-surface-50/30">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                        <Sparkles className="text-brand-600" size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-[16px] font-extrabold text-surface-900">Top Matches Found</h4>
                                        <p className="text-[12px] text-surface-500 font-medium">Verified waste streams matching your criteria</p>
                                    </div>
                                </div>
                                <span className="bg-brand-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                                    {matches.length} matches
                                </span>
                            </div>

                            {matches.length === 0 ? (
                                <div className="bg-white border border-surface-200 rounded-2xl p-10 text-center">
                                    <div className="w-16 h-16 rounded-full bg-surface-50 flex items-center justify-center mx-auto mb-4 border border-surface-100">
                                        <Search size={24} className="text-surface-300" />
                                    </div>
                                    <h5 className="text-[15px] font-bold text-surface-900 mb-1">No direct matches yet</h5>
                                    <p className="text-[13px] text-surface-400 font-medium max-w-xs mx-auto">
                                        We couldn't find active listings for this material. Your request is live, and we'll notify you as soon as a supplier lists it.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {matches.map(listing => (
                                        <div key={listing.id} className="bg-white border border-surface-200 rounded-[24px] p-5 hover:shadow-xl hover:shadow-brand-500/2 transition-all group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center border border-surface-100 group-hover:bg-brand-50 group-hover:border-brand-200 transition-colors">
                                                        <Package className="text-surface-400 group-hover:text-brand-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-[14px] font-bold text-surface-900 capitalize leading-tight">
                                                            {listing.companies?.company_name || 'Verified Supplier'}
                                                        </h5>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <MapPin size={11} className="text-brand-500" />
                                                            <span className="text-[11px] font-medium text-surface-400 truncate max-w-[150px]">
                                                                {listing.listing_location || listing.companies?.location}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[16px] font-black text-brand-600 leading-none">
                                                        {listing.quantity} <span className="text-[11px] font-bold uppercase tracking-tighter opacity-70">{listing.unit}</span>
                                                    </p>
                                                    {listing.price_per_unit && (
                                                        <p className="text-[12px] font-bold text-surface-900 mt-1">
                                                            ₹{listing.price_per_unit}<span className="text-[10px] text-surface-400 font-medium tracking-tight">/{listing.unit}</span>
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] font-bold text-surface-300 mt-1 uppercase tracking-widest">{listing.frequency}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-tight ${listing.hazard_level === 'non-hazardous'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {listing.hazard_level}
                                                </span>
                                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-surface-50 text-surface-500 border border-surface-100 uppercase tracking-tight">
                                                    {listing.condition}
                                                </span>
                                            </div>

                                            <button
                                                className="w-full py-3 bg-surface-900 hover:bg-black text-white rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-surface-900/10"
                                                onClick={() => navigate(`/app/messages?partnerId=${listing.company_id}`)}
                                            >
                                                Chat with Seller <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindMaterials;
