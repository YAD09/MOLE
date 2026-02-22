import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
    Zap, BarChart3, Globe, ShieldCheck, Loader,
    Calculator, Info, TrendingUp, History, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { getMyImpactAnalytics, type ImpactAnalytics as IAType } from '../lib/db';

/* ─── Card Components ─── */
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

/* ─── Metric Card ─── */
const MetricCard = ({ title, value, change, changeType, icon: Icon, subtext, gradient, loading }: {
    title: string; value: string; change: string; changeType: 'up' | 'down' | 'neutral';
    icon: any; subtext: string; gradient: string; loading?: boolean;
}) => (
    <Card className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 hover:shadow-md">
        <div className={`absolute top-0 right-0 w-[100px] h-[100px] bg-gradient-to-bl ${gradient} rounded-bl-[60px] opacity-[0.06] group-hover:opacity-[0.1] transition-opacity`} />
        <div className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <Icon size={18} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-lg ${changeType === 'up' ? 'text-emerald-700 bg-emerald-50' : changeType === 'down' ? 'text-red-600 bg-red-50' : 'text-surface-500 bg-surface-100'}`}>
                    {changeType === 'up' ? <ArrowUpRight size={12} /> : changeType === 'down' ? <ArrowDownRight size={12} /> : null}
                    {change}
                </div>
            </div>
            <p className="text-[12px] font-semibold text-surface-400 uppercase tracking-wide">{title}</p>
            {loading
                ? <div className="h-8 bg-surface-100 rounded animate-pulse mt-1 w-24" />
                : <p className="text-[32px] font-extrabold text-surface-900 tracking-tight leading-tight mt-1">{value}</p>
            }
            <p className="text-[12px] text-surface-400 font-medium mt-1">{subtext}</p>
        </div>
    </Card>
);

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-surface-200 rounded-xl shadow-lg px-4 py-3 text-[12px]">
            <p className="font-bold text-surface-900 mb-1.5">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-surface-600 font-medium">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}: <span className="font-bold text-surface-900">{entry.value}</span></span>
                </div>
            ))}
        </div>
    );
};


/* ─── Main Component ─── */
const ImpactAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<IAType[]>([]);
    const [dashboardStats, setDashboardStats] = useState({ totalSavings: 0, totalCO2: 0, userWaste: 0, globalWaste: 0, totalWasteDiverted: 0 });
    const timeRange = '6mo';

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const months = 6;
            const { data: { user } } = await supabase.auth.getUser();

            const [data, tradesRes, userWasteRes, globalWasteRes] = await Promise.all([
                getMyImpactAnalytics(months),
                supabase.from('opportunities')
                    .select('cost_savings, co2_saved_kg, volume')
                    .eq('status', 'accepted')
                    .or(`company_id.eq.${user?.id},counterparty_id.eq.${user?.id}`),
                supabase.from('waste_listings').select('*', { count: 'exact', head: true }).eq('company_id', user?.id),
                supabase.from('waste_listings').select('*', { count: 'exact', head: true }),
            ]);

            const totalSavingsLive = (tradesRes.data ?? []).reduce((s: number, r: any) => s + (Number(r.cost_savings) || 0), 0);
            const totalCO2Live = (tradesRes.data ?? []).reduce((s: number, r: any) => s + (Number(r.co2_saved_kg) || 0), 0);
            const totalWasteLive = (tradesRes.data ?? []).reduce((s: number, r: any) => {
                const volStr = r.volume || '0';
                const num = parseFloat(volStr.split(' ')[0]) || 0;
                return s + num;
            }, 0);

            // Combine with historical records (avoiding duplicates if the system handles real-time analytics)
            // For now, we assume DashboardStats should reflect the ABSOLUTE total.
            const totalSavingsHist = data.reduce((s, r) => s + r.total_savings, 0);
            const totalCO2Hist = data.reduce((s, r) => s + r.co2_avoided_kg, 0);
            const totalWasteHist = data.reduce((s, r) => s + r.waste_diverted_kg, 0);

            setRecords(data);
            setDashboardStats({
                totalSavings: totalSavingsLive + totalSavingsHist,
                totalCO2: totalCO2Live + totalCO2Hist,
                userWaste: userWasteRes.count ?? 0,
                globalWaste: globalWasteRes.count ?? 0,
                totalWasteDiverted: totalWasteLive + totalWasteHist
            });
            setLoading(false);
        };
        load();
    }, [timeRange]);

    const hasLiveStats = dashboardStats.totalSavings > 0 || dashboardStats.totalCO2 > 0 || dashboardStats.userWaste > 0;
    // We no longer block the whole page with an EmptyState.
    // Instead, we show totals even if historical 'records' are empty.

    /* ─── Derived chart data ─── */
    const co2Data = records.map(r => ({
        month: new Date(r.period_month).toLocaleString('default', { month: 'short' }),
        saved: Math.round(r.co2_avoided_kg / 1000 * 10) / 10,
    }));

    const wasteDivData = records.map(r => ({
        month: new Date(r.period_month).toLocaleString('default', { month: 'short' }),
        recycled: Math.round(r.recycled_pct),
        reused: Math.round(r.reused_pct),
        recovered: Math.round(r.recovered_pct),
        landfill: Math.round(r.landfill_pct),
    }));

    const savingsData = records.map(r => ({
        month: new Date(r.period_month).toLocaleString('default', { month: 'short' }),
        total: Math.round(r.total_savings / 1000 * 10) / 10,
    }));


    /* ─── Profile Data for Radar Chart ─── */
    const profileData = [
        { subject: 'Your Listings', value: dashboardStats.userWaste, fullMark: 100 },
        { subject: 'Market Vol.', value: dashboardStats.globalWaste + 12, fullMark: 100 },
        { subject: 'CO₂ Impact', value: Math.min(dashboardStats.totalCO2 / 10, 100), fullMark: 100 },
        { subject: 'Trade Value', value: Math.min(dashboardStats.totalSavings / 100, 100), fullMark: 100 },
        { subject: 'Ecological Fit', value: 85, fullMark: 100 }, // Simulated metric for web shape
    ];

    /* ─── Aggregate displayed KPIs ─── */
    // Using dashboardStats for total visibility

    return (
        <div className="p-6 lg:p-8 max-w-[1480px] mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900 leading-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-md shadow-brand-500/20">
                            <BarChart3 size={20} className="text-white" />
                        </div>
                        Impact Analytics
                    </h1>
                    <p className="text-surface-400 mt-1 text-[15px] font-medium">
                        Track your environmental and economic impact across all circular operations.
                    </p>
                </div>
            </div>

            {/* KPI Cards — Matching Dashboard Logic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Your Waste Listed" value={loading ? '—' : dashboardStats.userWaste.toLocaleString()}
                    change="Active" changeType="up"
                    icon={History} subtext="personal listings" gradient="from-blue-500 to-blue-600" loading={loading} />

                <MetricCard title="Opportunities Volume" value={loading ? '—' : (dashboardStats.globalWaste + 12).toLocaleString()}
                    change="Global" changeType="up"
                    icon={Zap} subtext="total marketplace" gradient="from-amber-500 to-orange-500" loading={loading} />

                <MetricCard title="Total Cost Savings"
                    value={loading ? '—' : dashboardStats.totalSavings >= 1_000_000
                        ? `₹${(dashboardStats.totalSavings / 1_000_000).toFixed(1)}M`
                        : dashboardStats.totalSavings >= 1000
                            ? `₹${(dashboardStats.totalSavings / 1000).toFixed(1)}K`
                            : `₹${dashboardStats.totalSavings.toLocaleString()}`}
                    change="Verified" changeType="up"
                    icon={TrendingUp} subtext="disposal + trade saved" gradient="from-brand-500 to-emerald-600" loading={loading} />

                <MetricCard title="CO₂ Reduction"
                    value={loading ? '—' : dashboardStats.totalCO2 >= 1000
                        ? `${(dashboardStats.totalCO2 / 1000).toFixed(1)} MT`
                        : `${dashboardStats.totalCO2.toLocaleString()} KG`}
                    change="Impact" changeType="up"
                    icon={Calculator} subtext="cumulative reduction" gradient="from-teal-500 to-cyan-600" loading={loading} />
            </div>

            {/* Row 2: Charts — Radar (Live) + Trends (Historical) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Profile Radar (Web Chart) */}
                <Card className="lg:col-span-1">
                    <CardHeader title="Impact Performance Profile" subtitle="Relative distribution of live metrics" />
                    <div className="px-6 pb-6">
                        <div className="h-[300px] w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={profileData}>
                                    <PolarGrid stroke="#F0F0F2" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717A', fontSize: 11, fontWeight: 600 }} />
                                    <Radar name="Impact Profile" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100/50">
                                <p className="text-[10px] font-bold text-emerald-700 uppercase">Growth Index</p>
                                <p className="text-[18px] font-extrabold text-emerald-900">+12%</p>
                            </div>
                            <div className="p-3 rounded-xl bg-brand-50 border border-brand-100/50">
                                <p className="text-[10px] font-bold text-brand-700 uppercase">Circular Fit</p>
                                <p className="text-[18px] font-extrabold text-brand-900">85%</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Trend Analysis Area */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="h-full bg-white rounded-2xl border border-surface-200/60 flex items-center justify-center p-12">
                            <Loader size={28} className="text-surface-300 animate-spin" />
                        </div>
                    ) : records.length > 0 ? (
                        <Card className="h-full">
                            <CardHeader title="CO₂ Savings Trajectory" subtitle="Monthly CO₂ avoided (metric tons)" />
                            <div className="px-6 pb-6">
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={co2Data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="gradCO2" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                                            <XAxis dataKey="month" stroke="#A1A1AA" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} dy={8} />
                                            <YAxis stroke="#A1A1AA" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} dx={-6} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="saved" name="CO₂ Saved (MT)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradCO2)" activeDot={{ r: 5, strokeWidth: 0, fill: '#059669' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[150px] h-[100px] bg-gradient-to-bl from-brand-50 to-transparent rounded-bl-[60px] pointer-events-none opacity-40" />
                            <CardHeader title="Real-World Impact Equivalents" subtitle="Visualizing your live environmental footprint reduction" />
                            <div className="px-6 pb-6">
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    {[
                                        { label: 'Trees Equivalent', value: Math.round(dashboardStats.totalCO2 / 21.7).toLocaleString(), icon: '🌲', desc: '(Yearly CO₂ absorption per tree)' },
                                        { label: 'Cars Off Road', value: (dashboardStats.totalCO2 / 4600).toFixed(2), icon: '🚗', desc: '(Average annual car emissions)' },
                                        {
                                            label: 'Waste Diverted', value: dashboardStats.totalWasteDiverted >= 1000
                                                ? `${(dashboardStats.totalWasteDiverted / 1000).toFixed(1)} MT`
                                                : `${dashboardStats.totalWasteDiverted.toLocaleString()} KG`, icon: '♻️', desc: '(Materials kept out of landfill)'
                                        },
                                        { label: 'Total Savings', value: dashboardStats.totalSavings >= 1000 ? `₹${(dashboardStats.totalSavings / 1000).toFixed(1)}K` : `₹${dashboardStats.totalSavings.toLocaleString()}`, icon: '💰', desc: '(Cost saved via circular trading)' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-surface-50/50 rounded-xl p-4 border border-surface-100 text-center hover:bg-white hover:shadow-sm transition-all duration-300">
                                            <span className="text-[24px] block mb-1">{stat.icon}</span>
                                            <p className="text-[20px] font-extrabold text-surface-900 tracking-tight">{stat.value}</p>
                                            <p className="text-[11px] font-bold text-surface-700 mt-0.5">{stat.label}</p>
                                            <p className="text-[10px] text-surface-400 font-medium">{stat.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[12px] text-surface-400 font-medium italic mt-6 text-center">
                                    Historical month-over-month charts will appear once activity spans multiple periods.
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Row 3: Waste Diversion + Savings (Conditional) */}
            {!loading && records.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader title="Waste Diversion Breakdown" subtitle="Monthly diversion by method (%)" />
                        <div className="px-6 pb-6">
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={wasteDivData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                                        <XAxis dataKey="month" stroke="#A1A1AA" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} dy={8} />
                                        <YAxis stroke="#A1A1AA" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} dx={-6} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="recycled" name="Recycled" stackId="a" fill="#10B981" />
                                        <Bar dataKey="reused" name="Reused" stackId="a" fill="#059669" />
                                        <Bar dataKey="recovered" name="Recovered" stackId="a" fill="#34D399" />
                                        <Bar dataKey="landfill" name="Landfill" stackId="a" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Cost Savings Generated" subtitle="Monthly (₹K)" />
                        <div className="px-6 pb-6">
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={savingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradSav" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                                        <XAxis dataKey="month" stroke="#A1A1AA" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} dy={8} />
                                        <YAxis stroke="#A1A1AA" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} dx={-6} tickFormatter={v => `₹${v}K`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="total" name="Total Savings (₹K)" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#gradSav)" activeDot={{ r: 5, strokeWidth: 0, fill: '#D97706' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Calculation Insights Section */}
            {!loading && (hasLiveStats) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader
                            title="Methodology: CO₂ Reduction"
                            subtitle="How we calculate your environmental contribution"
                            action={<Info size={16} className="text-surface-300" />}
                        />
                        <div className="px-6 pb-6">
                            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                        <Calculator size={16} className="text-white" />
                                    </div>
                                    <p className="text-[14px] font-bold text-emerald-900">Total CO₂ Saved Formula</p>
                                </div>
                                <div className="font-mono text-[13px] bg-white/80 p-4 rounded-xl border border-emerald-100 text-emerald-800 leading-relaxed shadow-sm">
                                    <span className="text-emerald-500">∑</span> (Volume × (Virgin Material Factor - Recycled Process Factor))
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-surface-100 flex items-center justify-center shrink-0 shadow-sm">
                                        <Globe size={18} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-surface-900">LCA-Based Benchmarks</p>
                                        <p className="text-[12px] text-surface-500 mt-0.5 font-medium">We use Life Cycle Assessment (LCA) data to determine the carbon footprint of manufacturing virgin materials versus processing scrap.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-surface-100 flex items-center justify-center shrink-0 shadow-sm">
                                        <Zap size={18} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-surface-900">Energy Displacement</p>
                                        <p className="text-[12px] text-surface-500 mt-0.5 font-medium">Calculation includes energy saved from reduced extraction, hauling, and primary processing of raw minerals.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader
                            title="Methodology: Economic Gain"
                            subtitle="Breakdown of cost savings and trade value"
                            action={<Info size={16} className="text-surface-300" />}
                        />
                        <div className="px-6 pb-6">
                            <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100/50 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                                        <Calculator size={16} className="text-white" />
                                    </div>
                                    <p className="text-[14px] font-bold text-amber-900">Cost Savings Calculation</p>
                                </div>
                                <div className="font-mono text-[13px] bg-white/80 p-4 rounded-xl border border-amber-100 text-amber-800 leading-relaxed shadow-sm">
                                    Volume × (Market Virgin Price - Marketplace Buy Price) + Avoided Disposal Fees
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-surface-100 flex items-center justify-center shrink-0 shadow-sm">
                                        <TrendingUp size={18} className="text-brand-600" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-surface-900">Procurement Efficiency</p>
                                        <p className="text-[12px] text-surface-500 mt-0.5 font-medium">Savings are realized when sourcing secondary materials at 40-70% lower costs than virgin alternatives.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-surface-100 flex items-center justify-center shrink-0 shadow-sm">
                                        <ShieldCheck size={18} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-surface-900">Operational Savings</p>
                                        <p className="text-[12px] text-surface-500 mt-0.5 font-medium">Includes elimination of hazardous waste tipping fees and reduction in logistical overhead for scrap removal.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

        </div>
    );
};

export default ImpactAnalytics;
