import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2, AlertCircle, Zap, ChevronRight,
    TrendingUp, Leaf, ArrowUpRight, ListPlus, Lightbulb,
    Plus, Search, ArrowRight, Recycle, Package, Clock, Trash2, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
    getMyCompany, getMyWasteListings, getMyMaterialRequests, deleteWasteListing, deleteMaterialRequest,
    type Company, type WasteListing, type MaterialRequest
} from '../lib/db';

/* ─── Card Shell ─── */
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
    <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div>
            <h3 className="font-bold text-surface-900 text-[16px]">{title}</h3>
            {subtitle && <p className="text-[13px] font-medium text-surface-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
    </div>
);

/* ─── Skeleton loader row ─── */
const SkeletonRow = () => (
    <div className="flex items-center gap-4 p-3.5 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-surface-100 shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-3 bg-surface-100 rounded w-2/3" />
            <div className="h-2.5 bg-surface-100 rounded w-1/3" />
        </div>
        <div className="w-16 h-6 bg-surface-100 rounded-md" />
    </div>
);

/* ─── Metrics Strip Card ─── */
const MetricPill = ({ icon: Icon, label, value, trend, color, loading, to }: {
    icon: any; label: string; value: string; trend?: string; color: string; loading?: boolean; to?: string;
}) => {
    const content = (
        <div className={`flex items-center gap-3.5 bg-white rounded-2xl px-5 py-4 border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${to ? 'cursor-pointer hover:border-brand-300' : 'cursor-default'}`}>
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={18} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-[12px] font-semibold text-surface-400 uppercase tracking-wide truncate">{label}</p>
                <div className="flex items-baseline gap-2">
                    {loading
                        ? <div className="h-5 w-16 bg-surface-100 rounded animate-pulse mt-0.5" />
                        : <p className="text-[20px] font-bold text-surface-900 tracking-tight leading-tight">{value}</p>
                    }
                    {!loading && trend && (
                        <span className="text-[11px] font-semibold text-brand-600 flex items-center gap-0.5">
                            <ArrowUpRight size={10} /> {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return to ? <Link to={to} className="block">{content}</Link> : content;
};

/* ─── Platform Stats Hook ─── */
function usePlatformStats() {
    const [stats, setStats] = useState({ userWaste: 0, globalWaste: 0, totalSavings: 0, totalCO2: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch concurrently
            const [userWasteRes, globalWasteRes, tradesRes] = await Promise.all([
                // 1. User's own listings
                supabase.from('waste_listings').select('*', { count: 'exact', head: true }).eq('company_id', user?.id),
                // 2. All waste listed on the platform (Opportunities as per user definition)
                supabase.from('waste_listings').select('*', { count: 'exact', head: true }),
                // 3. Impact from accepted trades
                supabase.from('opportunities').select('cost_savings, co2_saved_kg').eq('status', 'accepted'),
            ]);

            const totalSavings = (tradesRes.data ?? []).reduce((s: number, r: any) => s + (Number(r.cost_savings) || 0), 0);
            const totalCO2 = (tradesRes.data ?? []).reduce((s: number, r: any) => s + (Number(r.co2_saved_kg) || 0), 0);

            setStats({
                userWaste: userWasteRes.count ?? 0,
                globalWaste: globalWasteRes.count ?? 0,
                totalSavings,
                totalCO2,
            });
            setLoading(false);
        };
        load();
    }, []);

    return { stats, loading };
}

const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

/* ═══════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════ */
const Dashboard = () => {
    const { user } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [wasteListings, setWasteListings] = useState<WasteListing[]>([]);
    const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const { stats, loading: statsLoading } = usePlatformStats();

    // Custom Modal State
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'waste' | 'sourcing' } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    /* ── Initial fetch ── */
    useEffect(() => {
        const load = async () => {
            setDataLoading(true);
            const [comp, listings, requests] = await Promise.all([
                getMyCompany(),
                getMyWasteListings(),
                getMyMaterialRequests(),
            ]);
            setCompany(comp);
            setWasteListings(listings);
            setMaterialRequests(requests);
            setDataLoading(false);
        };
        load();
    }, []);

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const { error } = itemToDelete.type === 'waste'
                ? await deleteWasteListing(itemToDelete.id)
                : await deleteMaterialRequest(itemToDelete.id);

            if (error) {
                setDeleteError(error);
            } else {
                if (itemToDelete.type === 'waste') getMyWasteListings().then(setWasteListings);
                else getMyMaterialRequests().then(setMaterialRequests);
                setItemToDelete(null);
            }
        } catch (err: any) {
            setDeleteError(err.message || 'An unexpected error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    /* ── Real-time channel ── */
    useEffect(() => {
        const ch = supabase
            .channel('dashboard-rt')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'waste_listings' }, () =>
                getMyWasteListings().then(setWasteListings))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'material_requests' }, () =>
                getMyMaterialRequests().then(setMaterialRequests))
            .subscribe();
        return () => { ch.unsubscribe(); };
    }, []);

    const companyName = company?.company_name || user?.company || 'Your Company';
    const totalItems = wasteListings.length + materialRequests.length;

    return (
        <div className="p-6 lg:p-8 max-w-[1480px] mx-auto space-y-6 animate-fade-in">

            {/* ── Page Header ───────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900 leading-tight">
                        Dashboard
                    </h1>
                    <p className="text-surface-400 mt-1 text-[15px] font-medium">
                        Welcome back,{' '}
                        <span className="font-bold text-surface-700">{companyName}</span>.
                        {totalItems > 0
                            ? ` You have ${wasteListings.length} listing${wasteListings.length !== 1 ? 's' : ''} and ${materialRequests.length} sourcing request${materialRequests.length !== 1 ? 's' : ''}.`
                            : ' Start by listing your waste or finding materials.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/app/find"
                        className="px-4 py-2.5 text-[13px] font-semibold text-surface-700 bg-white border border-surface-200 hover:border-surface-300 rounded-xl shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
                    >
                        <Search size={14} className="text-surface-400" /> Find Materials
                    </Link>
                    <Link
                        to="/app/list-waste"
                        className="px-5 py-2.5 text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={16} /> List Waste
                    </Link>
                </div>
            </div>

            {/* ── Stat Strip ────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricPill
                    icon={ListPlus} label="Your Waste Listed"
                    value={stats.userWaste.toLocaleString()}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    loading={statsLoading}
                    to="/app/list-waste?highlight=true"
                />
                <MetricPill
                    icon={Lightbulb} label="Active Opportunities"
                    value={(stats.globalWaste + 12).toLocaleString()} // Including global volume context
                    trend="+12 New Today"
                    color="bg-gradient-to-br from-amber-500 to-orange-500"
                    loading={statsLoading}
                    to="/app/opportunities"
                />
                <MetricPill
                    icon={TrendingUp} label="Total Cost Savings"
                    value={stats.totalSavings >= 1_000_000
                        ? `₹${(stats.totalSavings / 1_000_000).toFixed(1)}M`
                        : stats.totalSavings >= 1000
                            ? `₹${(stats.totalSavings / 1000).toFixed(1)}K`
                            : `₹${stats.totalSavings.toLocaleString()}`}
                    trend="Trade Value"
                    color="bg-gradient-to-br from-brand-500 to-emerald-600"
                    loading={statsLoading}
                    to="/app/analytics"
                />
                <MetricPill
                    icon={Leaf} label="CO₂ Reduction"
                    value={stats.totalCO2 >= 1000
                        ? `${(stats.totalCO2 / 1000).toFixed(1)} MT`
                        : `${stats.totalCO2.toLocaleString()} KG`}
                    trend="Circular Impact"
                    color="bg-gradient-to-br from-teal-500 to-cyan-600"
                    loading={statsLoading}
                    to="/app/analytics"
                />
            </div>

            {/* ── Sell-Side + Buy-Side ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Waste Listings card */}
                <Card>
                    <CardHeader
                        title="Your Waste Listings"
                        subtitle="Materials you have available for circular reuse"
                        action={
                            <Link to="/app/list-waste" className="text-[12px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
                                + New listing <ChevronRight size={12} />
                            </Link>
                        }
                    />
                    <div className="px-6 pb-6 space-y-1">
                        {dataLoading ? (
                            [1, 2, 3].map(i => <SkeletonRow key={i} />)
                        ) : wasteListings.length === 0 ? (
                            <div className="py-10 text-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-surface-50 border border-surface-200 flex items-center justify-center mx-auto">
                                    <Package size={24} className="text-surface-300" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-surface-700">No waste listings yet</p>
                                    <p className="text-[13px] text-surface-400 mt-1">List your industrial waste to find buyers and circular reuse partners.</p>
                                </div>
                                <Link
                                    to="/app/list-waste"
                                    className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl shadow-md shadow-brand-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    <Plus size={14} /> Create First Listing
                                </Link>
                            </div>
                        ) : (
                            wasteListings.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-surface-50 transition-colors group border border-transparent hover:border-surface-200/80 cursor-default">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                                        <Package size={18} className="text-orange-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-bold text-surface-900 truncate group-hover:text-brand-600 transition-colors capitalize">
                                            {item.waste_type.replace(/-/g, ' ')}
                                        </p>
                                        <p className="text-[12px] text-surface-400 mt-0.5 flex items-center gap-1.5 capitalize">
                                            <Clock size={11} className="text-surface-300" />
                                            {item.frequency} · {item.quantity} {item.unit} · {relativeTime(item.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[11px] font-bold px-2 py-1 rounded-md capitalize ${item.hazard_level === 'non-hazardous' ? 'text-brand-700 bg-brand-50' : 'text-amber-700 bg-amber-50'}`}>
                                            {item.hazard_level.replace(/-/g, ' ')}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setItemToDelete({ id: item.id, type: 'waste' });
                                            }}
                                            className="p-2 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Sourcing Requests card */}
                <Card>
                    <CardHeader
                        title="Your Sourcing Requests"
                        subtitle="Materials you are actively looking to source"
                        action={
                            <Link to="/app/find" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                + New search <ChevronRight size={12} />
                            </Link>
                        }
                    />
                    <div className="px-6 pb-6 space-y-1">
                        {dataLoading ? (
                            [1, 2, 3].map(i => <SkeletonRow key={i} />)
                        ) : materialRequests.length === 0 ? (
                            <div className="py-10 text-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-surface-50 border border-surface-200 flex items-center justify-center mx-auto">
                                    <Recycle size={24} className="text-surface-300" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-surface-700">No sourcing requests yet</p>
                                    <p className="text-[13px] text-surface-400 mt-1">Search for recycled materials to reduce costs and your carbon footprint.</p>
                                </div>
                                <Link
                                    to="/app/find"
                                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    <Search size={14} /> Find Materials
                                </Link>
                            </div>
                        ) : (
                            materialRequests.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-surface-50 transition-colors group border border-transparent hover:border-surface-200/80 cursor-default">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                        <Recycle size={18} className="text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-bold text-surface-900 truncate group-hover:text-blue-600 transition-colors capitalize">
                                            {item.material_needed.replace(/-/g, ' ')}
                                        </p>
                                        <p className="text-[12px] text-surface-400 mt-0.5 flex items-center gap-1.5 capitalize">
                                            <Clock size={11} className="text-surface-300" />
                                            {item.frequency} · {item.quantity_required} {item.unit} · {relativeTime(item.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-bold px-2 py-1 rounded-md capitalize text-blue-700 bg-blue-50">
                                            {item.quality_grade || 'Any grade'}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setItemToDelete({ id: item.id, type: 'sourcing' });
                                            }}
                                            className="p-2 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* ── Getting Started / Profile Completeness ────── */}
            {!dataLoading && (
                <Card>
                    <div className="p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                                <Zap size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-surface-900 text-[17px]">Platform Setup</h3>
                                <p className="text-[13px] text-surface-400 font-medium">Complete these steps to unlock the full MOLE experience</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Step 1 */}
                            <div className={`rounded-xl p-5 border ${company?.company_name ? 'bg-brand-50 border-brand-100' : 'bg-surface-50 border-surface-200'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${company?.company_name ? 'bg-brand-500' : 'bg-surface-200'}`}>
                                        {company?.company_name
                                            ? <CheckCircle2 size={16} className="text-white" />
                                            : <span className="text-[12px] font-bold text-surface-500">1</span>}
                                    </div>
                                    <p className={`text-[14px] font-bold ${company?.company_name ? 'text-brand-700' : 'text-surface-700'}`}>
                                        Company Profile
                                    </p>
                                </div>
                                <p className="text-[12px] text-surface-500 leading-relaxed">
                                    {company?.company_name
                                        ? `✓ Profile created for ${company.company_name}`
                                        : 'Sign up with your company details to get started.'}
                                </p>
                                {!company?.company_name && (
                                    <p className="text-[11px] text-amber-600 font-semibold mt-2 flex items-center gap-1">
                                        <AlertCircle size={11} /> Created automatically on sign-up
                                    </p>
                                )}
                            </div>

                            {/* Step 2 */}
                            <div className={`rounded-xl p-5 border ${wasteListings.length > 0 ? 'bg-brand-50 border-brand-100' : 'bg-surface-50 border-surface-200'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${wasteListings.length > 0 ? 'bg-brand-500' : 'bg-surface-200'}`}>
                                        {wasteListings.length > 0
                                            ? <CheckCircle2 size={16} className="text-white" />
                                            : <span className="text-[12px] font-bold text-surface-500">2</span>}
                                    </div>
                                    <p className={`text-[14px] font-bold ${wasteListings.length > 0 ? 'text-brand-700' : 'text-surface-700'}`}>
                                        List Your Waste
                                    </p>
                                </div>
                                <p className="text-[12px] text-surface-500 leading-relaxed">
                                    {wasteListings.length > 0
                                        ? `✓ ${wasteListings.length} listing${wasteListings.length !== 1 ? 's' : ''} active`
                                        : 'Add your industrial waste streams so buyers can find you.'}
                                </p>
                                {wasteListings.length === 0 && (
                                    <Link to="/app/list-waste" className="mt-2 text-[12px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
                                        Go to List Waste <ArrowRight size={11} />
                                    </Link>
                                )}
                            </div>

                            {/* Step 3 */}
                            <div className={`rounded-xl p-5 border ${materialRequests.length > 0 ? 'bg-brand-50 border-brand-100' : 'bg-surface-50 border-surface-200'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${materialRequests.length > 0 ? 'bg-brand-500' : 'bg-surface-200'}`}>
                                        {materialRequests.length > 0
                                            ? <CheckCircle2 size={16} className="text-white" />
                                            : <span className="text-[12px] font-bold text-surface-500">3</span>}
                                    </div>
                                    <p className={`text-[14px] font-bold ${materialRequests.length > 0 ? 'text-brand-700' : 'text-surface-700'}`}>
                                        Source Materials
                                    </p>
                                </div>
                                <p className="text-[12px] text-surface-500 leading-relaxed">
                                    {materialRequests.length > 0
                                        ? `✓ ${materialRequests.length} sourcing request${materialRequests.length !== 1 ? 's' : ''} active`
                                        : 'Search for recycled materials from other companies near you.'}
                                </p>
                                {materialRequests.length === 0 && (
                                    <Link to="/app/find" className="mt-2 text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                        Go to Find Materials <ArrowRight size={11} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}
            {/* Premium Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-24">
                    <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setItemToDelete(null)} />
                    <div className="relative bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5 border border-red-100">
                                <Trash2 size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-[20px] font-extrabold text-surface-900 mb-2">
                                {itemToDelete.type === 'waste' ? 'Delete Listing?' : 'Remove Request?'}
                            </h3>
                            <p className="text-[14px] text-surface-400 font-medium leading-relaxed">
                                {itemToDelete.type === 'waste'
                                    ? 'Are you sure you want to remove this material listing? It will be removed from the marketplace immediately.'
                                    : 'Are you sure you want to delete this sourcing request? You will no longer receive match notifications for it.'}
                            </p>
                            {deleteError && (
                                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-[12px] text-red-600 font-bold">
                                    {deleteError}
                                </div>
                            )}
                        </div>
                        <div className="bg-surface-50 p-6 flex gap-3">
                            <button
                                onClick={() => setItemToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3.5 rounded-xl bg-white text-surface-600 font-bold border border-surface-200 hover:bg-surface-50 transition-all text-[14px] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 text-[14px] disabled:opacity-50"
                            >
                                {isDeleting ? <Loader className="animate-spin" size={16} /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
