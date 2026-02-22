import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, ArrowRight, Cpu, Lock, Mail, Leaf, CheckCircle2,
    Globe, Building2, MapPin, ChevronDown, Eye, EyeOff, Recycle,
    Zap, Sparkles, Trash2, PackageCheck, Settings2,
    AlertCircle, ShieldCheck, RefreshCcw, Orbit
} from 'lucide-react';

/* ─────────────────────── Types ─────────────────────── */
type AuthScreen = 'signin' | 'signup' | 'forgot' | 'onboarding';

/* ─────────────────────── Industry Options ─────────────────────── */
const INDUSTRIES = [
    'Manufacturing', 'Steel & Metals', 'Chemicals & Petrochemicals',
    'Construction & Demolition', 'Food & Beverage', 'Paper & Pulp',
    'Textiles', 'Electronics & E-Waste', 'Automotive', 'Energy & Utilities',
    'Pharmaceuticals', 'Mining & Minerals', 'Plastics & Polymers', 'Other'
];

const WASTE_TYPES = [
    'Metal Scrap', 'Plastic Waste', 'Chemical Byproducts', 'Organic Waste',
    'E-Waste', 'Fly Ash', 'Slag', 'Construction Debris', 'Paper & Cardboard',
    'Glass', 'Textile Waste', 'Rubber', 'Wood Waste', 'Hazardous Waste'
];

const MATERIAL_NEEDS = [
    'Recycled Metals', 'Recycled Plastics', 'Alternative Fuels',
    'Recovered Chemicals', 'Biomass', 'Recycled Aggregates',
    'Reclaimed Wood', 'Secondary Raw Materials', 'Recovered Glass',
    'Compost & Mulch'
];

const CAPABILITIES = [
    'Collection & Logistics', 'Sorting & Segregation', 'Processing & Treatment',
    'Recycling', 'Energy Recovery', 'Composting', 'Landfill Management',
    'Hazardous Waste Handling', 'Testing & Analysis'
];

/* ─────────────────────── Animated Stats ─────────────────────── */
const AnimatedStat = ({ value, label, delay }: { value: string; label: string; delay: number }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);
    return (
        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
            <div className="text-xs text-white/50 mt-0.5">{label}</div>
        </div>
    );
};

/* ─────────────────────── Network Animation ─────────────────────── */
const CircularNetworkSVG = () => (
    <svg viewBox="0 0 400 400" className="w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="auth-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
        {/* Circular loop */}
        <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="6 4">
            <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="60s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" strokeDasharray="4 6">
            <animateTransform attributeName="transform" type="rotate" from="360 200 200" to="0 200 200" dur="45s" repeatCount="indefinite" />
        </circle>
        {/* Nodes */}
        {[
            [200, 80], [320, 200], [200, 320], [80, 200],
            [270, 110], [290, 290], [130, 290], [110, 110]
        ].map(([cx, cy], i) => (
            <g key={i}>
                <circle cx={cx} cy={cy} r="4" fill="rgba(16,185,129,0.4)">
                    <animate attributeName="r" values="3;5;3" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
                </circle>
            </g>
        ))}
        {/* Connections */}
        <line x1="200" y1="80" x2="320" y2="200" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
        <line x1="320" y1="200" x2="200" y2="320" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
        <line x1="200" y1="320" x2="80" y2="200" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
        <line x1="80" y1="200" x2="200" y2="80" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
        <line x1="270" y1="110" x2="130" y2="290" stroke="rgba(16,185,129,0.1)" strokeWidth="0.5" />
        <line x1="290" y1="290" x2="110" y2="110" stroke="rgba(16,185,129,0.1)" strokeWidth="0.5" />
    </svg>
);

