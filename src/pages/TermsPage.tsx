import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, Clock, Globe, Recycle, Orbit } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-[#FCFCFC] text-[#1C1C1E] font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/40">
                <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <Orbit size={18} className="text-white" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-surface-900">MOLE</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-1.5 text-surface-500 hover:text-surface-900 transition-colors text-[14px] font-medium">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <section className="pt-32 pb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-[15%] -mt-[5%] w-[600px] h-[600px] bg-gradient-to-br from-brand-50 to-emerald-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-50 border border-surface-200 text-surface-600 text-[13px] font-semibold mb-6">
                        <FileText size={14} />
                        <span>Legal</span>
                    </div>
                    <h1 className="text-4xl md:text-[52px] font-extrabold tracking-tight text-surface-900 leading-tight mb-4">
                        Terms & Conditions
                    </h1>
                    <p className="text-lg text-surface-500 max-w-2xl">
                        Last updated: February 21, 2026. Please read these terms carefully before using MOLE.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="pb-24">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-3xl border border-surface-200/60 shadow-sm p-8 md:p-12 space-y-10">

                        {/* Section 1 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center border border-brand-100">
                                    <Scale size={18} className="text-brand-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">1. Acceptance of Terms</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                By accessing or using the MOLE platform ("Service"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree with any part of these Terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Globe size={18} className="text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">2. Description of Service</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                MOLE is an AI-powered B2B circular economy marketplace that facilitates the exchange of industrial waste materials and byproducts. The platform uses machine learning algorithms to match waste generators with potential buyers, providing logistics optimization, compliance tracking, and ESG reporting.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                                    <Shield size={18} className="text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">3. User Accounts</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                When you create an account, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for all activities under your account. You agree to notify MOLE immediately of any unauthorized use of your account.
                            </p>
                            <ul className="space-y-2 ml-4">
                                {['You must be at least 18 years old to use this Service', 'One account per organization unless otherwise agreed', 'You are responsible for maintaining the security of your account credentials', 'Account sharing across organizations is prohibited'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-surface-600 text-[15px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                    <Recycle size={18} className="text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">4. Marketplace Transactions</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                MOLE acts as a facilitator for B2B material exchange transactions. All transactions are between the participating organizations. MOLE does not take ownership of any materials listed on the platform. Parties are responsible for ensuring that all material exchanges comply with local, state, and federal regulations regarding waste management and environmental protection.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                                    <AlertTriangle size={18} className="text-purple-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">5. Limitation of Liability</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                MOLE shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you have paid us in the past twelve months. AI-generated matches and recommendations are provided as suggestions only; users must independently verify material compatibility and regulatory compliance.
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                                    <Clock size={18} className="text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">6. Termination</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                We may terminate or suspend your account immediately, without prior notice, for conduct that we determine violates these Terms, is harmful to other users, or is detrimental to MOLE. Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive.
                            </p>
                        </div>

                        {/* Section 7 */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-surface-900">7. Changes to Terms</h2>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. Continued use of the Service following changes constitutes acceptance.
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-surface-900">8. Governing Law</h2>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                These Terms shall be governed by the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="bg-surface-50 rounded-2xl p-6 border border-surface-200">
                            <h3 className="text-[16px] font-bold text-surface-900 mb-2">Questions?</h3>
                            <p className="text-surface-500 text-[14px]">
                                If you have any questions about these Terms, please contact us at{' '}
                                <a href="mailto:legal@MOLE.com" className="text-brand-600 font-medium hover:underline">legal@MOLE.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
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
                        <Link to="/terms" className="text-surface-900 font-semibold">Terms</Link>
                        <a href="mailto:contact@MOLE.com" className="hover:text-surface-900 transition-colors">Contact</a>
                    </div>
                    <p className="text-sm text-surface-500">© 2026 MOLE. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default TermsPage;
