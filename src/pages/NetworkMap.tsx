import React, { useState, useEffect, useRef } from 'react';
import {
    Globe, Factory, Leaf, Filter,
    Activity, ChevronDown, Package, MapPin, Maximize2, Loader, ArrowUpRight
} from 'lucide-react';
import { getMyNetworkConnections, getMyCompany, type NetworkConnection, type Company } from '../lib/db';
import { Link } from 'react-router-dom';

/* ─── Helpers ─── */
const connTypeColor = (type: string) => {
    switch (type) {
        case 'verified_partner': return { bg: '#D1FAE5', border: '#6EE7B7', dot: '#10B981', label: 'Verified Partner' };
        case 'trade': return { bg: '#DBEAFE', border: '#93C5FD', dot: '#3B82F6', label: 'Trade' };
        case 'affiliate': return { bg: '#EDE9FE', border: '#C4B5FD', dot: '#8B5CF6', label: 'Affiliate' };
        default: return { bg: '#FEF3C7', border: '#FCD34D', dot: '#F59E0B', label: 'Pending' };
    }
};

const statusColor = (status: string) => {
    if (status === 'active') return '#10B981';
    if (status === 'paused') return '#F59E0B';
    return '#D1D5DB';
};

/* ─── Card ─── */
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${className}`}>
        {children}
    </div>
);

/* ─── Empty State ─── */
const EmptyState = () => (
    <div className="p-6 lg:p-8 max-w-[1480px] mx-auto space-y-6 animate-fade-in">
        <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                    <Globe size={20} className="text-white" />
                </div>
                Network Map
            </h1>
            <p className="text-surface-400 mt-1 text-[15px] font-medium">Waste flow visualization across your industrial network.</p>
        </div>
        <Card className="p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 flex items-center justify-center mx-auto mb-6">
                <Globe size={36} className="text-teal-500" />
            </div>
            <h3 className="text-[22px] font-extrabold text-surface-900 mb-3">No Network Connections Yet</h3>
            <p className="text-[15px] text-surface-400 font-medium max-w-md mx-auto mb-8 leading-relaxed">
                Your partner network will appear here once you complete trades or establish verified partnerships through the platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/app/opportunities" className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md hover:-translate-y-0.5">
                    Browse Opportunities <ArrowUpRight size={14} />
                </Link>
                <Link to="/app/find" className="px-6 py-3 bg-white text-surface-700 font-bold rounded-xl border border-surface-200 flex items-center gap-2 transition-all hover:-translate-y-0.5">
                    Source Materials <ArrowUpRight size={14} />
                </Link>
            </div>
        </Card>
    </div>
);

/* ─── Network Node (SVG) ─── */
const NetworkNode = ({ name, type, status, x, y, isSelected, volume, onClick }: {
    name: string; type: string; status: string; x: number; y: number;
    isSelected: boolean; volume?: string; onClick: () => void;
}) => {
    const colors = connTypeColor(type);
    return (
        <g onClick={onClick} className="cursor-pointer">
            {isSelected && (
                <circle cx={x} cy={y} r={32} fill="none" stroke={colors.dot} strokeWidth={1.5} strokeOpacity={0.3}
                    style={{ animation: 'nodeRipple 2s ease-out infinite' }} />
            )}
            <circle cx={x} cy={y + 2} r={isSelected ? 26 : 22} fill="rgba(0,0,0,0.06)" filter="url(#shadow)" />
            <circle cx={x} cy={y} r={isSelected ? 26 : 22} fill={colors.bg} stroke={isSelected ? colors.dot : colors.border} strokeWidth={isSelected ? 2.5 : 1.5} />
            <circle cx={x} cy={y} r={6} fill={colors.dot} opacity={status === 'active' ? 1 : 0.4} />
            {status === 'active' && (
                <circle cx={x + 16} cy={y - 16} r={4} fill="#10B981" stroke="white" strokeWidth={2} />
            )}
            <text x={x} y={y + (isSelected ? 42 : 38)} textAnchor="middle" fill="#1C1C1E"
                fontSize={isSelected ? 12 : 11} fontWeight={isSelected ? 700 : 600} fontFamily="Inter, system-ui, sans-serif">
                {name.length > 16 ? name.slice(0, 14) + '…' : name}
            </text>
            {volume && (
                <text x={x} y={y + (isSelected ? 56 : 52)} textAnchor="middle" fill="#A1A1AA"
                    fontSize={10} fontWeight={500} fontFamily="Inter, system-ui, sans-serif">
                    {volume}
                </text>
            )}
        </g>
    );
};

/* ─── Animated Flow Path ─── */
const FlowPath = ({ x1, y1, x2, y2, active, co2, isSelected }: {
    x1: number; y1: number; x2: number; y2: number;
    active: boolean; co2: number; isSelected: boolean;
}) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - 40;
    const d = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
    const stroke = co2 > 500 ? '#10B981' : co2 > 100 ? '#3B82F6' : '#8B5CF6';
    const width = co2 > 500 ? 3 : co2 > 100 ? 2 : 1.5;
    return (
        <g>
            <path d={d} fill="none" stroke={active ? stroke : '#E5E7EB'} strokeWidth={isSelected ? width + 1.5 : width}
                strokeOpacity={active ? (isSelected ? 1 : 0.4) : 0.2} strokeLinecap="round" />
            {active && (
                <path d={d} fill="none" stroke={stroke} strokeWidth={isSelected ? width + 1 : width}
                    strokeOpacity={isSelected ? 0.9 : 0.6} strokeLinecap="round" strokeDasharray="8 12"
                    style={{ animation: 'flowDash 2s linear infinite' }} />
            )}
        </g>
    );
};

/* ─── Main Component ─── */
const NetworkMap = () => {
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState<NetworkConnection[]>([]);
    const [myCompany, setMyCompany] = useState<Company | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filterType, setFilterType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [conns, me] = await Promise.all([getMyNetworkConnections(), getMyCompany()]);
            setConnections(conns);
            setMyCompany(me);
            setLoading(false);
        };
        load();
    }, []);

    if (!loading && connections.length === 0) return <EmptyState />;

    /* ─── Compute SVG positions ─── */
    // Center node = "me", partners placed in a circle around
    const CX = 460, CY = 260, RADIUS = 180;
    const partnerPositions = connections.map((_, i) => {
        const angle = (2 * Math.PI * i) / connections.length - Math.PI / 2;
        return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) };
    });

    const filtered = filterType === 'all' ? connections : connections.filter(c => c.connection_type === filterType);

    /* ─── KPIs from real data ─── */
    const totalCO2 = connections.reduce((s, c) => s + c.co2_saved_kg, 0);
    const totalVol = connections.reduce((s, c) => s + (c.volume_mt ?? 0), 0);
    const activeCount = connections.filter(c => c.status === 'active').length;

    const selectedConn = connections.find(c => c.id === selectedId);

    return (
        <div className="p-6 lg:p-8 max-w-[1480px] mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900 leading-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                            <Globe size={20} className="text-white" />
                        </div>
                        Network Map
                    </h1>
                    <p className="text-surface-400 mt-1 text-[15px] font-medium">
                        Real-time waste flow visualization across your industrial network
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2.5 text-[13px] font-semibold text-surface-700 bg-white border border-surface-200 hover:border-surface-300 rounded-xl shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5">
                        <Filter size={14} className="text-surface-400" /> Filter
                        <ChevronDown size={12} className={`text-surface-300 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    <button className="px-4 py-2.5 text-[13px] font-semibold text-surface-700 bg-white border border-surface-200 hover:border-surface-300 rounded-xl shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5">
                        <Maximize2 size={14} className="text-surface-400" /> Fullscreen
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="flex items-center gap-2 animate-fade-in flex-wrap">
                    {['all', 'trade', 'verified_partner', 'affiliate', 'pending'].map(type => (
                        <button key={type} onClick={() => setFilterType(type)}
                            className={`px-4 py-2 text-[12px] font-bold rounded-lg border transition-all capitalize ${filterType === type ? 'bg-surface-900 text-white border-surface-900' : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'}`}>
                            {type === 'all' ? 'All' : type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            )}

            {/* Stats Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Partners', value: loading ? '—' : `${activeCount}`, icon: Factory, color: 'from-emerald-500 to-teal-600' },
                    { label: 'Total Connections', value: loading ? '—' : `${connections.length}`, icon: Activity, color: 'from-blue-500 to-indigo-600' },
                    { label: 'Volume Exchanged', value: loading ? '—' : `${totalVol.toFixed(0)} MT`, icon: Package, color: 'from-amber-500 to-orange-600' },
                    { label: 'CO₂ Saved', value: loading ? '—' : `${(totalCO2 / 1000).toFixed(1)} MT`, icon: Leaf, color: 'from-teal-500 to-cyan-600' },
                ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3.5 bg-white rounded-2xl px-5 py-4 border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                            <stat.icon size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[12px] font-semibold text-surface-400 uppercase tracking-wide">{stat.label}</p>
                            {loading
                                ? <div className="h-5 bg-surface-100 rounded animate-pulse w-12 mt-0.5" />
                                : <p className="text-[20px] font-bold text-surface-900 tracking-tight leading-tight">{stat.value}</p>
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* Map + Detail Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Map Canvas */}
                <Card className="lg:col-span-2 overflow-hidden relative">
                    <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-surface-100">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[13px] font-semibold text-surface-700">Live Network</span>
                            <span className="text-[12px] text-surface-300 font-medium ml-2">
                                {connections.length} partners · {activeCount} active
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center" style={{ minHeight: 520 }}>
                            <Loader size={36} className="text-surface-300 animate-spin" />
                        </div>
                    ) : (
                        <div className="relative bg-gradient-to-br from-surface-50 via-white to-teal-50/20" style={{ minHeight: 520 }}>
                            <div className="absolute inset-0 opacity-[0.35]"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px'
                                }} />
                            <svg ref={svgRef} viewBox="0 0 920 520" className="w-full h-full relative z-10" style={{ minHeight: 520 }}>
                                <defs>
                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                        <feOffset dx="0" dy="1" />
                                        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                    <style>{`
                                        @keyframes flowDash { to { stroke-dashoffset: -40; } }
                                        @keyframes nodeRipple { 0% { r: 26; opacity: 0.6; } 100% { r: 50; opacity: 0; } }
                                    `}</style>
                                </defs>

                                {/* Flows from center to partners */}
                                {filtered.map((conn) => {
                                    const pos = partnerPositions[connections.indexOf(conn)] || { x: 0, y: 0 };
                                    return (
                                        <FlowPath key={conn.id}
                                            x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                                            active={conn.status === 'active'}
                                            co2={conn.co2_saved_kg}
                                            isSelected={selectedId === conn.id}
                                        />
                                    );
                                })}

                                {/* Partner nodes */}
                                {connections.map((conn, i) => {
                                    const pos = partnerPositions[i];
                                    if (!filtered.includes(conn)) return null;
                                    return (
                                        <NetworkNode key={conn.id}
                                            name={conn.partner_name || 'Partner'}
                                            type={conn.connection_type}
                                            status={conn.status}
                                            x={pos.x} y={pos.y}
                                            isSelected={selectedId === conn.id}
                                            volume={conn.volume_mt ? `${conn.volume_mt} MT` : undefined}
                                            onClick={() => setSelectedId(conn.id === selectedId ? null : conn.id)}
                                        />
                                    );
                                })}

                                {/* Center node = me */}
                                {myCompany && (
                                    <NetworkNode
                                        name={myCompany.company_name || 'Your Company'}
                                        type="trade"
                                        status="active"
                                        x={CX} y={CY}
                                        isSelected={false}
                                        onClick={() => { }}
                                    />
                                )}
                            </svg>

                            {/* Legend */}
                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-xl border border-surface-200/60 px-4 py-3 shadow-sm">
                                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">CO₂ Intensity</p>
                                <div className="flex items-center gap-4">
                                    {[
                                        { label: 'High (>500kg)', color: '#10B981', width: 3 },
                                        { label: 'Med (>100kg)', color: '#3B82F6', width: 2 },
                                        { label: 'Low', color: '#8B5CF6', width: 1.5 },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center gap-1.5">
                                            <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke={item.color} strokeWidth={item.width} strokeLinecap="round" /></svg>
                                            <span className="text-[10px] font-semibold text-surface-500">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Detail Panel */}
                <div className="space-y-5">
                    {selectedConn ? (
                        <Card>
                            <div className="p-5 border-b border-surface-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: connTypeColor(selectedConn.connection_type).bg, border: `1px solid ${connTypeColor(selectedConn.connection_type).border}` }}>
                                        <Factory size={18} style={{ color: connTypeColor(selectedConn.connection_type).dot }} />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-bold text-surface-900">
                                            {selectedConn.material_type || 'Trade Connection'}
                                        </h3>
                                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                            style={{ color: connTypeColor(selectedConn.connection_type).dot, backgroundColor: connTypeColor(selectedConn.connection_type).bg }}>
                                            {connTypeColor(selectedConn.connection_type).label}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className="bg-surface-50 rounded-xl p-3 text-center">
                                        <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wide">Volume</p>
                                        <p className="text-[16px] font-bold text-surface-900 mt-0.5">{selectedConn.volume_mt ? `${selectedConn.volume_mt} MT` : '—'}</p>
                                    </div>
                                    <div className="bg-surface-50 rounded-xl p-3 text-center">
                                        <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wide">Status</p>
                                        <p className="text-[16px] font-bold text-surface-900 mt-0.5 flex items-center justify-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor(selectedConn.status) }} />
                                            {selectedConn.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2.5">
                                    {[
                                        { label: 'CO₂ Saved', value: `${selectedConn.co2_saved_kg} kg` },
                                        { label: 'Distance', value: selectedConn.distance_km ? `${selectedConn.distance_km} km` : '—' },
                                        { label: 'Established', value: new Date(selectedConn.established_at).toLocaleDateString() },
                                        { label: 'Last Active', value: new Date(selectedConn.last_active_at).toLocaleDateString() },
                                    ].map(row => (
                                        <div key={row.label} className="flex justify-between items-center py-2 border-b border-surface-100 last:border-0">
                                            <span className="text-[12px] font-medium text-surface-500">{row.label}</span>
                                            <span className="text-[13px] font-bold text-surface-900">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <div className="p-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-3">
                                    <MapPin size={24} className="text-surface-300" />
                                </div>
                                <h3 className="text-[15px] font-bold text-surface-900 mb-1">Select a Connection</h3>
                                <p className="text-[13px] text-surface-400 font-medium">Click on any partner node to view trade details.</p>
                            </div>
                        </Card>
                    )}

                    {/* Top Connections */}
                    <Card>
                        <div className="p-5 border-b border-surface-100">
                            <h3 className="text-[14px] font-bold text-surface-900">Top Connections</h3>
                            <p className="text-[12px] font-medium text-surface-400 mt-0.5">Highest CO₂ impact trades</p>
                        </div>
                        <div className="p-4 space-y-2">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-12 bg-surface-50 rounded-xl animate-pulse" />)
                            ) : connections
                                .filter(c => c.status === 'active')
                                .sort((a, b) => b.co2_saved_kg - a.co2_saved_kg)
                                .slice(0, 4)
                                .map((conn, i) => (
                                    <div key={conn.id}
                                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedId(conn.id === selectedId ? null : conn.id)}>
                                        <span className="text-[12px] font-bold text-surface-300 w-5">#{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-bold text-surface-800 truncate capitalize">
                                                {conn.material_type || conn.connection_type.replace('_', ' ')}
                                            </p>
                                            <p className="text-[11px] text-surface-400 font-medium truncate">
                                                {conn.partner_name || 'Partner'} · {conn.volume_mt ? `${conn.volume_mt} MT` : '—'}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 justify-end">
                                                <Leaf size={8} /> {conn.co2_saved_kg} kg CO₂
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            {!loading && connections.filter(c => c.status === 'active').length === 0 && (
                                <p className="text-[12px] text-surface-400 text-center py-4">No active connections yet</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NetworkMap;
