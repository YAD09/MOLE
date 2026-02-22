import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BrainCircuit, Activity, BarChart, Server } from 'lucide-react';

const steps = [
    { title: "Analyzing Waste Stream", desc: "Extracting composition & EWC codes...", icon: BrainCircuit },
    { title: "Evaluating Compatibility", desc: "Cross-referencing 40,000+ local off-takers...", icon: Server },
    { title: "Calculating Environmental Impact", desc: "Estimating LCA (Life Cycle Assessment)...", icon: Activity },
    { title: "Optimizing Economic Value", desc: "Ranking matches by highest yield...", icon: BarChart }
];

const AIProcessing = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => {
                if (prev < steps.length - 1) return prev + 1;
                clearInterval(interval);
                setTimeout(() => navigate('/app/matches'), 1500);
                return prev;
            });
        }, 1200);

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center relative overflow-hidden text-surface-900 font-sans">
            {/* Background Grid & Soft Glows */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5ea_1px,transparent_1px),linear-gradient(to_bottom,#e5e5ea_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[100px] -z-10"></div>

            {/* Core Visualization */}
            <div className="relative z-10 w-full max-w-2xl px-8 animate-fade-in">

                <div className="text-center mb-16">
                    <div className="w-24 h-24 mx-auto bg-white rounded-3xl border border-surface-200 shadow-card flex items-center justify-center relative mb-8">
                        <Sparkles className="text-brand-500 animate-pulse" size={36} />
                        {/* Soft Radar / Scanning rings effect */}
                        <div className="absolute inset-0 rounded-3xl border-2 border-brand-500/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        <div className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-60 animate-[scan_2s_ease-in-out_infinite_alternate]" style={{ top: '50%' }}></div>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight mb-3 flex items-center justify-center gap-2 text-surface-900">
                        Circula<span className="text-brand-600">Net Engine</span>
                    </h2>
                    <p className="text-surface-400 font-bold tracking-widest text-[12px] uppercase">Neural Matching Protocol Initiated</p>
                </div>

                <div className="space-y-5">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = idx === activeStep;
                        const isPast = idx < activeStep;

                        return (
                            <div
                                key={idx}
                                className={`flex items-center gap-6 p-5 rounded-2xl transition-all duration-700 transform ${isActive ? 'bg-white border text-surface-900 border-surface-200 shadow-card scale-[1.03] z-10 relative'
                                    : isPast ? 'bg-white/40 border border-surface-200/50 opacity-100 shadow-sm'
                                        : 'opacity-30 translate-y-3 blur-[1px]'
                                    }`}
                            >
                                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${isActive ? 'bg-brand-50 border border-brand-100 text-brand-600 shadow-[0_4px_14px_rgba(16,185,129,0.15)]'
                                    : isPast ? 'bg-brand-50 text-brand-500'
                                        : 'bg-surface-100 border border-surface-200 text-surface-400'
                                    }`}>
                                    <Icon size={24} className={isActive ? 'animate-bounce' : ''} />
                                    {isActive && (
                                        <svg className="absolute -inset-3 w-[80px] h-[80px] animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="60 40" className="text-brand-400 opacity-40" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-[17px] ${isActive ? 'text-surface-900' : isPast ? 'text-surface-600' : 'text-surface-500'}`}>
                                        {step.title}
                                    </h4>
                                    <p className={`text-[14px] font-medium leading-relaxed mt-1 transition-all duration-500 ${isActive ? 'text-surface-500 h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
                                        {step.desc}
                                    </p>
                                </div>

                                {isActive && (
                                    <div className="flex gap-1.5 pr-3">
                                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Smooth Progress Bar overall */}
                <div className="mt-14 w-full h-2.5 bg-surface-200 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-brand-500 transition-all duration-[1200ms] ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default AIProcessing;
