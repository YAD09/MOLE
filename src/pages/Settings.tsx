import React, { useState } from 'react';
import {
    Settings as SettingsIcon, User, Building2, Bell, Shield,
    Globe, Link2, Mail, Phone, MapPin, Camera, Save, ChevronRight,
    Check, Monitor, Key, LogOut, Trash2, Users,
    Zap, ToggleLeft, ToggleRight, Lock, Eye, EyeOff,
    FileText, Download, AlertTriangle, TrendingUp, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Card ─── */
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${className}`}>
        {children}
    </div>
);

/* ─── Toggle Switch ─── */
const Toggle = ({ enabled, onChange, label, description }: {
    enabled: boolean; onChange: () => void; label: string; description?: string;
}) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <p className="text-[13px] font-semibold text-surface-900">{label}</p>
            {description && <p className="text-[11px] text-surface-400 font-medium mt-0.5">{description}</p>}
        </div>
        <button onClick={onChange} className="shrink-0">
            {enabled ? (
                <ToggleRight size={28} className="text-brand-500" />
            ) : (
                <ToggleLeft size={28} className="text-surface-300" />
            )}
        </button>
    </div>
);

/* ─── Section Header ─── */
const SectionHeader = ({ icon: Icon, title, subtitle, color }: {
    icon: any; title: string; subtitle: string; color: string;
}) => (
    <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
            <Icon size={18} className="text-white" />
        </div>
        <div>
            <h3 className="text-[16px] font-bold text-surface-900">{title}</h3>
            <p className="text-[12px] font-medium text-surface-400">{subtitle}</p>
        </div>
    </div>
);

/* ─── Input Field ─── */
const InputField = ({ label, value, onChange, type = 'text', placeholder, icon: Icon, disabled = false }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; icon?: any; disabled?: boolean;
}) => (
    <div>
        <label className="text-[12px] font-bold text-surface-500 uppercase tracking-wider mb-1.5 block">{label}</label>
        <div className="relative">
            {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />}
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full bg-white border border-surface-200/80 text-[13px] rounded-xl ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all ${disabled ? 'bg-surface-50 text-surface-400 cursor-not-allowed' : ''}`}
            />
        </div>
    </div>
);

/* ─── Navigation Tabs ─── */
const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'data', label: 'Data & Export', icon: Download },
];