/* ─────────────────────── Chip Selector Component ─────────────────────── */
const ChipSelector = ({
    options, selected, onToggle
}: {
    options: string[]; selected: string[]; onToggle: (val: string) => void;
}) => (
    <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
            const isActive = selected.includes(opt);
            return (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onToggle(opt)}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium
                        border transition-all duration-200 cursor-pointer select-none
                        ${isActive
                            ? 'bg-brand-50 border-brand-500/30 text-brand-600 shadow-sm'
                            : 'bg-white border-surface-200 text-surface-500 hover:border-surface-300 hover:text-surface-700'
                        }
                    `}
                >
                    {isActive && <CheckCircle2 size={13} className="text-brand-500" />}
                    {opt}
                </button>
            );
        })}
    </div>
);

/* ─────────────────────── Main AuthPage Component ─────────────────────── */
const AuthPage = () => {
    /* Detect initial screen from URL */
    const getInitialScreen = (): AuthScreen => {
        const path = window.location.pathname;
        if (path === '/signup') return 'signup';
        if (path === '/forgot-password') return 'forgot';
        return 'signin';
    };

    const [screen, setScreen] = useState<AuthScreen>(getInitialScreen);
    const [showPassword, setShowPassword] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    /* Sign In */
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    /* Sign Up */
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [locationVal, setLocationVal] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    /* Forgot Password */
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);

    /* Onboarding */
    const [wasteTypes, setWasteTypes] = useState<string[]>([]);
    const [materialNeeds, setMaterialNeeds] = useState<string[]>([]);
    const [capabilities, setCapabilities] = useState<string[]>([]);

    /* Captcha State */
    const [captcha, setCaptcha] = useState({ question: '', answer: '' });
    const [userCaptcha, setUserCaptcha] = useState('');
    const [authError, setAuthError] = useState('');
    const [, setIsSubmitting] = useState(false);

    const { login, signup, resetPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({
            question: `${num1} + ${num2}`,
            answer: (num1 + num2).toString()
        });
        setUserCaptcha('');
    };

    useEffect(() => {
        generateCaptcha();
    }, [screen]);

    const from = (location.state as any)?.from?.pathname || '/app';

    /* Close dropdown on outside click */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Screen transition helper */
    const switchScreen = (target: AuthScreen) => {
        setIsAnimating(true);
        setTimeout(() => {
            setScreen(target);
            setIsAnimating(false);
        }, 200);
    };

    const toggleChip = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
    };

    /* ─── Submit Handlers ─── */
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');

        if (userCaptcha !== captcha.answer) {
            setAuthError('Invalid CAPTCHA answer. Please try again.');
            generateCaptcha();
            return;
        }

        if (!loginEmail || !loginPassword) return;

        setIsSubmitting(true);
        const { error } = await login(loginEmail, loginPassword);
        setIsSubmitting(false);

        if (error) {
            setAuthError(error);
            generateCaptcha();
            return;
        }

        navigate(from, { replace: true });
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');

        if (userCaptcha !== captcha.answer) {
            setAuthError('Invalid CAPTCHA answer. Please try again.');
            generateCaptcha();
            return;
        }

        if (getPasswordStrength(signupPassword) < 4) {
            setAuthError('Please choose a stronger password.');
            return;
        }

        if (!signupEmail || !signupPassword || !companyName) return;

        setIsSubmitting(true);
        const { error } = await signup(signupEmail, signupPassword, companyName, industry, locationVal);
        setIsSubmitting(false);

        if (error) {
            // If it's a confirmation email message, show it but still go to onboarding
            if (error.includes('confirm your account')) {
                setAuthError('');
                switchScreen('onboarding');
                return;
            }
            setAuthError(error);
            generateCaptcha();
            return;
        }

        switchScreen('onboarding');
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail) return;

        setIsSubmitting(true);
        const { error } = await resetPassword(forgotEmail);
        setIsSubmitting(false);

        if (error) {
            setAuthError(error);
            return;
        }

        setResetSent(true);
    };

    const handleOnboardingComplete = () => {
        navigate('/app', { replace: true });
    };

    /* ─── Password strength ─── */
    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong (Required)'];
    const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];

    /* ─── Captcha UI Component ─── */
    const CaptchaUI = () => (
        <div className="space-y-3 p-4 bg-surface-50 rounded-xl border border-surface-200">
            <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-surface-700 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-brand-500" />
                    Security Verification
                </label>
                <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-1 hover:bg-surface-200 rounded-md transition-colors text-surface-400 hover:text-brand-500"
                    title="Refresh Captcha"
                >
                    <RefreshCcw size={14} />
                </button>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-lg border border-surface-200 font-mono font-bold text-lg tracking-widest text-surface-900 shadow-sm select-none">
                    {captcha.question} = ?
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        required
                        placeholder="Answer"
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                        className="w-full bg-white border border-surface-200 rounded-lg px-3 py-2 text-[15px] font-bold text-surface-900 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-center"
                    />
                </div>
            </div>
        </div>
    );

    /* ─── Visual Panel Content ─── */
    const getPanelContent = () => {
        switch (screen) {
            case 'signup':
                return {
                    headline: <>Join the <span className="text-brand-400">Circular Revolution.</span></>,
                    subtitle: 'Connect with 2,800+ enterprises across 40+ industries transforming industrial waste into economic value.',
                    features: [
                        { icon: Cpu, title: 'AI-Powered Matching', desc: 'Intelligent symbiosis optimization' },
                        { icon: Recycle, title: 'Circular Analytics', desc: 'Real-time waste stream tracking' },
                    ]
                };
            case 'forgot':
                return {
                    headline: <>We'll get you <span className="text-brand-400">back on track.</span></>,
                    subtitle: 'Your circular economy dashboard and all your data will be waiting. We take security and access seriously.',
                    features: [
                        { icon: Lock, title: 'Encrypted Recovery', desc: '256-bit end-to-end encryption' },
                        { icon: Globe, title: 'Multi-Factor Auth', desc: 'Enterprise-grade protection' },
                    ]
                };
            case 'onboarding':
                return {
                    headline: <>Almost there. <span className="text-brand-400">Let's personalize.</span></>,
                    subtitle: 'Configure your circular profile so our AI can surface the most relevant exchange opportunities for your business.',
                    features: [
                        { icon: Sparkles, title: 'Smart Personalization', desc: 'AI tunes to your material streams' },
                        { icon: Zap, title: 'Instant Matches', desc: 'Start receiving opportunities today' },
                    ]
                };
            default:
                return {
                    headline: <>Welcome back to the <span className="text-brand-400">Circular Network.</span></>,
                    subtitle: 'Access your industrial symbiosis dashboard, monitor ESG metrics, and optimize your byproduct exchange.',
                    features: [
                        { icon: Cpu, title: 'AI Engine Active', desc: 'Scanning 14,000+ material streams' },
                        { icon: Leaf, title: 'Live Carbon Offset', desc: '18.5M kg CO₂e saved globally' },
                    ]
                };
        }
    };

    const panel = getPanelContent();

    /* ─── BUTTON STYLE ─── */




    const inputWithIconClass = `w-full bg-white border border-surface-200 rounded-xl pl-11 pr-4 py-3 text-[15px]
        font-medium text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-4
        focus:ring-brand-500/10 focus:border-brand-500 transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]`;

    const labelClass = 'block text-[13px] font-semibold text-surface-700 mb-1.5';

    /* ═══════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans text-surface-900">
            {/* Ambient Background Blurs */}
            <div className="absolute top-0 right-0 -mr-[18%] -mt-[8%] w-[650px] h-[650px] bg-brand-50 rounded-full blur-[120px] opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-[10%] -mb-[8%] w-[550px] h-[550px] bg-emerald-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-50/30 rounded-full blur-[80px] pointer-events-none" />

            {/* Main Card */}
            <div className="max-w-[1080px] w-full grid md:grid-cols-[1fr_1.2fr] bg-white rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden relative z-10 min-h-[620px]">

                {/* ─── Left Visual Panel ─── */}
                <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] text-white relative overflow-hidden">
                    {/* Animated SVG Background */}
                    <div className="absolute inset-0">
                        <CircularNetworkSVG />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/80 via-transparent to-transparent" />

                    <div className="relative z-10">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-2.5 mb-14 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10 group-hover:bg-white/15 transition-colors">
                                <Orbit size={18} className="text-brand-400" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">
                                MOLE
                            </span>
                        </div>

                        {/* Dynamic Headline */}
                        <h2 className="text-[28px] font-bold leading-[1.2] mb-4 tracking-tight">
                            {panel.headline}
                        </h2>
                        <p className="text-white/50 text-[14px] leading-relaxed max-w-[320px] mb-10">
                            {panel.subtitle}
                        </p>

                        {/* Stats Row */}
                        <div className="flex gap-8 mb-10">
                            <AnimatedStat value="2,800+" label="Enterprises" delay={300} />
                            <AnimatedStat value="18.5M" label="kg CO₂e Saved" delay={500} />
                            <AnimatedStat value="40+" label="Industries" delay={700} />
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="relative z-10 space-y-3">
                        {panel.features.map((feat, i) => (
                            <div
                                key={`${screen}-${i}`}
                                className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-4 border border-white/[0.08] flex items-center gap-4 hover:bg-white/[0.1] transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center border border-brand-500/20 flex-shrink-0">
                                    <feat.icon size={18} className="text-brand-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[13px] text-white/90">{feat.title}</h4>
                                    <p className="text-[12px] text-white/40">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Right Form Panel ─── */}
                <div className={`p-6 md:p-10 flex flex-col justify-center transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>

                    {/* Mobile Logo */}
                    <div className="md:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-surface-900 flex items-center justify-center">
                            <Orbit size={16} className="text-brand-400" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-surface-900">
                            MOLE
                        </span>
                    </div>

                    {/* Back Link */}
                    {screen !== 'onboarding' && (
                        <button
                            onClick={() => screen === 'forgot' ? switchScreen('signin') : navigate('/')}
                            className="flex items-center gap-1.5 text-surface-400 hover:text-surface-700 transition-colors text-[13px] font-medium mb-8 w-fit"
                        >
                            <ArrowLeft size={15} />
                            {screen === 'forgot' ? 'Back to Sign In' : 'Back to main site'}
                        </button>
                    )}

                    {/* ═══════ SIGN IN ═══════ */}
                    {screen === 'signin' && (
                        <>
                            <div className="mb-8">
                                <h3 className="text-[28px] font-bold tracking-tight text-surface-900 mb-1.5">
                                    Welcome Back
                                </h3>
                                <p className="text-surface-500 text-[15px]">
                                    Enter your credentials to access your corporate dashboard.
                                </p>
                            </div>

                            {authError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-[13px] font-semibold animate-shake">
                                    <AlertCircle size={18} />
                                    {authError}
                                </div>
                            )}

                            <form onSubmit={handleSignIn} className="space-y-5">
                                <div>
                                    <label className={labelClass}>Email Address</label>
                                    <div className="relative">
                                        <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                        <input
                                            id="signin-email"
                                            type="email"
                                            required
                                            placeholder="alex.mercer@acmesteel.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            className={inputWithIconClass}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Password</label>
                                    <div className="relative">
                                        <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                        <input
                                            id="signin-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className={inputWithIconClass + ' pr-11'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                <CaptchaUI />

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => switchScreen('forgot')}
                                        className="text-[13px] font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    id="signin-submit"
                                    type="submit"
                                    style={{ backgroundColor: '#1C1C1E', color: '#fff' }}
                                    className="w-full rounded-xl py-3.5 font-semibold text-[15px] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-2 active:scale-[0.98] hover:opacity-90"
                                >
                                    Sign In
                                    <ArrowRight size={16} />
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 mt-8">
                                <div className="h-px flex-1 bg-surface-200" />
                                <span className="text-[12px] text-surface-400 font-medium">OR</span>
                                <div className="h-px flex-1 bg-surface-200" />
                            </div>

                            {/* SSO placeholder */}
                            <button className="w-full mt-4 border border-surface-200 rounded-xl py-3 text-[14px] font-medium text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-all flex items-center justify-center gap-2">
                                <Globe size={16} />
                                Continue with SSO
                            </button>

                            <div className="mt-8 text-center text-[14px]">
                                <span className="text-surface-500">Don't have an account? </span>
                                <button
                                    onClick={() => switchScreen('signup')}
                                    className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                                >
                                    Create Account
                                </button>
                            </div>
                        </>
                    )}

                    {/* ═══════ SIGN UP ═══════ */}
                    {screen === 'signup' && (
                        <>
                            <div className="mb-6">
                                <h3 className="text-[28px] font-bold tracking-tight text-surface-900 mb-1.5">
                                    Create Your Account
                                </h3>
                                <p className="text-surface-500 text-[14px] leading-relaxed">
                                    Join a growing network of enterprises transforming waste into value through AI-enabled circular exchange.
                                </p>
                            </div>

                            {authError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-[13px] font-semibold animate-shake">
                                    <AlertCircle size={18} />
                                    {authError}
                                </div>
                            )}

                            <form onSubmit={handleSignUp} className="space-y-4">
                                {/* Company Name */}
                                <div>
                                    <label className={labelClass}>Company Name</label>
                                    <div className="relative">
                                        <Building2 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                        <input
                                            id="signup-company"
                                            type="text"
                                            required
                                            placeholder="Acme Steel Corporation"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className={inputWithIconClass}
                                        />
                                    </div>
                                </div>

                                {/* Industry & Location Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div ref={dropdownRef} className="relative">
                                        <label className={labelClass}>Industry Type</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="w-full bg-white border border-surface-200 rounded-xl px-4 py-3 text-[15px] font-medium text-left flex items-center justify-between focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                        >
                                            <span className={industry ? 'text-surface-900' : 'text-surface-400'}>
                                                {industry || 'Select'}
                                            </span>
                                            <ChevronDown size={16} className={`text-surface-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                        {showDropdown && (
                                            <div className="absolute z-50 mt-1.5 w-full bg-white border border-surface-200 rounded-xl shadow-lg shadow-black/5 max-h-52 overflow-y-auto py-1.5">
                                                {INDUSTRIES.map((ind) => (
                                                    <button
                                                        key={ind}
                                                        type="button"
                                                        onClick={() => { setIndustry(ind); setShowDropdown(false); }}
                                                        className={`w-full text-left px-4 py-2.5 text-[14px] font-medium hover:bg-brand-50 transition-colors ${industry === ind ? 'text-brand-600 bg-brand-50' : 'text-surface-700'}`}
                                                    >
                                                        {ind}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Location</label>
                                        <div className="relative">
                                            <MapPin size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                            <input
                                                id="signup-location"
                                                type="text"
                                                placeholder="Mumbai, IN"
                                                value={locationVal}
                                                onChange={(e) => setLocationVal(e.target.value)}
                                                className={inputWithIconClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={labelClass}>Work Email</label>
                                    <div className="relative">
                                        <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                        <input
                                            id="signup-email"
                                            type="email"
                                            required
                                            placeholder="you@company.com"
                                            value={signupEmail}
                                            onChange={(e) => setSignupEmail(e.target.value)}
                                            className={inputWithIconClass}
                                        />
                                    </div>
                                </div>

                                {/* Password + Strength Meter */}
                                <div>
                                    <label className={labelClass}>Password</label>
                                    <div className="relative">
                                        <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                        <input
                                            id="signup-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="Min. 8 characters"
                                            value={signupPassword}
                                            onChange={(e) => setSignupPassword(e.target.value)}
                                            className={inputWithIconClass + ' pr-11'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                    {signupPassword && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 flex gap-1">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= getPasswordStrength(signupPassword) ? strengthColors[getPasswordStrength(signupPassword)] : 'bg-surface-200'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[11px] font-medium text-surface-500">
                                                {strengthLabels[getPasswordStrength(signupPassword)]}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <CaptchaUI />

                                {/* Terms */}
                                <p className="text-[12px] text-surface-400 leading-relaxed">
                                    By creating an account, you agree to our{' '}
                                    <Link to="/terms" className="text-brand-600 hover:underline font-medium">Terms of Service</Link>{' '}and{' '}
                                    <Link to="/privacy" className="text-brand-600 hover:underline font-medium">Privacy Policy</Link>.
                                </p>

                                <button
                                    id="signup-submit"
                                    type="submit"
                                    style={{ backgroundColor: '#1C1C1E', color: '#fff' }}
                                    className="w-full rounded-xl py-3.5 font-semibold text-[15px] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] hover:opacity-90"
                                >
                                    Create Account
                                    <ArrowRight size={16} />
                                </button>
                            </form>

                            <div className="mt-6 text-center text-[14px]">
                                <span className="text-surface-500">Already have an account? </span>
                                <button
                                    onClick={() => switchScreen('signin')}
                                    className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                                >
                                    Sign In
                                </button>
                            </div>
                        </>
                    )}

                    {/* ═══════ FORGOT PASSWORD ═══════ */}
                    {screen === 'forgot' && (
                        <>
                            <div className="mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-6">
                                    <Lock size={24} className="text-brand-600" />
                                </div>
                                <h3 className="text-[28px] font-bold tracking-tight text-surface-900 mb-1.5">
                                    Reset Password
                                </h3>
                                <p className="text-surface-500 text-[15px] leading-relaxed">
                                    {resetSent
                                        ? "Check your inbox for a password reset link. It may take a minute to arrive."
                                        : "Enter the email associated with your account and we'll send a reset link."}
                                </p>
                            </div>

                            {!resetSent ? (
                                <form onSubmit={handleForgotPassword} className="space-y-5">
                                    <div>
                                        <label className={labelClass}>Email Address</label>
                                        <div className="relative">
                                            <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                            <input
                                                id="forgot-email"
                                                type="email"
                                                required
                                                placeholder="you@company.com"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                className={inputWithIconClass}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        id="forgot-submit"
                                        type="submit"
                                        style={{ backgroundColor: '#1C1C1E', color: '#fff' }}
                                        className="w-full rounded-xl py-3.5 font-semibold text-[15px] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] hover:opacity-90"
                                    >
                                        Send Reset Link
                                        <ArrowRight size={16} />
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex items-start gap-4">
                                        <CheckCircle2 size={22} className="text-brand-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[14px] font-semibold text-brand-900 mb-1">Email Sent Successfully</p>
                                            <p className="text-[13px] text-brand-700/70 leading-relaxed">
                                                We've sent a password reset link to <strong>{forgotEmail}</strong>. Please check your inbox and spam folder.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setResetSent(false); setForgotEmail(''); switchScreen('signin'); }}
                                        className="w-full border border-surface-200 rounded-xl py-3 text-[14px] font-semibold text-surface-700 hover:bg-surface-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft size={15} />
                                        Return to Sign In
                                    </button>
                                </div>
                            )}

                            {!resetSent && (
                                <div className="mt-8 text-center text-[14px]">
                                    <span className="text-surface-500">Remember your password? </span>
                                    <button
                                        onClick={() => switchScreen('signin')}
                                        className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* ═══════ ONBOARDING ═══════ */}
                    {screen === 'onboarding' && (
                        <>
                            <div className="mb-6">
                                {/* Progress indicator */}
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                                            <CheckCircle2 size={14} className="text-white" />
                                        </div>
                                        <span className="text-[12px] font-semibold text-brand-600">Account</span>
                                    </div>
                                    <div className="w-8 h-px bg-brand-500" />
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-[11px] font-bold text-white">
                                            2
                                        </div>
                                        <span className="text-[12px] font-semibold text-brand-600">Profile</span>
                                    </div>
                                    <div className="w-8 h-px bg-surface-200" />
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-surface-200 flex items-center justify-center text-[11px] font-bold text-surface-500">
                                            3
                                        </div>
                                        <span className="text-[12px] font-medium text-surface-400">Dashboard</span>
                                    </div>
                                </div>

                                <h3 className="text-[28px] font-bold tracking-tight text-surface-900 mb-1.5">
                                    Set Up Your Circular Profile
                                </h3>
                                <p className="text-surface-500 text-[14px] leading-relaxed">
                                    Help our AI engine find the best material exchange opportunities for your business. You can always update this later.
                                </p>
                            </div>

                            <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                                {/* Waste Types */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Trash2 size={15} className="text-surface-500" />
                                        <label className="text-[13px] font-semibold text-surface-700">Waste Types Generated</label>
                                        <span className="text-[11px] px-1.5 py-0.5 bg-surface-100 rounded text-surface-400 font-medium">Optional</span>
                                    </div>
                                    <ChipSelector
                                        options={WASTE_TYPES}
                                        selected={wasteTypes}
                                        onToggle={(v) => toggleChip(wasteTypes, setWasteTypes, v)}
                                    />
                                </div>

                                {/* Materials Needed */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <PackageCheck size={15} className="text-surface-500" />
                                        <label className="text-[13px] font-semibold text-surface-700">Materials Frequently Required</label>
                                        <span className="text-[11px] px-1.5 py-0.5 bg-surface-100 rounded text-surface-400 font-medium">Optional</span>
                                    </div>
                                    <ChipSelector
                                        options={MATERIAL_NEEDS}
                                        selected={materialNeeds}
                                        onToggle={(v) => toggleChip(materialNeeds, setMaterialNeeds, v)}
                                    />
                                </div>

                                {/* Handling Capabilities */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Settings2 size={15} className="text-surface-500" />
                                        <label className="text-[13px] font-semibold text-surface-700">Handling Capabilities</label>
                                        <span className="text-[11px] px-1.5 py-0.5 bg-surface-100 rounded text-surface-400 font-medium">Optional</span>
                                    </div>
                                    <ChipSelector
                                        options={CAPABILITIES}
                                        selected={capabilities}
                                        onToggle={(v) => toggleChip(capabilities, setCapabilities, v)}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-8 pt-6 border-t border-surface-100">
                                <button
                                    onClick={handleOnboardingComplete}
                                    className="text-[14px] font-medium text-surface-500 hover:text-surface-700 transition-colors px-4"
                                >
                                    Skip for now
                                </button>
                                <button
                                    id="onboarding-submit"
                                    onClick={handleOnboardingComplete}
                                    style={{ backgroundColor: '#1C1C1E', color: '#fff' }}
                                    className="flex-1 rounded-xl py-3.5 font-semibold text-[15px] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] hover:opacity-90"
                                >
                                    Continue to Dashboard
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Trust Badges (not shown on onboarding) */}
                    {screen !== 'onboarding' && (
                        <div className="mt-10 pt-5 border-t border-surface-100 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-surface-400">
                                <CheckCircle2 size={13} /> SOC2 Compliant
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-surface-400">
                                <CheckCircle2 size={13} /> ISO 27001
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-surface-400">
                                <Globe size={13} /> ESG Certified
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
