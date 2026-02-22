import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Calendar, Clock,
    BarChart3, Leaf, ShieldCheck, TrendingUp, Plus, Search,
    CheckCircle2, AlertCircle, Eye, Share2, Printer, Loader, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ─── Types ─── */
interface Report {
    id: string;
    company_id: string;
    title: string;
    type: 'esg' | 'compliance' | 'analytics' | 'impact';
    status: 'ready' | 'generating' | 'scheduled';
    generated_at: string | null;
    scheduled_for: string | null;
    file_size_kb: number | null;
    file_format: string;
    description: string;
    tags: string[];
    file_url: string | null;
    created_at: string;
}

interface ScheduledReport {
    id: string;
    company_id: string;
    name: string;
    report_type: 'esg' | 'compliance' | 'analytics' | 'impact';
    frequency: string;       /* 'daily' | 'weekly' | 'monthly' | 'quarterly' */
    next_run_at: string;
    file_format: string;
    is_active: boolean;
    created_at: string;
}

/* ─── Helpers ─── */
const getTypeConfig = (type: string) => {
    switch (type) {
        case 'esg': return { icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'ESG' };
        case 'compliance': return { icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Compliance' };
        case 'analytics': return { icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', label: 'Analytics' };
        case 'impact': return { icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', label: 'Impact' };
        default: return { icon: FileText, color: 'text-surface-600', bg: 'bg-surface-50', border: 'border-surface-100', label: 'Report' };
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'ready': return { label: 'Ready', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 };
        case 'generating': return { label: 'Generating', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock };
        case 'scheduled': return { label: 'Scheduled', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Calendar };
        default: return { label: 'Unknown', color: 'text-surface-500 bg-surface-50 border-surface-200', icon: AlertCircle };
    }
};

const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatSize = (kb: number | null) => {
    if (!kb) return '—';
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
};

const FREQ_LABELS: Record<string, string> = {
    daily: 'Every day', weekly: 'Every Monday',
    monthly: 'Every 1st', quarterly: 'Every quarter',
};

/* ─── Card ─── */
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${className}`}>
        {children}
    </div>
);

/* ─── Skeleton ─── */
const Skeleton = () => (
    <div className="p-5 rounded-2xl border border-surface-200/60 bg-white animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface-100 shrink-0" />
            <div className="flex-1 space-y-2.5">
                <div className="h-4 bg-surface-100 rounded w-2/3" />
                <div className="h-3 bg-surface-100 rounded w-full" />
                <div className="h-3 bg-surface-100 rounded w-1/2" />
            </div>
        </div>
    </div>
);

/* ─── Empty State ─── */
const EmptyState = ({ onGenerate }: { onGenerate: () => void }) => (
    <div className="text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center mx-auto mb-6">
            <FileText size={36} className="text-indigo-400" />
        </div>
        <h3 className="text-[20px] font-extrabold text-surface-900 mb-2">No Reports Yet</h3>
        <p className="text-[14px] text-surface-400 font-medium max-w-sm mx-auto mb-6 leading-relaxed">
            Generate your first ESG, compliance, or analytics report to see it here.
        </p>
        <button onClick={onGenerate}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all mx-auto shadow-md shadow-brand-500/20 hover:-translate-y-0.5">
            <Plus size={16} /> Generate First Report
        </button>
    </div>
);

/* ─── Main Component ─── */
const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<Report[]>([]);
    const [scheduled, setScheduled] = useState<ScheduledReport[]>([]);
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    /* ─── Load from Supabase ─── */
    const loadData = async () => {
        setLoading(true);
        const { data: rData } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: sData } = await supabase
            .from('scheduled_reports')
            .select('*')
            .eq('is_active', true)
            .order('next_run_at', { ascending: true });

        setReports((rData as Report[]) ?? []);
        setScheduled((sData as ScheduledReport[]) ?? []);
        if (rData && rData.length > 0) setSelectedId(rData[0].id);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        // Real-time subscription
        const channel = supabase
            .channel('reports-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, loadData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'scheduled_reports' }, loadData)
            .subscribe();
        return () => { channel.unsubscribe(); };
    }, []);

    /* ─── Trigger generation (inserts a 'generating' row) ─── */
    const handleGenerate = async () => {
        setGenerating(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setGenerating(false); return; }

        await supabase.from('reports').insert({
            company_id: user.id,
            title: `Analytics Report — ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
            type: 'analytics',
            status: 'generating',
            description: 'Generating your latest analytics report with material flow data and savings breakdown.',
            tags: ['Analytics'],
            file_format: 'PDF',
        });
        setGenerating(false);
    };

    /* ─── Filter + search ─── */
    const filtered = reports.filter(r => {
        const matchType = filterType === 'all' || r.type === filterType;
        const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchType && matchSearch;
    });

    const selected = reports.find(r => r.id === selectedId);

    /* ─── Derived stats ─── */
    const totalCount = reports.length;
    const esgCount = reports.filter(r => r.type === 'esg').length;
    const complianceCount = reports.filter(r => r.type === 'compliance').length;
    const scheduledCount = scheduled.length;

    return (
        <div className="p-6 lg:p-8 max-w-[1480px] mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900 leading-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                            <FileText size={20} className="text-white" />
                        </div>
                        Reports
                    </h1>
                    <p className="text-surface-400 mt-1 text-[15px] font-medium">
                        Generate and download ESG reports, compliance documents, and analytics exports.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadData}
                        className="px-4 py-2.5 text-[13px] font-semibold text-surface-700 bg-white border border-surface-200 hover:border-surface-300 rounded-xl shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5">
                        <RefreshCw size={13} className="text-surface-400" /> Refresh
                    </button>
                    <button onClick={handleGenerate} disabled={generating}
                        className="px-5 py-2.5 text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all hover:-translate-y-0.5">
                        {generating ? <Loader size={15} className="animate-spin" /> : <Plus size={16} />}
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Reports', value: loading ? '—' : `${totalCount}`, icon: FileText, color: 'from-indigo-500 to-purple-600' },
                    { label: 'ESG Reports', value: loading ? '—' : `${esgCount}`, icon: Leaf, color: 'from-emerald-500 to-teal-600' },
                    { label: 'Compliance Docs', value: loading ? '—' : `${complianceCount}`, icon: ShieldCheck, color: 'from-blue-500 to-indigo-600' },
                    { label: 'Scheduled', value: loading ? '—' : `${scheduledCount}`, icon: Calendar, color: 'from-amber-500 to-orange-600' },
                ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3.5 bg-white rounded-2xl px-5 py-4 border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                            <stat.icon size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[12px] font-semibold text-surface-400 uppercase tracking-wide">{stat.label}</p>
                            {loading
                                ? <div className="h-5 bg-surface-100 rounded animate-pulse w-8 mt-0.5" />
                                : <p className="text-[20px] font-bold text-surface-900 tracking-tight leading-tight">{stat.value}</p>
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" size={15} />
                    <input type="text" placeholder="Search reports..."
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-surface-200/80 text-[13px] rounded-xl pl-10 pr-4 py-2.5 text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'esg', label: 'ESG' },
                        { key: 'compliance', label: 'Compliance' },
                        { key: 'analytics', label: 'Analytics' },
                        { key: 'impact', label: 'Impact' },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilterType(f.key)}
                            className={`px-3.5 py-2 text-[12px] font-bold rounded-lg border transition-all ${filterType === f.key
                                ? 'bg-surface-900 text-white border-surface-900'
                                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Reports List */}
                <div className="lg:col-span-2 space-y-3">
                    {loading && [1, 2, 3].map(i => <Skeleton key={i} />)}

                    {!loading && filtered.length === 0 && reports.length === 0 && (
                        <EmptyState onGenerate={handleGenerate} />
                    )}

                    {!loading && filtered.length === 0 && reports.length > 0 && (
                        <div className="text-center py-16">
                            <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-3">
                                <Search size={24} className="text-surface-300" />
                            </div>
                            <h3 className="text-[15px] font-bold text-surface-900 mb-1">No reports found</h3>
                            <p className="text-[13px] text-surface-400 font-medium">Try adjusting your search or filter criteria.</p>
                        </div>
                    )}

                    {!loading && filtered.map(report => {
                        const typeConfig = getTypeConfig(report.type);
                        const statusConfig = getStatusBadge(report.status);
                        const isSelected = selectedId === report.id;
                        const TypeIcon = typeConfig.icon;
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div key={report.id} onClick={() => setSelectedId(report.id)}
                                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 group ${isSelected
                                    ? 'bg-white border-brand-500/40 shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
                                    : 'bg-white border-surface-200/60 hover:border-surface-300 hover:shadow-md'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-11 h-11 rounded-xl ${typeConfig.bg} ${typeConfig.border} border flex items-center justify-center shrink-0`}>
                                        <TypeIcon size={20} className={typeConfig.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1.5">
                                            <h3 className={`text-[14px] font-bold text-surface-900 leading-snug transition-colors ${isSelected ? 'text-brand-700' : 'group-hover:text-brand-600'}`}>
                                                {report.title}
                                            </h3>
                                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${statusConfig.color}`}>
                                                <StatusIcon size={10} />
                                                {statusConfig.label}
                                            </div>
                                        </div>
                                        <p className="text-[12px] text-surface-400 font-medium leading-relaxed line-clamp-2 mb-3">
                                            {report.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-[11px] text-surface-400 font-medium flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={11} />
                                                {report.generated_at ? formatDate(report.generated_at) : report.scheduled_for ? `Scheduled: ${formatDate(report.scheduled_for)}` : 'Generating...'}
                                            </span>
                                            {report.file_size_kb && (
                                                <span className="flex items-center gap-1">
                                                    <FileText size={11} /> {formatSize(report.file_size_kb)}
                                                </span>
                                            )}
                                            <span className="bg-surface-100 text-surface-600 px-2 py-0.5 rounded font-bold text-[10px]">
                                                {report.file_format}
                                            </span>
                                            <div className="flex gap-1.5 ml-auto">
                                                {report.tags.map(tag => (
                                                    <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${typeConfig.bg} ${typeConfig.color}`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Panel */}
                <div className="space-y-5">
                    {/* Selected Report Detail */}
                    {selected ? (
                        <Card>
                            <div className="p-5 border-b border-surface-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-11 h-11 rounded-xl ${getTypeConfig(selected.type).bg} ${getTypeConfig(selected.type).border} border flex items-center justify-center`}>
                                        {React.createElement(getTypeConfig(selected.type).icon, { size: 20, className: getTypeConfig(selected.type).color })}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[14px] font-bold text-surface-900 leading-snug">{selected.title}</h3>
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${getTypeConfig(selected.type).color}`}>
                                            {getTypeConfig(selected.type).label}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[12px] text-surface-500 font-medium leading-relaxed">{selected.description}</p>
                            </div>

                            <div className="p-5 space-y-3">
                                {[
                                    { label: 'Date', value: selected.generated_at ? formatDate(selected.generated_at) : '—' },
                                    { label: 'Format', value: selected.file_format },
                                    { label: 'Size', value: formatSize(selected.file_size_kb) },
                                    { label: 'Status', value: getStatusBadge(selected.status).label },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-[13px]">
                                        <span className="text-surface-400 font-medium">{item.label}</span>
                                        <span className="font-bold text-surface-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-5 border-t border-surface-100 space-y-2.5">
                                {selected.status === 'ready' && (
                                    <>
                                        <a href={selected.file_url ?? '#'} target="_blank" rel="noopener noreferrer"
                                            className="w-full py-2.5 text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                                            <Download size={14} /> Download {selected.file_format}
                                        </a>
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-2.5 text-[12px] font-semibold text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-surface-200/60">
                                                <Eye size={13} /> Preview
                                            </button>
                                            <button className="flex-1 py-2.5 text-[12px] font-semibold text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-surface-200/60">
                                                <Share2 size={13} /> Share
                                            </button>
                                            <button className="flex-1 py-2.5 text-[12px] font-semibold text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-surface-200/60">
                                                <Printer size={13} /> Print
                                            </button>
                                        </div>
                                    </>
                                )}
                                {selected.status === 'generating' && (
                                    <div className="text-center py-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2 border border-amber-100">
                                            <Clock size={18} className="text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                                        </div>
                                        <p className="text-[13px] font-bold text-surface-900">Report is generating...</p>
                                        <p className="text-[12px] text-surface-400 font-medium mt-0.5">It will appear here automatically when ready.</p>
                                    </div>
                                )}
                                {selected.status === 'scheduled' && (
                                    <div className="text-center py-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2 border border-blue-100">
                                            <Calendar size={18} className="text-blue-500" />
                                        </div>
                                        <p className="text-[13px] font-bold text-surface-900">Scheduled Report</p>
                                        <p className="text-[12px] text-surface-400 font-medium mt-0.5">
                                            Will be generated on {formatDate(selected.scheduled_for)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ) : !loading && (
                        <Card>
                            <div className="p-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-3">
                                    <FileText size={24} className="text-surface-300" />
                                </div>
                                <h3 className="text-[15px] font-bold text-surface-900 mb-1">Select a Report</h3>
                                <p className="text-[13px] text-surface-400 font-medium">Click on any report to view details and download.</p>
                            </div>
                        </Card>
                    )}

                    {/* Scheduled Reports */}
                    <Card>
                        <div className="p-5 border-b border-surface-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-[14px] font-bold text-surface-900">Scheduled Reports</h3>
                                    <p className="text-[12px] font-medium text-surface-400 mt-0.5">Auto-generated on schedule</p>
                                </div>
                                <button className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg hover:bg-brand-100 transition-colors">
                                    + Add
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-2.5">
                            {loading && [1, 2].map(i => (
                                <div key={i} className="h-14 bg-surface-50 rounded-xl animate-pulse" />
                            ))}
                            {!loading && scheduled.length === 0 && (
                                <p className="text-[12px] text-surface-400 font-medium text-center py-4">
                                    No scheduled reports yet. Click <strong>+ Add</strong> to set one up.
                                </p>
                            )}
                            {!loading && scheduled.map((sr) => (
                                <div key={sr.id} className="p-3 rounded-xl bg-surface-50 hover:bg-white border border-transparent hover:border-surface-200 transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[12px] font-bold text-surface-800 group-hover:text-brand-600 transition-colors">{sr.name}</span>
                                        <span className="text-[10px] font-bold text-surface-400 bg-surface-100 px-2 py-0.5 rounded">{sr.file_format}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-surface-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} /> {FREQ_LABELS[sr.frequency] ?? sr.frequency}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} /> Next: {formatDate(sr.next_run_at)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Reports;