/* ─── Main Component ─── */
const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [saved, setSaved] = useState(false);

    /* Profile State */
    const [fullName, setFullName] = useState(user?.name || 'Alex Mercer');
    const [email, setEmail] = useState(user?.email || 'alex@acmesteel.com');
    const [phone, setPhone] = useState('+1 (555) 234-7890');
    const [role, setRole] = useState('Sustainability Manager');
    const [location, setLocation] = useState('San Francisco, CA');

    /* Company State */
    const [companyName, setCompanyName] = useState(user?.company || 'Acme Steel Co.');
    const [industry, setIndustry] = useState('Steel Manufacturing');
    const [companySize, setCompanySize] = useState('500-1000');
    const [website, setWebsite] = useState('https://acmesteel.com');
    const [companyLocation, setCompanyLocation] = useState('San Francisco, CA, USA');

    /* Notification State */
    const [emailNotif, setEmailNotif] = useState(true);
    const [pushNotif, setPushNotif] = useState(true);
    const [matchAlerts, setMatchAlerts] = useState(true);
    const [reportReady, setReportReady] = useState(true);
    const [newOpps, setNewOpps] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);
    const [priceAlerts, setPriceAlerts] = useState(true);
    const [systemUpdates, setSystemUpdates] = useState(false);

    /* Security State */
    const [twoFactor, setTwoFactor] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState('30');
    const [showPassword, setShowPassword] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-6 lg:p-8 max-w-[1480px] mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900 leading-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center shadow-md">
                            <SettingsIcon size={20} className="text-white" />
                        </div>
                        Settings
                    </h1>
                    <p className="text-surface-400 mt-1 text-[15px] font-medium">
                        Manage your account, team, notifications, and integrations.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    className={`px-5 py-2.5 text-[13px] font-bold rounded-xl shadow-md flex items-center gap-2 transition-all hover:-translate-y-0.5 ${saved
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
                        }`}
                >
                    {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
                </button>
            </div>

            {/* Content: Tabs + Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Sidebar Tabs */}
                <Card className="lg:col-span-1 h-fit">
                    <div className="p-3 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === tab.id
                                    ? 'bg-brand-50 text-brand-900 font-semibold border border-brand-100/60'
                                    : 'text-surface-800/80 hover:bg-surface-50 hover:text-surface-900 font-medium border border-transparent'
                                    }`}
                            >
                                <tab.icon size={17} className={activeTab === tab.id ? 'text-brand-600' : 'text-surface-300'} />
                                <span className="text-[13px]">{tab.label}</span>
                            </button>
                        ))}

                        <div className="border-t border-surface-100 mt-3 pt-3">
                            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors text-left">
                                <LogOut size={17} />
                                <span className="text-[13px]">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Main Panel */}
                <div className="lg:col-span-3 space-y-6">

                    {/* ─── Profile Tab ─── */}
                    {activeTab === 'profile' && (
                        <>
                            <Card>
                                <div className="p-6">
                                    <SectionHeader icon={User} title="Personal Information" subtitle="Manage your personal details" color="from-blue-500 to-indigo-600" />

                                    {/* Avatar */}
                                    <div className="flex items-center gap-5 mb-6 p-4 bg-surface-50 rounded-xl border border-surface-200/60">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center font-bold text-white text-2xl shadow-md shadow-brand-500/20 shrink-0">
                                            {fullName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[15px] font-bold text-surface-900">{fullName}</p>
                                            <p className="text-[12px] text-surface-400 font-medium">{role} at {companyName}</p>
                                        </div>
                                        <button className="px-4 py-2 text-[12px] font-semibold text-surface-600 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors flex items-center gap-1.5">
                                            <Camera size={13} /> Change Photo
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Full Name" value={fullName} onChange={setFullName} icon={User} />
                                        <InputField label="Email Address" value={email} onChange={setEmail} type="email" icon={Mail} />
                                        <InputField label="Phone" value={phone} onChange={setPhone} icon={Phone} />
                                        <InputField label="Role / Title" value={role} onChange={setRole} icon={Zap} />
                                        <InputField label="Location" value={location} onChange={setLocation} icon={MapPin} />
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* ─── Company Tab ─── */}
                    {activeTab === 'company' && (
                        <>
                            <Card>
                                <div className="p-6">
                                    <SectionHeader icon={Building2} title="Company Information" subtitle="Your organization details" color="from-emerald-500 to-teal-600" />

                                    <div className="flex items-center gap-5 mb-6 p-4 bg-surface-50 rounded-xl border border-surface-200/60">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-700 to-surface-900 flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
                                            {companyName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[15px] font-bold text-surface-900">{companyName}</p>
                                            <p className="text-[12px] text-surface-400 font-medium">{industry} • {companySize} employees</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Company Name" value={companyName} onChange={setCompanyName} icon={Building2} />
                                        <InputField label="Industry" value={industry} onChange={setIndustry} icon={Zap} />
                                        <InputField label="Company Size" value={companySize} onChange={setCompanySize} icon={Users} />
                                        <InputField label="Website" value={website} onChange={setWebsite} icon={Globe} />
                                        <InputField label="Headquarters" value={companyLocation} onChange={setCompanyLocation} icon={MapPin} />
                                    </div>
                                </div>
                            </Card>

                            {/* Team Members */}
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-surface-900">Team Members</h3>
                                            <p className="text-[12px] font-medium text-surface-400">Manage who has access to MOLE</p>
                                        </div>
                                        <button className="px-4 py-2 text-[12px] font-bold text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors border border-brand-100/60 flex items-center gap-1.5">
                                            <Users size={13} /> Invite Member
                                        </button>
                                    </div>

                                    <div className="space-y-2.5">
                                        {[
                                            { name: 'Alex Mercer', email: 'alex@acmesteel.com', role: 'Admin', avatar: 'A', status: 'active' },
                                            { name: 'Sarah Chen', email: 'sarah@acmesteel.com', role: 'Manager', avatar: 'S', status: 'active' },
                                            { name: 'James Wilson', email: 'james@acmesteel.com', role: 'Analyst', avatar: 'J', status: 'active' },
                                            { name: 'Maria Lopez', email: 'maria@acmesteel.com', role: 'Viewer', avatar: 'M', status: 'pending' },
                                        ].map((member, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors group">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 ${i === 0 ? 'bg-gradient-to-br from-brand-500 to-emerald-600' : 'bg-gradient-to-br from-surface-400 to-surface-600'}`}>
                                                    {member.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[13px] font-bold text-surface-900">{member.name}</p>
                                                        {member.status === 'pending' && (
                                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">PENDING</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-surface-400 font-medium">{member.email}</p>
                                                </div>
                                                <span className="text-[11px] font-bold text-surface-500 bg-surface-100 px-2.5 py-1 rounded-lg">{member.role}</span>
                                                <ChevronRight size={14} className="text-surface-300 group-hover:text-surface-500 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* ─── Notifications Tab ─── */}
                    {activeTab === 'notifications' && (
                        <>
                            <Card>
                                <div className="p-6">
                                    <SectionHeader icon={Bell} title="Notification Preferences" subtitle="Control how and when you receive alerts" color="from-amber-500 to-orange-600" />

                                    {/* Channels */}
                                    <div className="mb-6 p-4 bg-surface-50 rounded-xl border border-surface-200/60">
                                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Delivery Channels</p>
                                        <Toggle enabled={emailNotif} onChange={() => setEmailNotif(!emailNotif)} label="Email Notifications" description="Receive alerts via email" />
                                        <Toggle enabled={pushNotif} onChange={() => setPushNotif(!pushNotif)} label="Push Notifications" description="In-app push notifications" />
                                    </div>

                                    {/* Alert Types */}
                                    <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Alert Types</p>
                                    <div className="divide-y divide-surface-100">
                                        <Toggle enabled={matchAlerts} onChange={() => setMatchAlerts(!matchAlerts)} label="AI Match Alerts" description="When a new buyer/seller match is found" />
                                        <Toggle enabled={reportReady} onChange={() => setReportReady(!reportReady)} label="Report Ready" description="When a scheduled report has been generated" />
                                        <Toggle enabled={newOpps} onChange={() => setNewOpps(!newOpps)} label="New Opportunities" description="When new circular economy opportunities arise" />
                                        <Toggle enabled={priceAlerts} onChange={() => setPriceAlerts(!priceAlerts)} label="Price Alerts" description="When material prices change significantly" />
                                        <Toggle enabled={weeklyDigest} onChange={() => setWeeklyDigest(!weeklyDigest)} label="Weekly Digest" description="Summary of your platform activity every Monday" />
                                        <Toggle enabled={systemUpdates} onChange={() => setSystemUpdates(!systemUpdates)} label="System Updates" description="Platform updates and maintenance notices" />
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* ─── Security Tab ─── */}
                    {activeTab === 'security' && (
                        <>
                            <Card>
                                <div className="p-6">
                                    <SectionHeader icon={Shield} title="Security Settings" subtitle="Protect your account and data" color="from-red-500 to-rose-600" />

                                    {/* Password Change */}
                                    <div className="mb-6">
                                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Change Password</p>
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Current password"
                                                    className="w-full bg-white border border-surface-200/80 text-[13px] rounded-xl pl-10 pr-12 py-2.5 text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all"
                                                />
                                                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-500 transition-colors">
                                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="relative">
                                                    <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />
                                                    <input type="password" placeholder="New password" className="w-full bg-white border border-surface-200/80 text-[13px] rounded-xl pl-10 pr-4 py-2.5 text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                                                </div>
                                                <div className="relative">
                                                    <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />
                                                    <input type="password" placeholder="Confirm new password" className="w-full bg-white border border-surface-200/80 text-[13px] rounded-xl pl-10 pr-4 py-2.5 text-surface-900 placeholder-surface-300 font-medium focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                                                </div>
                                            </div>
                                            <button className="px-5 py-2.5 text-[13px] font-bold text-white bg-surface-900 hover:bg-black rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                                                Update Password
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2FA & Session */}
                                    <div className="border-t border-surface-100 pt-5">
                                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Account Security</p>
                                        <div className="divide-y divide-surface-100">
                                            <Toggle enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)} label="Two-Factor Authentication" description="Require a verification code when signing in" />
                                            <div className="flex items-center justify-between py-3">
                                                <div>
                                                    <p className="text-[13px] font-semibold text-surface-900">Session Timeout</p>
                                                    <p className="text-[11px] text-surface-400 font-medium mt-0.5">Auto-logout after inactivity</p>
                                                </div>
                                                <select
                                                    value={sessionTimeout}
                                                    onChange={e => setSessionTimeout(e.target.value)}
                                                    className="text-[12px] font-bold text-surface-900 bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-400"
                                                >
                                                    <option value="15">15 min</option>
                                                    <option value="30">30 min</option>
                                                    <option value="60">1 hour</option>
                                                    <option value="120">2 hours</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Sessions */}
                                    <div className="border-t border-surface-100 pt-5 mt-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Active Sessions</p>
                                            <button className="text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors">Revoke All</button>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { device: 'Chrome on Windows', location: 'San Francisco, CA', time: 'Active now', current: true },
                                                { device: 'Safari on iPhone', location: 'San Francisco, CA', time: '2 hours ago', current: false },
                                            ].map((session, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200/60">
                                                    <div className="flex items-center gap-3">
                                                        <Monitor size={16} className="text-surface-400" />
                                                        <div>
                                                            <p className="text-[12px] font-bold text-surface-900 flex items-center gap-2">
                                                                {session.device}
                                                                {session.current && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">THIS DEVICE</span>}
                                                            </p>
                                                            <p className="text-[11px] text-surface-400 font-medium">{session.location} • {session.time}</p>
                                                        </div>
                                                    </div>
                                                    {!session.current && (
                                                        <button className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors">Revoke</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* ─── Integrations Tab ─── */}
                    {activeTab === 'integrations' && (
                        <>
                            <Card>
                                <div className="p-6">
                                    <SectionHeader icon={Link2} title="Integrations" subtitle="Connect MOLE with your existing tools" color="from-purple-500 to-violet-600" />

                                    <div className="space-y-3">
                                        {[
                                            { name: 'SAP ERP', description: 'Sync waste inventory and material data with SAP', status: 'connected', icon: '🔗' },
                                            { name: 'Salesforce', description: 'Sync partner contacts and deal pipeline', status: 'connected', icon: '☁️' },
                                            { name: 'Microsoft Teams', description: 'Get match alerts and report notifications in Teams', status: 'available', icon: '💬' },
                                            { name: 'Slack', description: 'Receive real-time notifications and AI match alerts', status: 'available', icon: '📢' },
                                            { name: 'Google Sheets', description: 'Export analytics and reports to Google Sheets', status: 'available', icon: '📊' },
                                            { name: 'Custom API', description: 'Connect via REST API for custom integrations', status: 'available', icon: '⚡' },
                                        ].map((integration, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-surface-200/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                                                <span className="text-[24px] w-10 h-10 flex items-center justify-center bg-surface-50 rounded-xl border border-surface-200/60">
                                                    {integration.icon}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[14px] font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{integration.name}</p>
                                                    <p className="text-[12px] text-surface-400 font-medium">{integration.description}</p>
                                                </div>
                                                {integration.status === 'connected' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                                                            <Check size={10} /> Connected
                                                        </span>
                                                        <button className="text-[11px] font-bold text-surface-400 hover:text-red-500 transition-colors">Disconnect</button>
                                                    </div>
                                                ) : (
                                                    <button className="px-4 py-2 text-[12px] font-bold text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 border border-brand-100/60 transition-colors">
                                                        Connect
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* ─── Data & Export Tab ─── */}
                    {activeTab === 'data' && (
                        <>
                            <Card>
                                <div className="p-6">
                                    <SectionHeader icon={Download} title="Data Management" subtitle="Export your data and manage storage" color="from-teal-500 to-cyan-600" />

                                    {/* Export Options */}
                                    <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Export Data</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                        {[
                                            { title: 'All Waste Listings', desc: 'Export all your waste listings data', format: 'CSV', icon: FileText },
                                            { title: 'Match History', desc: 'Complete history of AI matches', format: 'XLSX', icon: Zap },
                                            { title: 'Impact Metrics', desc: 'Environmental impact data export', format: 'PDF', icon: TrendingUp },
                                            { title: 'Financial Summary', desc: 'Cost savings and revenue data', format: 'CSV', icon: BarChart3 },
                                        ].map((exp, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-surface-200/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center border border-surface-200/60 shrink-0">
                                                    <exp.icon size={18} className="text-surface-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{exp.title}</p>
                                                    <p className="text-[11px] text-surface-400 font-medium">{exp.desc}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-[10px] font-bold text-surface-500 bg-surface-100 px-2 py-0.5 rounded">{exp.format}</span>
                                                    <Download size={14} className="text-surface-300 group-hover:text-brand-500 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Storage */}
                                    <div className="border-t border-surface-100 pt-5">
                                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Storage Usage</p>
                                        <div className="p-4 bg-surface-50 rounded-xl border border-surface-200/60">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[13px] font-bold text-surface-900">2.8 GB used of 10 GB</span>
                                                <span className="text-[12px] font-semibold text-surface-400">28%</span>
                                            </div>
                                            <div className="w-full h-2 bg-surface-200/80 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full" style={{ width: '28%' }} />
                                            </div>
                                            <div className="flex gap-4 mt-3 text-[11px] text-surface-400 font-medium">
                                                <span>Reports: 1.4 GB</span>
                                                <span>Listings: 0.8 GB</span>
                                                <span>Analytics: 0.6 GB</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="border-t border-surface-100 pt-5 mt-5">
                                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <AlertTriangle size={12} /> Danger Zone
                                        </p>
                                        <div className="p-4 border-2 border-dashed border-red-200 rounded-xl bg-red-50/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[13px] font-bold text-surface-900">Delete Account</p>
                                                    <p className="text-[12px] text-surface-400 font-medium">Permanently delete your account and all associated data.</p>
                                                </div>
                                                <button className="px-4 py-2 text-[12px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1.5">
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
