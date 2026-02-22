import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ListPlus,
    Recycle,
    ChevronDown,
    Lightbulb,
    BarChart3,
    Bot,
    FileText,
    LogOut,
    Menu,
    Bell,
    Settings,
    X,
    Clock,
    MessageSquare,
    Orbit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Sidebar Item ─── */
const SidebarItem = ({ icon: Icon, label, to, badge }: { icon: any; label: string; to: string; badge?: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-brand-50 text-brand-900 font-semibold border border-brand-100/60'
                : 'text-surface-800/80 hover:bg-surface-50 hover:text-surface-900 font-medium border border-transparent'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-brand-600' : 'text-surface-300 group-hover:text-surface-500'} transition-colors`} />
                <span className="text-[14px] flex-1">{label}</span>
                {badge && (
                    <span className="text-[11px] font-bold bg-brand-500 text-white px-1.5 py-0.5 rounded-md min-w-[20px] text-center leading-none">
                        {badge}
                    </span>
                )}
            </>
        )}
    </NavLink>
);

/* ─── Sidebar Section Label ─── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-3.5 text-[11px] font-bold text-surface-400 uppercase tracking-[0.08em] mb-2 mt-6">
        {children}
    </p>
);


const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(true);
    const location = useLocation();
    const { user, logout } = useAuth();

    const isProcessingScreen = location.pathname.includes('/processing');
    if (isProcessingScreen) return <Outlet />;

    return (
        <div className="min-h-screen bg-[#F5F6F8] flex text-surface-900 font-sans">

            {/* ─── Sidebar ─── */}
            <aside className={`fixed lg:relative z-40 h-screen bg-white w-[252px] flex flex-col transition-transform duration-300 border-r border-surface-200/60 shadow-[2px_0_20px_rgba(0,0,0,0.02)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-surface-100 shrink-0">
                    <NavLink to="/" className="flex items-center gap-2.5 group/logo hover:opacity-80 transition-all">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover/logo:scale-105 transition-transform">
                            <Orbit size={18} className="text-white" />
                        </div>
                        <span className="font-extrabold text-[17px] tracking-tight text-surface-900 group-hover/logo:text-brand-700 transition-colors">MOLE</span>
                    </NavLink>
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-0.5">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/app" />
                    <SidebarItem icon={ListPlus} label="List Waste" to="/app/list-waste" />
                    <SidebarItem icon={Recycle} label="Find Materials" to="/app/find" />
                    <SidebarItem icon={MessageSquare} label="Messages" to="/app/messages" />
                    <SidebarItem icon={Lightbulb} label="Opportunities" to="/app/opportunities" badge="3" />

                    <SectionLabel>Analytics</SectionLabel>
                    <SidebarItem icon={BarChart3} label="Impact Analytics" to="/app/analytics" />
                    <SidebarItem icon={Bot} label="AI Assistant" to="/app/chat" />
                    <SidebarItem icon={Clock} label="Trade History" to="/app/network" />

                    <SectionLabel>System</SectionLabel>
                    <SidebarItem icon={FileText} label="Reports" to="/app/reports" />
                </div>

            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-surface-900/10 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ─── Main Content ─── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-surface-200/40 flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="p-2 lg:hidden text-surface-800 hover:bg-surface-100 rounded-lg" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <NavLink
                            to="/app/settings"
                            className={({ isActive }) => `p-2.5 rounded-xl transition-colors ${isActive ? 'bg-brand-50 text-brand-600' : 'text-surface-500 hover:bg-surface-50'}`}
                        >
                            <Settings size={18} />
                        </NavLink>
                        <button
                            onClick={() => setShowNotification(!showNotification)}
                            className="relative p-2.5 text-surface-500 hover:bg-surface-50 rounded-xl transition-colors"
                        >
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>

                        {/* Dropdown Notification Popup */}
                        {showNotification && (
                            <div className="absolute top-full right-0 mt-3 w-screen max-w-[380px] z-[100] animate-slide-in-top">
                                {/* Triangle Pointer */}
                                <div className="absolute -top-1.5 right-4 w-4 h-4 bg-surface-900 rotate-45 border-l border-t border-white/10" />

                                <div className="bg-surface-900 border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] shadow-black/40 overflow-hidden relative group">
                                    {/* Background Decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:bg-brand-500/30 transition-colors" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                                                    <Bell size={18} className="text-white animate-bounce" style={{ animationDuration: '3s' }} />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-[15px]">Smart Notification</h4>
                                                    <p className="text-brand-400 text-[11px] font-bold uppercase tracking-wider">Live Activity</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowNotification(false); }}
                                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all flex items-center justify-center border border-white/10"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                                                <p className="text-white/90 text-[14px] leading-relaxed">
                                                    <span className="text-brand-400 font-bold">New Synergy!</span> Our AI engine identified a match for your <span className="text-white font-bold">Steel Slag</span> stream.
                                                </p>
                                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                                                    <div className="flex -space-x-2">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-surface-900 bg-surface-800 flex items-center justify-center overflow-hidden">
                                                                <div className="bg-brand-500 w-full h-full opacity-60" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-[11px] text-white/40 font-medium">+3 potential buyers</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-1">
                                                <NavLink
                                                    to="/app/opportunities"
                                                    onClick={() => setShowNotification(false)}
                                                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-[13px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 text-center"
                                                >
                                                    View Match
                                                </NavLink>
                                                <button
                                                    onClick={() => setShowNotification(false)}
                                                    className="px-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-[13px] border border-white/10 transition-all font-bold"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Profile (Top Right) */}
                        <div className="relative border-l border-surface-200/50 pl-2 lg:pl-4 ml-2 max-w-[150px] lg:max-w-[200px]">
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="flex items-center gap-2 lg:gap-3 hover:bg-surface-50 p-1.5 pr-2 lg:pr-3 rounded-xl transition-colors w-full"
                            >
                                <div className="w-8 h-8 rounded-[10px] bg-[#0FAB76] flex items-center justify-center font-bold text-white text-[14px] shrink-0">
                                    {user?.name?.charAt(0).toLowerCase() || 'a'}
                                </div>
                                <div className="text-left hidden lg:block min-w-0 flex-1">
                                    <p className="text-[13px] font-bold text-surface-900 leading-tight truncate">{user?.name || 'User Profile'}</p>
                                    <p className="text-[11px] font-medium text-surface-400 mt-0.5 truncate">{user?.company || 'Company'}</p>
                                </div>
                                <ChevronDown size={14} className={`hidden lg:block text-surface-300 shrink-0 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {profileMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-[200px] bg-white border border-surface-200 rounded-xl shadow-lg p-1.5 z-[100] animate-fade-in">
                                    <button
                                        onClick={() => { logout(); setProfileMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <LogOut size={14} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>


                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
