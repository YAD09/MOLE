import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Eye, Database, Lock, Users, Globe, Bell, Trash2, Orbit } from 'lucide-react';

const PrivacyPage = () => {
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
                <div className="absolute top-0 left-0 -ml-[10%] -mt-[5%] w-[600px] h-[600px] bg-gradient-to-br from-emerald-50 to-brand-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-50 border border-surface-200 text-surface-600 text-[13px] font-semibold mb-6">
                        <ShieldCheck size={14} />
                        <span>Privacy</span>
                    </div>
                    <h1 className="text-4xl md:text-[52px] font-extrabold tracking-tight text-surface-900 leading-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-surface-500 max-w-2xl">
                        Last updated: February 21, 2026. Your privacy is critically important to us at MOLE.
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
                                    <Eye size={18} className="text-brand-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">1. Information We Collect</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                We collect information you provide directly when you create an account, list materials, or interact with the platform. This includes:
                            </p>
                            <ul className="space-y-2 ml-4">
                                {[
                                    'Account information: company name, email address, industry type, and location',
                                    'Material data: waste types, quantities, chemical compositions, and handling requirements',
                                    'Transaction data: exchange history, pricing, logistics information',
                                    'Usage data: how you interact with the platform, features used, and preferences',
                                    'Device information: browser type, IP address, and operating system'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-surface-600 text-[15px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Database size={18} className="text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">2. How We Use Your Information</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                We use the information we collect to provide, maintain, and improve the MOLE platform:
                            </p>
                            <ul className="space-y-2 ml-4">
                                {[
                                    'Power our AI matching engine to find optimal material exchange opportunities',
                                    'Facilitate B2B transactions and logistics coordination',
                                    'Generate ESG and compliance reports for your organization',
                                    'Send notifications about new matches, opportunities, and platform updates',
                                    'Improve our algorithms and platform features',
                                    'Ensure platform security and prevent fraud'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-surface-600 text-[15px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                    <Lock size={18} className="text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">3. Data Security</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                We implement enterprise-grade security measures to protect your data. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We maintain SOC 2 Type II compliance and undergo regular third-party security audits. Access to personal data is strictly limited to authorized personnel who need it to perform their job functions.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                                    <Users size={18} className="text-purple-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">4. Data Sharing</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                We do not sell your personal information. We may share limited data with:
                            </p>
                            <ul className="space-y-2 ml-4">
                                {[
                                    'Transaction counterparties: Only the minimum information needed to complete a material exchange',
                                    'Service providers: Trusted third parties that help us operate our platform (hosting, analytics, logistics)',
                                    'Legal obligations: When required by law, regulation, or valid legal process',
                                    'Business transfers: In connection with a merger, acquisition, or sale of assets'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-surface-600 text-[15px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 5 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                                    <Globe size={18} className="text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">5. Cookies & Tracking</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                We use essential cookies to maintain your session and preferences. Analytics cookies help us understand how you use the platform so we can improve it. You can control cookie preferences through your browser settings. We do not use third-party advertising cookies.
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
                                    <Bell size={18} className="text-teal-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">6. Your Rights</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                You have the right to:
                            </p>
                            <ul className="space-y-2 ml-4">
                                {[
                                    'Access the personal data we hold about you',
                                    'Request correction of inaccurate data',
                                    'Request deletion of your personal data',
                                    'Object to processing of your data',
                                    'Request data portability in a machine-readable format',
                                    'Withdraw consent at any time where processing is based on consent'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-surface-600 text-[15px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 7 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                                    <Trash2 size={18} className="text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-surface-900">7. Data Retention</h2>
                            </div>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                We retain your personal data only as long as necessary to fulfill the purposes for which it was collected, including satisfying legal, accounting, or reporting requirements. Transaction data may be retained for up to 7 years for compliance purposes. You may request deletion of your account and associated data at any time.
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-surface-900">8. Changes to This Policy</h2>
                            <p className="text-surface-600 leading-relaxed text-[15px]">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Significant changes will be communicated via email or platform notification. We encourage you to review this policy periodically.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="bg-surface-50 rounded-2xl p-6 border border-surface-200">
                            <h3 className="text-[16px] font-bold text-surface-900 mb-2">Privacy Questions?</h3>
                            <p className="text-surface-500 text-[14px]">
                                For any privacy-related questions or to exercise your data rights, contact our Data Protection Officer at{' '}
                                <a href="mailto:privacy@MOLE.com" className="text-brand-600 font-medium hover:underline">privacy@MOLE.com</a>
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
                        <Link to="/privacy" className="text-surface-900 font-semibold">Privacy</Link>
                        <Link to="/terms" className="hover:text-surface-900 transition-colors">Terms</Link>
                        <a href="mailto:contact@MOLE.com" className="hover:text-surface-900 transition-colors">Contact</a>
                    </div>
                    <p className="text-sm text-surface-500">© 2026 MOLE. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPage;
