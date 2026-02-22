import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getMyDeals, type Transaction } from '../lib/db';
import { Package, Truck, CheckCircle2, Clock, CreditCard, FileText } from 'lucide-react';

const STAGES = [
    { id: 'agreement', label: 'Agreement', icon: FileText },
    { id: 'payment_pending', label: 'Payment', icon: CreditCard },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'delivery', label: 'Delivery', icon: Package },
    { id: 'review', label: 'Complete', icon: CheckCircle2 },
];

const MyDeals = () => {
    const [deals, setDeals] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setMyId(user.id);
            const data = await getMyDeals();
            setDeals(data);
            setLoading(false);
        };
        init();
    }, []);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-surface-900 mb-6">My Deals & Progress</h1>
            <div className="space-y-6">
                {deals.map(deal => {
                    const currentStageIndex = STAGES.findIndex(s => s.id === deal.stage);
                    const isSeller = deal.seller_id === myId;
                    const partnerName = isSeller ? deal.buyer?.company_name : deal.seller?.company_name;
                    
                    return (
                        <div key={deal.id} className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${isSeller ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {isSeller ? 'Selling' : 'Buying'}
                                        </span>
                                        <span className="text-surface-400 text-xs">• {new Date(deal.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-surface-900 mb-1">{deal.material}</h3>
                                    <p className="text-surface-500 text-sm">
                                        Partner: <span className="font-semibold text-brand-600">{partnerName || 'Unknown Company'}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-brand-600">${deal.price.toLocaleString()}</p>
                                    <p className="text-surface-500 font-medium">{deal.amount} units</p>
                                </div>
                            </div>

                            {/* Progress Stepper */}
                            <div className="relative">
                                {/* Connector Line */}
                                <div className="absolute left-0 top-4 w-full h-1 bg-surface-100 -z-10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-brand-500 transition-all duration-1000 ease-out" 
                                        style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                                    />
                                </div>
                                
                                <div className="flex justify-between w-full">
                                    {STAGES.map((stage, idx) => {
                                        const Icon = stage.icon;
                                        const isCompleted = idx <= currentStageIndex;
                                        const isCurrent = idx === currentStageIndex;
                                        
                                        return (
                                            <div key={stage.id} className="flex flex-col items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                                    isCompleted 
                                                        ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20 scale-110' 
                                                        : 'bg-white border-surface-200 text-surface-300'
                                                }`}>
                                                    {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                                                </div>
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                                    isCurrent ? 'text-brand-600' : isCompleted ? 'text-surface-600' : 'text-surface-300'
                                                }`}>
                                                    {stage.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action / Status Footer */}
                            <div className="mt-8 pt-4 border-t border-surface-100 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-sm text-surface-500">
                                    <Clock size={14} />
                                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                                </div>
                                <button className="text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline">
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}

                {deals.length === 0 && (
                    <div className="text-center py-16 bg-surface-50 rounded-2xl border-2 border-dashed border-surface-200">
                        <Package size={48} className="mx-auto text-surface-300 mb-4" />
                        <h3 className="text-lg font-bold text-surface-900 mb-1">No Active Deals</h3>
                        <p className="text-surface-400 max-w-sm mx-auto">
                            Start a conversation with a supplier or buyer to initiate a new deal.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDeals;
