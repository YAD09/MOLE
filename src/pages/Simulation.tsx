import { useState } from 'react';
import { BadgeCheck, ArrowRight, Truck, AlertTriangle, Leaf, DollarSign, CheckCircle2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Simulation = () => {
    const navigate = useNavigate();
    const [isConfirmed, setIsConfirmed] = useState(false);

    return (
        <div className="p-6 lg:p-12 max-w-6xl mx-auto h-[calc(100vh-72px)] flex flex-col items-center justify-center animate-fade-in bg-surface-50 relative overflow-hidden">

            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            {!isConfirmed ? (
                <div className="w-full">
                    <div className="text-center mb-16">
                        <div className="inline-block p-4 bg-white shadow-card rounded-3xl border border-surface-200 mb-6">
                            <BadgeCheck size={48} className="text-brand-500 mx-auto" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-[40px] font-black tracking-tight text-surface-900 mb-4">Deal Simulation: Wood Scrap to Biomass</h1>
                        <p className="text-surface-500 text-[18px] font-bold flex items-center justify-center gap-4 uppercase tracking-widest">
                            Acme Steel Co. <ArrowRight size={20} className="text-surface-300" /> GreenEnergy Co.
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
                        {/* Traditional Disposal */}
                        <div className="bg-white border border-surface-200 rounded-[32px] p-10 relative overflow-hidden group transition-all hover:shadow-card hover:border-red-200/60">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <AlertTriangle size={180} />
                            </div>

                            <h3 className="text-[22px] font-black text-surface-400 mb-8 flex flex-col items-start gap-4">
                                <span className="text-[12px] bg-surface-100 text-surface-600 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest border border-surface-200">Standard Practice</span>
                                Status Quo (Landfill Disposal)
                            </h3>

                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-end border-b border-surface-100 pb-5">
                                    <div>
                                        <p className="text-[14px] text-surface-500 font-bold uppercase tracking-wider mb-2">Landfill Tipping Fees</p>
                                        <p className="text-[32px] font-black text-surface-900 font-sans tracking-tighter">-$2,500</p>
                                    </div>
                                    <div className="p-3 bg-red-50 text-red-500 rounded-xl mb-2"><DollarSign size={24} /></div>
                                </div>
                                <div className="flex justify-between items-end border-b border-surface-100 pb-5">
                                    <div>
                                        <p className="text-[14px] text-surface-500 font-bold uppercase tracking-wider mb-2">Transport Cost</p>
                                        <p className="text-[32px] font-black text-surface-900 font-sans tracking-tighter">-$700</p>
                                    </div>
                                    <div className="p-3 bg-red-50 text-red-500 rounded-xl mb-2"><Truck size={24} /></div>
                                </div>
                                <div className="flex justify-between items-end pt-3">
                                    <div>
                                        <p className="text-[14px] text-red-500 font-bold uppercase tracking-wider mb-2">Environmental Cost</p>
                                        <p className="text-[40px] font-black text-red-600 font-sans tracking-tighter flex items-center gap-3">
                                            +45 MT
                                        </p>
                                    </div>
                                    <span className="text-[12px] text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest leading-none">Net CO₂ Added</span>
                                </div>
                            </div>
                        </div>

                        {/* Circular Exchange */}
                        <div className="bg-white border-2 border-brand-500 rounded-[32px] p-10 relative overflow-hidden shadow-[0_20px_60px_rgba(16,185,129,0.15)] transform scale-[1.03] z-10 duration-500 transition-all hover:shadow-[0_30px_80px_rgba(16,185,129,0.2)]">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <Leaf size={180} className="text-brand-900" />
                            </div>

                            <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300 animate-[shimmer_3s_infinite] bg-[length:200%_100%]"></div>

                            <h3 className="text-[22px] font-black text-brand-600 mb-8 flex flex-col items-start gap-4">
                                <span className="text-[12px] bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest border border-brand-200">Optimized Pathway</span>
                                MOLE Exchange
                            </h3>

                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-end border-b border-brand-100 pb-5">
                                    <div>
                                        <p className="text-[14px] text-surface-500 font-bold uppercase tracking-wider mb-2">Material Sale Value</p>
                                        <p className="text-[32px] font-black text-surface-900 font-sans tracking-tighter">+$500</p>
                                    </div>
                                    <span className="text-[12px] text-brand-700 bg-brand-50 font-bold px-3 py-1.5 rounded-lg border border-brand-100">+120% margins</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-brand-100 pb-5">
                                    <div>
                                        <p className="text-[14px] text-surface-500 font-bold uppercase tracking-wider mb-2">Smart Logistics (Shared)</p>
                                        <p className="text-[32px] font-black text-surface-900 font-sans tracking-tighter">-$800</p>
                                    </div>
                                    <div className="p-3 bg-brand-50 text-brand-600 rounded-xl mb-2"><Truck size={24} /></div>
                                </div>
                                <div className="flex justify-between items-end pt-3">
                                    <div>
                                        <p className="text-[14px] text-brand-600 font-bold uppercase tracking-wider mb-2">Impact Assessment</p>
                                        <p className="text-[40px] font-black text-brand-600 font-sans tracking-tighter flex items-center gap-3">
                                            -85 MT <Leaf size={28} className="drop-shadow-[0_4px_10px_rgba(16,185,129,0.3)]" />
                                        </p>
                                    </div>
                                    <span className="text-[12px] text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest leading-none">Net CO₂ Avoided</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center max-w-2xl mx-auto">
                        <button
                            onClick={() => navigate('/matches')}
                            className="w-full sm:w-auto px-8 py-4 text-[16px] text-surface-500 font-bold hover:text-surface-900 bg-white border border-surface-200 hover:bg-surface-50 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3"
                        >
                            <ArrowRight size={20} className="rotate-180 text-surface-400" /> Review Matches
                        </button>
                        <button
                            onClick={() => setIsConfirmed(true)}
                            className="w-full sm:w-auto bg-surface-900 text-white font-black px-12 py-4 rounded-2xl text-[18px] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.25)] group transform hover:-translate-y-0.5"
                        >
                            Initiate Smart Contract <FileText size={22} className="group-hover:text-brand-400 transition-colors" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-[600px] text-center animate-fade-in bg-white p-12 lg:p-16 rounded-[40px] shadow-card border border-surface-200/50">
                    <div className="w-28 h-28 bg-brand-50 border border-brand-100 rounded-full flex items-center justify-center mx-auto mb-10 relative shadow-[0_10px_40px_rgba(16,185,129,0.15)]">
                        <CheckCircle2 size={56} className="text-brand-500" />
                        <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    </div>

                    <h2 className="text-[40px] font-black text-surface-900 mb-4 tracking-tight leading-none">Contract Executed</h2>
                    <p className="text-surface-500 text-[18px] mb-10 font-medium leading-relaxed">
                        Digital manifest securely generated. Logistics provider has been automatically scheduled via API.
                    </p>

                    <div className="bg-surface-50 border border-surface-200 p-8 rounded-[24px] mb-12 text-left shadow-sm">
                        <div className="flex justify-between items-center text-[15px] mb-5">
                            <span className="font-bold text-surface-500 uppercase tracking-wider">Contract ID</span>
                            <span className="font-bold text-surface-900 font-mono bg-white px-3 py-1.5 rounded-lg border border-surface-200 shadow-sm">C-9002FEA4</span>
                        </div>
                        <div className="flex justify-between items-center text-[15px] mb-6">
                            <span className="font-bold text-surface-500 uppercase tracking-wider">Pickup Window</span>
                            <span className="font-bold text-surface-900">Oct 24, 08:00 AM</span>
                        </div>
                        <div className="flex justify-between items-center text-[18px] font-black pt-6 border-t border-surface-200">
                            <span className="text-surface-900">Final Net Value</span>
                            <span className="text-brand-600 bg-brand-50 px-4 py-2 rounded-xl border border-brand-100 shadow-[0_4px_15px_rgba(16,185,129,0.1)]">
                                +$2,900 Generated
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="text-surface-600 font-bold bg-white border border-surface-200 hover:bg-surface-50 hover:text-surface-900 px-10 py-4 rounded-2xl transition-all shadow-sm w-full flex justify-center items-center gap-3"
                    >
                        Return to Dashboard
                    </button>
                </div>
            )}

        </div>
    );
};

export default Simulation;
