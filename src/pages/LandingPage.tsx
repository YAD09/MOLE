import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Leaf,
    Cpu,
    Globe,
    ListPlus,
    Factory,
    RefreshCcw,
    Zap,
    CheckCircle2,
    TrendingUp,
    ChevronRight,
    BarChart3,
    Sparkles,
    ArrowUpRight,
    Orbit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Animated Counter Hook ─── */
const useCounter = (end: number, duration = 2000) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    let start = 0;
                    const step = end / (duration / 16);
                    const timer = setInterval(() => {
                        start += step;
                        if (start >= end) {
                            setCount(end);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 16);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return { count, ref };
};

const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    const waste = useCounter(2400000, 2200);
    const co2 = useCounter(18500, 2400);
    const savings = useCounter(42, 2000);
    const exchanges = useCounter(1200, 1800);

    const formatNum = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    };

    return (
        <div className="min-h-screen bg-[#FCFCFC] text-[#1C1C1E] font-sans selection:bg-brand-100 selection:text-brand-900 scroll-smooth">

            {/* ─── Navigation ─── */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/40">
                <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <Orbit size={18} className="text-white" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-surface-900">MOLE</span>
                    </div>

                    <div className="hidden md:flex items-center gap-10 font-medium text-[15px] text-surface-800/80">
                        <a href="#problem" className="hover:text-brand-600 transition-colors">Platform</a>
                        <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How it Works</a>
                        <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
                        <a href="#metrics" className="hover:text-brand-600 transition-colors">Impact</a>
                    </div>

                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link to="/app" className="bg-surface-900 text-white px-5 py-2.5 rounded-full text-[14px] font-semibold hover:bg-surface-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                                Dashboard <ArrowRight size={15} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="hidden md:block text-[14px] font-semibold text-surface-800 hover:text-brand-600 transition-colors px-4 py-2">
                                    Sign in
                                </Link>
                                <Link to="/login" className="bg-surface-900 text-white px-5 py-2.5 rounded-full text-[14px] font-semibold hover:bg-surface-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                                    Get Started <ArrowRight size={15} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ─── */}
            <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
                {/* Background Orbs */}
                <div className="absolute top-0 right-0 -mr-[15%] -mt-[5%] w-[800px] h-[800px] bg-gradient-to-br from-brand-50 to-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute -left-[10%] top-[30%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-30 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100/60 text-brand-700 text-[13px] font-semibold mb-8">
                            <Sparkles size={14} className="text-brand-500" />
                            <span>AI-Powered Circular Economy Platform</span>
                        </div>

                        <h1 className="text-5xl lg:text-[72px] font-extrabold tracking-[-0.03em] text-surface-900 leading-[1.05] mb-6">
                            Transform Industrial{' '}
                            <br className="hidden lg:block" />
                            Waste into{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 animate-gradient">
                                Economic Value
                            </span>
                        </h1>

                        <p className="text-lg lg:text-[19px] text-surface-800/70 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            The intelligent B2B marketplace that uses AI to match industrial byproducts with raw material needs — unlocking hidden revenue, eliminating disposal costs, and accelerating your path to net-zero.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-surface-900 text-white rounded-full font-semibold text-[16px] hover:bg-surface-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2.5">
                                Get Started <ArrowRight size={18} />
                            </Link>
                            <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white border border-surface-200 text-surface-900 rounded-full font-semibold text-[16px] hover:bg-surface-50 hover:border-surface-300 transition-all flex items-center justify-center gap-2">
                                Explore Platform
                            </a>
                        </div>

                        {/* Trust bar */}
                        <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start text-surface-500 text-[13px] font-medium">
                            <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-brand-500" /> SOC 2 Compliant</div>
                            <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-brand-500" /> 99.9% Uptime</div>
                            <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-brand-500" /> Enterprise Ready</div>
                        </div>
                    </div>

                    {/* Hero Visual — Abstract Industrial Network */}
                    <div className="flex-1 w-full max-w-xl lg:max-w-none relative">
                        <div className="relative aspect-square md:aspect-[4/3] rounded-3xl bg-white border border-surface-200/60 shadow-2xl shadow-black/[0.04] overflow-hidden flex flex-col justify-center items-center p-8">
                            {/* Grid BG */}
                            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                                        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#hero-grid)" />
                            </svg>

                            {/* Nodes & Flow */}
                            <div className="relative w-full max-w-md h-[300px] flex items-center justify-center">
                                {/* Left Node */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-4 rounded-2xl shadow-lg shadow-orange-500/5 border border-surface-100 flex flex-col items-center gap-2 z-10 animate-float" style={{ animationDelay: '0s' }}>
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <Factory className="text-orange-500" size={22} />
                                    </div>
                                    <span className="text-xs font-bold text-surface-800">Steel Slag</span>
                                    <span className="text-[10px] text-surface-500 font-medium">Auto Mfg.</span>
                                </div>

                                {/* AI Core */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                    <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-brand-50 to-emerald-50 border-[3px] border-brand-200 flex items-center justify-center shadow-glow">
                                        <Cpu className="text-brand-600 w-9 h-9" />
                                    </div>
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-500 text-white text-[10px] font-bold whitespace-nowrap shadow-md">
                                        AI Engine
                                    </div>
                                </div>

                                {/* Flow lines */}
                                <div className="absolute left-[18%] right-[18%] top-1/2 h-[2px] bg-gradient-to-r from-orange-200 via-brand-300 to-blue-200 -translate-y-1/2 opacity-40" />
                                {/* Animated dot */}
                                <div className="absolute left-[30%] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse-dot shadow-[0_0_12px_rgba(16,185,129,0.6)]" />

                                {/* Right Node */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-4 rounded-2xl shadow-lg shadow-blue-500/5 border border-surface-100 flex flex-col items-center gap-2 z-10 animate-float" style={{ animationDelay: '1.5s' }}>
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Factory className="text-blue-500" size={22} />
                                    </div>
                                    <span className="text-xs font-bold text-surface-800">Aggregate</span>
                                    <span className="text-[10px] text-surface-500 font-medium">Construction</span>
                                </div>

                                {/* Bottom Match Indicator */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white px-5 py-2.5 border border-brand-200 rounded-full shadow-lg shadow-brand-500/10 flex items-center gap-2 text-sm font-bold text-brand-800 z-30">
                                    <CheckCircle2 size={16} className="text-brand-500" />
                                    98% Synergy Match
                                </div>

                                {/* Top-left small node */}
                                <div className="absolute left-[15%] top-4 bg-white p-2.5 rounded-xl shadow-md border border-surface-100 flex items-center gap-2 z-10 animate-float" style={{ animationDelay: '0.8s' }}>
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <Leaf className="text-purple-500" size={16} />
                                    </div>
                                    <span className="text-[11px] font-semibold text-surface-800">Biomass</span>
                                </div>

                                {/* Top-right small node */}
                                <div className="absolute right-[15%] top-4 bg-white p-2.5 rounded-xl shadow-md border border-surface-100 flex items-center gap-2 z-10 animate-float" style={{ animationDelay: '2.2s' }}>
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <Zap className="text-amber-500" size={16} />
                                    </div>
                                    <span className="text-[11px] font-semibold text-surface-800">Energy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Problem vs Solution ─── */}
            <section id="problem" className="py-24 bg-white border-y border-surface-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-surface-50 text-surface-600 text-[13px] font-semibold mb-4 border border-surface-200">
                            Why MOLE
                        </div>
                        <h2 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-surface-900 mb-4 leading-tight">The Linear Economy is Broken</h2>
                        <p className="text-lg text-surface-800/60 max-w-2xl mx-auto">Billions of dollars are lost annually in disposal costs while perfectly recyclable secondary materials go to waste.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                        {/* Problem */}
                        <div className="bg-surface-50 rounded-3xl p-8 lg:p-10 border border-surface-200/60 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6 border border-red-100">
                                    <TrendingUp className="text-red-500 rotate-180" size={22} />
                                </div>
                                <h3 className="text-2xl font-bold text-surface-900 mb-5">The Old Way</h3>
                                <ul className="space-y-4">
                                    {['High waste disposal fees & growing landfill costs', 'Fragmented manual broker networks', 'Zero visibility into byproduct market demand', 'Increasing regulatory compliance burden'].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-red-100/60 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-red-500 font-bold text-xs">✕</span>
                                            </div>
                                            <span className="text-surface-800/80 text-[15px]">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Solution */}
                        <div className="bg-gradient-to-br from-brand-50 to-emerald-50 rounded-3xl p-8 lg:p-10 border border-brand-100/60 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Leaf size={200} className="text-brand-600" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-6 border border-brand-200">
                                    <Zap className="text-brand-600" size={22} />
                                </div>
                                <h3 className="text-2xl font-bold text-surface-900 mb-5">The MOLE Way</h3>
                                <ul className="space-y-4">
                                    {['Turn disposal costs into new revenue streams', 'AI-powered algorithmic partner matching', 'Real-time industrial symbiosis network', 'Automated ESG & compliance tracking'].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-brand-500/20">
                                                <CheckCircle2 size={14} className="text-white" />
                                            </div>
                                            <span className="text-surface-900 font-medium text-[15px]">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section id="how-it-works" className="py-24 bg-[#FCFCFC]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-surface-100 text-surface-600 text-[13px] font-semibold mb-4 border border-surface-200">
                            Workflow
                        </div>
                        <h2 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-surface-900 leading-tight">Seamless Circular Integration</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-[52px] left-[14%] right-[14%] border-t-2 border-dashed border-surface-200 z-0" />

                        {[
                            { icon: <ListPlus className="text-surface-900" size={24} />, title: 'List Waste / Needs', desc: 'Input your byproducts or raw material requirements into the secure platform.' },
                            { icon: <Cpu className="text-brand-600" size={24} />, title: 'AI Matching', desc: 'Our engine analyzes chemistry, location, volume, and timing for optimal synergies.' },
                            { icon: <RefreshCcw className="text-blue-600" size={24} />, title: 'Optimize Exchange', desc: 'Logistics, regulatory compliance, and contracts are auto-proposed.' },
                            { icon: <TrendingUp className="text-emerald-600" size={24} />, title: 'Unlock Value + Impact', desc: 'Generate revenue, save disposal costs, and track environmental impact in real-time.' }
                        ].map((step, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                                <div className="w-[104px] h-[104px] rounded-2xl bg-white border border-surface-200/80 shadow-sm group-hover:shadow-md group-hover:border-brand-200 flex items-center justify-center mb-6 transition-all duration-300 group-hover:-translate-y-1">
                                    <div className="w-14 h-14 rounded-xl bg-surface-50 group-hover:bg-brand-50 flex items-center justify-center transition-colors">
                                        {step.icon}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-surface-900 text-white text-sm font-bold flex items-center justify-center mb-4 shadow-md">
                                    {idx + 1}
                                </div>
                                <h4 className="text-[17px] font-bold text-surface-900 mb-2">{step.title}</h4>
                                <p className="text-surface-800/60 text-[14px] leading-relaxed max-w-[200px]">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Platform Value / Features ─── */}
            <section id="features" className="py-24 bg-white border-t border-surface-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-[13px] font-semibold mb-6 border border-brand-100">
                                Core Capabilities
                            </div>
                            <h2 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-surface-900 mb-6 leading-tight">
                                Enterprise-Grade Industrial Symbiosis
                            </h2>
                            <p className="text-lg text-surface-800/60 mb-10">
                                Deep industrial expertise combined with state-of-the-art machine learning to make cross-industry resource exchange secure, profitable, and scalable.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: <Cpu className="text-brand-600" size={20} />, title: 'AI Matching Engine', desc: 'Proprietary ML models match complex chemical compositions to alternative raw material applications with 98%+ accuracy.' },
                                    { icon: <BarChart3 className="text-blue-600" size={20} />, title: 'Economic Optimization', desc: 'Algorithmic pricing, logistics optimization, and contract automation maximize value from every exchange.' },
                                    { icon: <Globe className="text-emerald-600" size={20} />, title: 'Environmental Impact Tracking', desc: 'Auto-generate audit-ready CO₂ reduction reports, circularity metrics, and ESG compliance documentation.' }
                                ].map((f, i) => (
                                    <div key={i} className="flex gap-4 group p-4 -ml-4 rounded-2xl hover:bg-surface-50 transition-all cursor-pointer">
                                        <div className="mt-0.5 w-11 h-11 rounded-xl bg-surface-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-surface-200 shadow-sm transition-colors">
                                            {f.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-[16px] font-bold text-surface-900 mb-1 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                                                {f.title}
                                                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-500" />
                                            </h4>
                                            <p className="text-surface-800/60 text-[14px] leading-relaxed">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual Card */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-transparent rounded-[40px] translate-x-4 -translate-y-4 -z-10 blur-xl" />
                            <div className="bg-white border border-surface-200/80 rounded-[28px] p-8 shadow-2xl shadow-black/[0.04]">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-6 border-b border-surface-100 pb-4">
                                        <div className="font-bold text-surface-800 flex items-center gap-2 text-[15px]">
                                            <Zap size={16} className="text-brand-500" />
                                            Active Exchanges
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[12px] text-brand-600 font-semibold bg-brand-50 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-dot" />
                                            Live
                                        </div>
                                    </div>

                                    {[
                                        { materials: 'Silica Dust → Glass Mfg', val: '+$14k', co2: '-42t', match: '97%' },
                                        { materials: 'Organic Offcuts → Biofuel', val: '+$8k', co2: '-18t', match: '94%' },
                                        { materials: 'Alloy Scrap → Drone Parts', val: '+$22k', co2: '-65t', match: '99%' },
                                    ].map((row, i) => (
                                        <div key={i} className="bg-surface-50 p-4 rounded-2xl border border-surface-100 flex items-center justify-between hover:bg-white hover:shadow-md hover:border-surface-200 transition-all group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border border-brand-100">{row.match}</div>
                                                <span className="font-semibold text-[14px] text-surface-900 group-hover:text-brand-600 transition-colors">{row.materials}</span>
                                            </div>
                                            <div className="flex gap-3 items-center">
                                                <span className="text-[13px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">{row.val}</span>
                                                <span className="text-[12px] font-medium text-surface-400 flex items-center gap-1">
                                                    <Leaf size={12} className="text-emerald-500" /> {row.co2} CO₂e
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Impact Metrics ─── */}
            <section id="metrics" className="py-28 bg-surface-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid-dark" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-dark)" />
                    </svg>
                </div>
                {/* Glow orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500 rounded-full blur-[200px] opacity-[0.08] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-[13px] font-semibold mb-4 border border-white/10">
                            Platform Impact
                        </div>
                        <h2 className="text-3xl md:text-[42px] font-extrabold tracking-tight mb-4 leading-tight">Driving Measurable Outcomes</h2>
                        <p className="text-lg text-surface-300/80">Real results from real industrial symbiosis partnerships.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/10">
                        {[
                            { ref: waste.ref, value: formatNum(waste.count), suffix: '+', label: 'Tons Waste Diverted', color: 'from-white to-surface-300' },
                            { ref: co2.ref, value: formatNum(co2.count), suffix: ' MT', label: 'CO₂e Saved', color: 'from-white to-surface-300' },
                            { ref: savings.ref, value: '$' + savings.count, suffix: 'M+', label: 'Cost Savings Generated', color: 'from-emerald-400 to-brand-500' },
                            { ref: exchanges.ref, value: exchanges.count.toLocaleString(), suffix: '+', label: 'Active Exchanges', color: 'from-white to-surface-300' }
                        ].map((m, i) => (
                            <div key={i} ref={m.ref} className="flex flex-col items-center text-center lg:px-8">
                                <span className={`text-4xl md:text-[52px] font-extrabold text-transparent bg-clip-text bg-gradient-to-b ${m.color} mb-2 tracking-tight leading-none`}>
                                    {m.value}{m.suffix}
                                </span>
                                <span className="text-sm font-medium text-brand-400/90">{m.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ─── */}
            <section className="py-28 bg-[#FCFCFC] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-50 rounded-full blur-3xl opacity-30 pointer-events-none" />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-[13px] font-semibold mb-8 border border-brand-100">
                        <Sparkles size={14} /> Start Today
                    </div>
                    <h2 className="text-4xl md:text-[52px] font-extrabold tracking-tight text-surface-900 mb-6 leading-tight">
                        Ready to join the{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-500">Circular Economy</span>?
                    </h2>
                    <p className="text-lg text-surface-800/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Connect with hundreds of industrial facilities turning waste into wealth. Sign up or schedule a demo today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-brand-600 text-white rounded-full font-bold text-[16px] hover:bg-brand-500 transition-all shadow-xl shadow-brand-500/25 hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                            Start Optimizing Today <ArrowRight size={18} />
                        </Link>
                        <button className="w-full sm:w-auto px-10 py-4 bg-white border border-surface-200 text-surface-900 rounded-full font-bold text-[16px] hover:bg-surface-50 transition-all flex items-center justify-center gap-2">
                            Talk to Sales <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="bg-white border-t border-surface-200/60 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-surface-900 flex items-center justify-center">
                            <Orbit size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-surface-900 tracking-tight">MOLE</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-surface-400">
                        <Link to="/privacy" className="hover:text-surface-900 transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-surface-900 transition-colors">Terms</Link>
                        <a href="mailto:contact@MOLE.com" className="hover:text-surface-900 transition-colors">Contact</a>
                        <a href="#features" className="hover:text-surface-900 transition-colors">Documentation</a>
                    </div>
                    <p className="text-sm text-surface-500">© 2026 MOLE. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
