import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    ArrowRight, Upload, MapPin, Loader, AlertTriangle,
    Package, Recycle, CheckCircle2, ChevronDown,
    ShieldCheck, Info, Clock, X, FileText, Edit2, Trash2, Sparkles, Building2
} from 'lucide-react';
import {
    createWasteListing, getMyWasteListings, updateWasteListing, deleteWasteListing,
    getReceivedOffers, updateOpportunityStatus,
    type WasteListing, type OpportunityWithSender
} from '../lib/db';
import { detectLocation } from '../lib/location';

/* ─── Types ─── */
interface FormData {
    wasteType: string;
    description: string;
    quantity: string;
    unit: string;
    price_per_unit: string;
    frequency: 'one-time' | 'recurring';
    condition: string;
    hazardLevel: string;
    handling: string;
    location: string;
}

const wasteTypes = [
    { value: '', label: 'Select waste type...' },
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

/* ─── Styled Select Wrapper ─── */
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
const ListWaste = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const locationReactRouter = useLocation();
    const highlight = new URLSearchParams(locationReactRouter.search).get('highlight') === 'true';
    const listingsRef = useRef<HTMLDivElement>(null);
    const [submitError, setSubmitError] = useState('');

    const [form, setForm] = useState<FormData>({
        wasteType: '',
        description: '',
        quantity: '',
        unit: 'Tons',
        price_per_unit: '',
        frequency: 'one-time',
        condition: '',
        hazardLevel: 'non-hazardous',
        handling: '',
        location: 'Facility Alpha, 142 Industrial Pkwy, Mumbai',
    });

    const [myListings, setMyListings] = useState<WasteListing[]>([]);
    const [editingListing, setEditingListing] = useState<WasteListing | null>(null);
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    // Offers State
    const [receivedOffers, setReceivedOffers] = useState<OpportunityWithSender[]>([]);
    const [isUpdatingOffer, setIsUpdatingOffer] = useState<string | null>(null);

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

    const loadMyListings = async () => {
        const data = await getMyWasteListings();
        setMyListings(data);
    };

    const loadReceivedOffers = async () => {
        const data = await getReceivedOffers('active');
        setReceivedOffers(data);
    };

    useEffect(() => {
        loadMyListings();
        loadReceivedOffers();
    }, []);

    const update = (key: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.wasteType || !form.quantity) return;

        setIsSubmitting(true);
        setSubmitError('');

        const { error } = await createWasteListing({
            waste_type: form.wasteType,
            description: form.description,
            quantity: parseFloat(form.quantity),
            unit: form.unit,
            price_per_unit: form.price_per_unit ? parseFloat(form.price_per_unit) : undefined,
            frequency: form.frequency,
            condition: form.condition,
            hazard_level: form.hazardLevel,
            handling: form.handling,
            listing_location: form.location,
        });

        if (error) {
            setIsSubmitting(false);
            setSubmitError(error);
            return;
        }

        await loadMyListings();
        setIsSubmitting(false);
        setForm({
            wasteType: '',
            description: '',
            quantity: '',
            unit: 'Tons',
            price_per_unit: '',
            frequency: 'one-time',
            condition: '',
            hazardLevel: 'non-hazardous',
            handling: '',
            location: 'Facility Alpha, 142 Industrial Pkwy, Mumbai',
        });
    };

    const handleUpdateListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingListing) return;
        setIsUpdating(true);
        const { error } = await updateWasteListing(editingListing.id, {
            waste_type: editingListing.waste_type,
            description: editingListing.description,
            quantity: editingListing.quantity,
            unit: editingListing.unit,
            price_per_unit: editingListing.price_per_unit,
            frequency: editingListing.frequency,
            condition: editingListing.condition,
            hazard_level: editingListing.hazard_level,
            handling: editingListing.handling,
            listing_location: editingListing.listing_location
        });
        if (!error) {
            setEditingListing(null);
            loadMyListings();
        }
        setIsUpdating(false);
    };

    const handleDeleteListing = async () => {
        if (!listingToDelete) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const { error } = await deleteWasteListing(listingToDelete);
            if (error) {
                setDeleteError(error);
            } else {
                await loadMyListings();
                setListingToDelete(null);
            }
        } catch (err: any) {
            setDeleteError(err.message || 'An unexpected error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle highlight effect
    const [isHighlighted, setIsHighlighted] = useState(false);
    useEffect(() => {
        if (highlight && myListings.length >= 0) {
            setIsHighlighted(true);
            setTimeout(() => {
                if (listingsRef.current) {
                    listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            setTimeout(() => setIsHighlighted(false), 2000);
        }
    }, [highlight, myListings]);

    const handleFileSimulate = () => {
        const fakeFiles = ['MSDS_Steel_Slag_2026.pdf', 'Lab_Composition_Report.xlsx'];
        setUploadedFiles(fakeFiles);
    };

    const handleEdit = (listing: WasteListing) => {
        const fakeFiles = ['MSDS_Steel_Slag_2026.pdf', 'Lab_Composition_Report.xlsx'];
        setUploadedFiles(fakeFiles);
    };

    const inputClasses = "w-full bg-surface-50/80 border border-surface-200 rounded-xl px-4 py-3 text-[14px] text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/8 transition-all";
    const selectClasses = `${inputClasses} appearance-none cursor-pointer`;

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in">

            {/* Page Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900">List Waste Material</h1>
                </div>
                <p className="text-surface-400 text-[15px] font-medium">
                    Describe your waste material and list it on the global marketplace.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* ═══════ LEFT: Form Panel ═══════ */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Card 1: Material Info */}
                        <div className="bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 lg:p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Package size={18} className="text-surface-400" />
                                <h2 className="text-[16px] font-bold text-surface-900">Material Information</h2>
                            </div>

                            {/* Material Description */}
                            <FormField label="Material Description" required>
                                <textarea
                                    value={form.description}
                                    onChange={e => update('description', e.target.value)}
                                    className={`${inputClasses} resize-none h-[120px]`}
                                    placeholder="e.g., 50 tons of clean aluminum manufacturing scrap, mostly shavings and turnings from CNC operations. Alloy grade 6061..."
                                />
                            </FormField>

                            {/* Waste Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Waste Type" required>
                                    <div className="relative">
                                        <select
                                            value={form.wasteType}
                                            onChange={e => update('wasteType', e.target.value)}
                                            className={selectClasses}
                                        >
                                            {wasteTypes.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-300 pointer-events-none" />
                                    </div>
                                </FormField>

                                {/* Price per Quantity */}
                                <FormField label="Price per Quantity" required>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                value={form.price_per_unit}
                                                onChange={e => update('price_per_unit', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-surface-50/80 border border-surface-200 rounded-[18px] pl-8 pr-5 py-4 text-[15px] text-surface-900 placeholder-surface-300 font-semibold focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/8 transition-all"
                                            />
                                        </div>
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

                                {/* Quantity Field */}
                                <FormField label="Total Quantity Available" required>
                                    <input
                                        type="number"
                                        value={form.quantity}
                                        onChange={e => update('quantity', e.target.value)}
                                        placeholder="Enter total amount"
                                        className="w-full bg-surface-50/80 border border-surface-200 rounded-[18px] px-5 py-4 text-[15px] text-surface-900 placeholder-surface-300 font-semibold focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/8 transition-all"
                                    />
                                </FormField>
                            </div>

                            {/* Frequency + Material Condition */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Frequency">
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['one-time', 'recurring'] as const).map(freq => (
                                            <button
                                                key={freq}
                                                type="button"
                                                onClick={() => update('frequency', freq)}
                                                className={`py-3 rounded-xl text-[13px] font-bold transition-all border-2 flex items-center justify-center gap-2 ${form.frequency === freq
                                                    ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-[0_2px_8px_rgba(16,185,129,0.1)]'
                                                    : 'bg-surface-50 border-surface-200 text-surface-500 hover:border-surface-300 hover:bg-surface-100'
                                                    }`}
                                            >
                                                {freq === 'one-time' ? <Clock size={14} /> : <Recycle size={14} />}
                                                {freq === 'one-time' ? 'One-Time' : 'Recurring'}
                                            </button>
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Material Condition">
                                    <div className="relative">
                                        <select
                                            value={form.condition}
                                            onChange={e => update('condition', e.target.value)}
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
                            </div>
                        </div>

                        {/* Card 2: Safety & Handling */}
                        <div className="bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 lg:p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={18} className="text-surface-400" />
                                <h2 className="text-[16px] font-bold text-surface-900">Safety & Handling</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Hazard Level */}
                                <FormField label="Hazard Level" required>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'non-hazardous', label: 'Non-Hazardous', icon: CheckCircle2, color: 'text-brand-500' },
                                            { value: 'low', label: 'Low Risk', icon: Info, color: 'text-blue-500' },
                                            { value: 'medium', label: 'Medium Risk', icon: AlertTriangle, color: 'text-amber-500' },
                                            { value: 'high', label: 'High Risk — Specialized', icon: AlertTriangle, color: 'text-red-500' },
                                        ].map(h => (
                                            <button
                                                key={h.value}
                                                type="button"
                                                onClick={() => update('hazardLevel', h.value)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all border-2 text-left ${form.hazardLevel === h.value
                                                    ? 'bg-surface-50 border-surface-900 text-surface-900 shadow-sm'
                                                    : 'bg-surface-50/50 border-surface-200/80 text-surface-500 hover:border-surface-300'
                                                    }`}
                                            >
                                                <h.icon size={16} className={form.hazardLevel === h.value ? h.color : 'text-surface-300'} />
                                                {h.label}
                                                {form.hazardLevel === h.value && (
                                                    <CheckCircle2 size={14} className="ml-auto text-brand-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </FormField>

                                {/* Handling Requirements */}
                                <FormField label="Handling Requirements" hint="Describe any special storage, transport, or PPE needs">
                                    <textarea
                                        value={form.handling}
                                        onChange={e => update('handling', e.target.value)}
                                        className={`${inputClasses} resize-none h-[186px]`}
                                        placeholder="e.g., Must be stored in covered area, away from moisture. Standard PPE required for handling. No special transport certifications needed..."
                                    />
                                </FormField>
                            </div>
                        </div>

                        {/* Card 3: Location & Documents */}
                        <div className="bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 lg:p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin size={18} className="text-surface-400" />
                                <h2 className="text-[16px] font-bold text-surface-900">Location & Documentation</h2>
                            </div>

                            {/* Location */}
                            <FormField label="Pickup Location">
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

                            {/* File Upload */}
                            <FormField label="Supporting Documents & Photos">
                                <div
                                    onClick={handleFileSimulate}
                                    className="bg-surface-50/60 border-2 border-dashed border-surface-200 rounded-2xl p-8 hover:bg-brand-50/30 hover:border-brand-200 transition-all duration-300 group cursor-pointer text-center"
                                >
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-surface-100 group-hover:shadow-md group-hover:border-brand-100 transition-all">
                                        <Upload className="text-surface-300 group-hover:text-brand-500 transition-colors" size={20} />
                                    </div>
                                    <p className="text-[14px] font-bold text-surface-800">
                                        Drag & drop or <span className="text-brand-600 underline underline-offset-2">click to upload</span>
                                    </p>
                                    <p className="text-[12px] text-surface-400 mt-1.5 font-medium">MSDS, Lab Reports, Photos • PDF, XLSX, JPG up to 25MB</p>
                                </div>

                                {/* Uploaded Files */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {uploadedFiles.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-surface-50 rounded-xl px-4 py-2.5 border border-surface-200/60">
                                                <FileText size={16} className="text-brand-500 shrink-0" />
                                                <span className="text-[13px] font-semibold text-surface-800 flex-1 truncate">{f}</span>
                                                <button type="button" onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-surface-300 hover:text-red-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormField>
                        </div>

                        {/* Error Banner */}
                        {submitError && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-semibold">
                                <AlertTriangle size={16} className="shrink-0" />
                                {submitError}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2 pb-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative overflow-hidden bg-brand-500 hover:bg-brand-600 text-white font-bold text-[15px] py-4 px-10 rounded-2xl shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/25 transition-all flex items-center gap-3 disabled:opacity-80 disabled:cursor-not-allowed hover:-translate-y-0.5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="animate-spin" size={18} />
                                        Saving Listing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Publish Waste Listing
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ═══════ RIGHT: Overview Panel ═══════ */}
                    <div className="space-y-6">

                        {/* Received Offers Section */}
                        {receivedOffers.length > 0 && (
                            <div className="bg-white rounded-2xl border border-brand-200 shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden animate-fade-in">
                                <div className="bg-gradient-to-r from-brand-50 to-emerald-50 px-6 py-4 flex items-center justify-between border-b border-brand-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20">
                                            <Sparkles size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-bold text-surface-900">Received Offers</h3>
                                            <p className="text-[11px] text-brand-600 font-medium">{receivedOffers.length} pending</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {receivedOffers.map(offer => (
                                        <div key={offer.id} className="p-4 bg-white border border-surface-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-surface-900">{offer.title}</h4>
                                                    <p className="text-[12px] text-surface-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                        <Building2 size={12} className="text-brand-500" />
                                                        {offer.companies?.company_name}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0 ml-2">
                                                    <p className="text-[14px] font-black text-brand-700">{offer.volume}</p>
                                                    <p className="text-[10px] uppercase font-bold text-surface-400 mt-0.5">{offer.frequency}</p>
                                                </div>
                                            </div>
                                            {offer.why_match && offer.why_match.length > 0 && offer.why_match[0] && (
                                                <div className="mb-3 p-2.5 bg-surface-50 rounded-lg border border-surface-100/50">
                                                    <p className="text-[12px] text-surface-600 italic">"{offer.why_match[0]}"</p>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    disabled={isUpdatingOffer === offer.id}
                                                    onClick={async () => {
                                                        setIsUpdatingOffer(offer.id);
                                                        await updateOpportunityStatus(offer.id, 'accepted');
                                                        await loadReceivedOffers();
                                                        setIsUpdatingOffer(null);
                                                    }}
                                                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold text-[12px] rounded-[10px] transition-colors flex justify-center items-center h-[34px]"
                                                >
                                                    {isUpdatingOffer === offer.id ? <Loader size={14} className="animate-spin" /> : 'Accept'}
                                                </button>
                                                <button
                                                    disabled={isUpdatingOffer === offer.id}
                                                    onClick={async () => {
                                                        setIsUpdatingOffer(offer.id);
                                                        await updateOpportunityStatus(offer.id, 'rejected');
                                                        await loadReceivedOffers();
                                                        setIsUpdatingOffer(null);
                                                    }}
                                                    className="px-4 bg-white hover:bg-red-50 hover:text-red-600 text-surface-600 font-bold text-[12px] rounded-[10px] transition-colors border border-surface-200 hover:border-red-200 flex justify-center items-center h-[34px]"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* User Listings Section */}
                        <div
                            ref={listingsRef}
                            className={`rounded-2xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-700 ${isHighlighted ? 'ring-4 ring-brand-500 border-brand-500 transform scale-[1.02]' : 'border-surface-200/60'}`}
                        >
                            <div className="bg-surface-900 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center border border-white/10">
                                        <Package size={16} className="text-brand-400" />
                                    </div>
                                    <h3 className="text-[14px] font-bold text-white">Your Listings</h3>
                                </div>
                                <span className="text-[10px] font-bold text-surface-400 bg-white/5 px-2 py-1 rounded-md border border-white/5 uppercase tracking-wider">
                                    {myListings.length} Active
                                </span>
                            </div>

                            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {myListings.length === 0 ? (
                                    <div className="text-center py-8 px-4">
                                        <div className="w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-3">
                                            <Package size={20} className="text-surface-200" />
                                        </div>
                                        <p className="text-[13px] font-bold text-surface-400">No listings yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myListings.map(listing => (
                                            <div
                                                key={listing.id}
                                                className="group p-3 rounded-xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50/20 transition-all cursor-default"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-[13px] font-bold text-surface-900 capitalize">
                                                            {(listing.waste_type || '').replace(/-/g, ' ')}
                                                        </h4>
                                                        <p className="text-[11px] font-medium text-surface-400 mt-0.5">
                                                            {listing.quantity} {listing.unit} • {listing.frequency}
                                                            {listing.price_per_unit && (
                                                                <span className="text-brand-600 ml-1.5 font-bold">₹{listing.price_per_unit}/{listing.unit}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingListing(listing)}
                                                            className="p-1.5 hover:bg-white rounded-lg text-surface-400 hover:text-brand-600 border border-transparent hover:border-brand-100 transition-all shadow-sm"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDeleteError(null);
                                                                setListingToDelete(listing.id);
                                                            }}
                                                            className="p-1.5 hover:bg-white rounded-lg text-surface-400 hover:text-red-600 border border-transparent hover:border-red-100 transition-all shadow-sm"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${listing.hazard_level === 'non-hazardous' ? 'bg-brand-500' : 'bg-amber-500'}`} />
                                                        <span className="text-[10px] font-bold text-surface-500 uppercase tracking-tight">
                                                            {listing.hazard_level}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-surface-300">
                                                        {new Date(listing.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </form>

            {/* Edit Modal */}
            {editingListing && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-24">
                    <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={() => setEditingListing(null)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="bg-surface-900 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                                    <Package size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-[18px]">Edit Listing</h3>
                                    <p className="text-surface-400 text-[12px] font-medium">Modify your material details</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingListing(null)}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all flex items-center justify-center border border-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateListing} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Waste Type" required>
                                    <div className="relative">
                                        <select
                                            value={editingListing.waste_type}
                                            onChange={e => setEditingListing({ ...editingListing, waste_type: e.target.value })}
                                            className={selectClasses}
                                        >
                                            {wasteTypes.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-300 pointer-events-none" />
                                    </div>
                                </FormField>

                                <FormField label="Quantity" required>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={editingListing.quantity}
                                            onChange={e => setEditingListing({ ...editingListing, quantity: parseFloat(e.target.value) })}
                                            className={inputClasses}
                                        />
                                        <select
                                            value={editingListing.unit}
                                            onChange={e => setEditingListing({ ...editingListing, unit: e.target.value })}
                                            className="w-24 bg-surface-50 border border-surface-200 rounded-xl px-3 text-[14px] font-bold"
                                        >
                                            <option>Tons</option>
                                            <option>Kg</option>
                                            <option>Liters</option>
                                            <option>m³</option>
                                        </select>
                                    </div>
                                </FormField>
                            </div>

                            <FormField label="Material Description">
                                <textarea
                                    value={editingListing.description}
                                    onChange={e => setEditingListing({ ...editingListing, description: e.target.value })}
                                    className={`${inputClasses} h-24 resize-none`}
                                />
                            </FormField>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Price per Unit (₹)">
                                    <input
                                        type="number"
                                        value={editingListing.price_per_unit || ''}
                                        onChange={e => setEditingListing({ ...editingListing, price_per_unit: parseFloat(e.target.value) })}
                                        className={inputClasses}
                                    />
                                </FormField>

                                <FormField label="Pickup Location">
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
                                        <input
                                            type="text"
                                            value={editingListing.listing_location}
                                            onChange={e => setEditingListing({ ...editingListing, listing_location: e.target.value })}
                                            className={`${inputClasses} pl-11`}
                                        />
                                    </div>
                                </FormField>
                            </div>

                            <div className="flex justify-end pt-4 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingListing(null)}
                                    className="px-6 py-3 rounded-2xl bg-surface-50 text-surface-600 font-bold hover:bg-surface-100 transition-all text-[14px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-8 py-3 rounded-2xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 text-[14px]"
                                >
                                    {isUpdating && <Loader className="animate-spin" size={16} />}
                                    Update Listing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {listingToDelete && (
                <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-24">
                    <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setListingToDelete(null)} />
                    <div className="relative bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5 border border-red-100">
                                <Trash2 size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-[20px] font-extrabold text-surface-900 mb-2">Delete Listing?</h3>
                            <p className="text-[14px] text-surface-400 font-medium leading-relaxed">
                                Are you sure you want to remove this material listing? This action cannot be undone and will remove it from the global marketplace.
                            </p>
                            {deleteError && (
                                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-[12px] text-red-600 font-bold">
                                    {deleteError}
                                </div>
                            )}
                        </div>
                        <div className="bg-surface-50 p-6 flex gap-3">
                            <button
                                onClick={() => setListingToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3.5 rounded-xl bg-white text-surface-600 font-bold border border-surface-200 hover:bg-surface-50 transition-all text-[14px] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteListing}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 text-[14px] disabled:opacity-50"
                            >
                                {isDeleting ? <Loader className="animate-spin" size={16} /> : 'Delete Listing'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListWaste;
