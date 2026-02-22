import { supabase } from './supabase';

/* ═══════════════════════════════════════
   TYPES
   ═══════════════════════════════════════ */

export interface Company {
    id: string;
    company_name: string;
    industry_type: string;
    location: string;
    created_at: string;
}

export interface WasteListing {
    id: string;
    company_id: string;
    waste_type: string;
    description?: string;
    quantity: number;
    unit: string;
    frequency: string;
    condition: string;
    hazard_level: string;
    handling?: string;
    price_per_unit?: number;
    listing_location?: string;
    created_at: string;
}

/** WasteListing joined with company name/location for the public marketplace */
export interface WasteListingPublic extends WasteListing {
    companies?: { company_name: string; location: string; industry_type: string };
}

export interface MaterialRequest {
    id: string;
    company_id: string;
    material_needed: string;
    quantity_required: number;
    unit: string;
    frequency: string;
    quality_grade?: string;
    quality_constraints?: string;
    delivery_location?: string;
    max_distance_km?: number;
    price_per_unit?: number;
    created_at: string;
}

export interface Notification {
    id: string;
    company_id: string;
    type: 'match_found' | 'offer_received' | 'listing_expiring' | 'system' | 'impact_milestone' | 'info';
    title: string;
    body: string;
    is_read: boolean;
    action_url?: string;
    meta?: Record<string, unknown>;
    created_at: string;
}

export interface Opportunity {
    id: string;
    company_id: string;
    waste_listing_id?: string;
    material_request_id?: string;
    counterparty_id?: string;
    title: string;
    material_from: string;
    material_to: string;
    compatibility_score: number;
    quality_fit?: number;
    distance_km?: number;
    cost_savings: number;
    cost_savings_pct: number;
    co2_saved_kg: number;
    water_saved_l: number;
    energy_saved_pct: number;
    volume?: string;
    frequency?: string;
    estimated_roi?: string;
    time_to_close?: string;
    certifications: string[];
    why_match: string[];
    is_urgent: boolean;
    status: 'active' | 'accepted' | 'rejected' | 'expired';
    created_at: string;
    expires_at?: string;
}

export interface OpportunityWithSender extends Opportunity {
    companies?: {
        company_name: string;
        location: string;
        industry_type: string;
    };
}

export interface OpportunityWithCounterparty extends Opportunity {
    companies?: {
        company_name: string;
        location: string;
        industry_type: string;
    };
}

export interface ImpactAnalytics {
    id: string;
    company_id: string;
    period_month: string;    // 'YYYY-MM-DD' (first of month)
    total_savings: number;
    transactions_count: number;
    co2_avoided_kg: number;
    water_saved_l: number;
    energy_saved_kwh: number;
    waste_diverted_kg: number;
    circularity_score?: number;
    recycled_pct: number;
    reused_pct: number;
    recovered_pct: number;
    landfill_pct: number;
    created_at: string;
}

export interface CircularityScore {
    id: string;
    company_id: string;
    overall_score: number;
    recycled_pct: number;
    reused_pct: number;
    recovered_pct: number;
    landfill_pct: number;
    sector_percentile: number;
    score_delta: number;
    last_computed_at: string;
    updated_at: string;
}

export interface NetworkConnection {
    id: string;
    from_company_id: string;
    to_company_id: string;
    connection_type: 'trade' | 'pending' | 'verified_partner' | 'affiliate';
    material_type?: string;
    volume_mt?: number;
    distance_km?: number;
    co2_saved_kg: number;
    status: 'active' | 'paused' | 'completed';
    established_at: string;
    last_active_at: string;
    // Joined fields
    partner_name?: string;
    partner_industry?: string;
    partner_location?: string;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    opportunity_id?: string;
    content: string;
    is_read: boolean;
    created_at: string;
    // Optional joined info
    sender_name?: string;
}

/* ═══════════════════════════════════
   COMPANIES
   ═══════════════════════════════════ */

export async function getMyCompany(): Promise<Company | null> {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('[db] getMyCompany:', error.message);
        return null;
    }
    return data as Company;
}

export async function upsertCompany(payload: Omit<Company, 'id' | 'created_at'>): Promise<Company | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
        .from('companies')
        .upsert({ id: user.id, ...payload }, { onConflict: 'id' })
        .select()
        .single();
    if (error) { console.error('[db] upsertCompany:', error.message); return null; }
    return data as Company;
}

/* ═══════════════════════════════════
   WASTE LISTINGS
   ═══════════════════════════════════ */

export async function getMyWasteListings(): Promise<WasteListing[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('waste_listings')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });
    if (error) { console.error('[db] getMyWasteListings:', error.message); return []; }
    return (data as WasteListing[]) ?? [];
}

export async function createWasteListing(
    payload: Omit<WasteListing, 'id' | 'company_id' | 'created_at'>
): Promise<{ data: WasteListing | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };
    const { data, error } = await supabase
        .from('waste_listings')
        .insert({ company_id: user.id, ...payload })
        .select()
        .single();
    if (error) return { data: null, error: error.message };
    return { data: data as WasteListing, error: null };
}

export async function deleteWasteListing(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('waste_listings').delete().eq('id', id);
    if (error) return { error: error.message };
    return { error: null };
}

export async function updateWasteListing(
    id: string,
    payload: Partial<Omit<WasteListing, 'id' | 'company_id' | 'created_at'>>
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('waste_listings')
        .update(payload)
        .eq('id', id);
    if (error) return { error: error.message };
    return { error: null };
}

/**
 * Fetch ALL waste listings platform-wide (public read, joined with company info).
 * RLS must allow SELECT for authenticated users (add policy if needed).
 */
export async function getAllWasteListings(limit = 60): Promise<WasteListingPublic[]> {
    const { data, error } = await supabase
        .from('waste_listings')
        .select('*, companies(company_name, location, industry_type)')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('[db] getAllWasteListings:', error.message); return []; }
    return (data as WasteListingPublic[]) ?? [];
}

/**
 * Buyer sends an offer on a waste listing — creates an opportunity row
 * targeted at the buyer's own company_id (they see it in their Opportunities).
 */
export async function sendOffer(payload: {
    waste_listing_id: string;
    counterparty_id: string;       // owner of the waste listing
    title: string;
    material_from: string;
    material_to: string;
    volume?: string;
    frequency?: string;
    cost_savings?: number;
    co2_saved_kg?: number;
    notes?: string;                // stored in why_match[0]
    price?: number;
}): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('opportunities').insert({
        company_id: user.id,
        waste_listing_id: payload.waste_listing_id,
        counterparty_id: payload.counterparty_id,
        title: payload.title,
        material_from: payload.material_from,
        material_to: payload.material_to || payload.material_from,
        compatibility_score: 0,       // will be computed by AI later
        cost_savings: payload.cost_savings ?? 0,
        cost_savings_pct: 0,
        co2_saved_kg: payload.co2_saved_kg ?? 0,
        water_saved_l: 0,
        energy_saved_pct: 0,
        volume: payload.volume,
        frequency: payload.frequency,
        why_match: payload.notes ? [payload.notes] : [],
        certifications: [],
        is_urgent: false,
        status: 'active',
    });
    if (error) return { error: error.message };
    return { error: null };
}

/* ═══════════════════════════════════
   MATERIAL REQUESTS
   ═══════════════════════════════════ */

export async function getMyMaterialRequests(): Promise<MaterialRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('material_requests')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });
    if (error) { console.error('[db] getMyMaterialRequests:', error.message); return []; }
    return (data as MaterialRequest[]) ?? [];
}

export async function createMaterialRequest(
    payload: Omit<MaterialRequest, 'id' | 'company_id' | 'created_at'>
): Promise<{ data: MaterialRequest | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };
    const { data, error } = await supabase
        .from('material_requests')
        .insert({ company_id: user.id, ...payload })
        .select()
        .single();
    if (error) return { data: null, error: error.message };
    return { data: data as MaterialRequest, error: null };
}

export async function deleteMaterialRequest(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('material_requests').delete().eq('id', id);
    if (error) return { error: error.message };
    return { error: null };
}

/* ═══════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════ */

export async function getMyNotifications(limit = 20): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('[db] getMyNotifications:', error.message); return []; }
    return (data as Notification[]) ?? [];
}

export async function getUnreadNotificationCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.id)
        .eq('is_read', false);
    if (error) return 0;
    return count ?? 0;
}

export async function markNotificationsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('company_id', user.id)
        .eq('is_read', false);
}

export async function markOneNotificationRead(id: string): Promise<void> {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

/* ═══════════════════════════════════
   OPPORTUNITIES
   ═══════════════════════════════════ */

export async function getMyOpportunities(status: 'active' | 'accepted' | 'rejected' | 'expired' | 'all' = 'active'): Promise<OpportunityWithCounterparty[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // We join companies using the counterparty_id
    let q = supabase
        .from('opportunities')
        .select(`
            *,
            companies!counterparty_id (
                company_name,
                location,
                industry_type
            )
        `)
        .eq('company_id', user.id)
        .order('compatibility_score', { ascending: false });

    if (status !== 'all') q = q.eq('status', status);

    const { data, error } = await q;

    if (error) {
        console.error('[db] getMyOpportunities:', error.message);
        return [];
    }

    return (data as OpportunityWithCounterparty[]) ?? [];
}

export async function getReceivedOffers(status: 'active' | 'accepted' | 'rejected' | 'expired' | 'all' = 'active'): Promise<OpportunityWithSender[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // We join companies using the company_id (which is the buyer/sender)
    let q = supabase
        .from('opportunities')
        .select(`
            *,
            companies!company_id (
                company_name,
                location,
                industry_type
            )
        `)
        .eq('counterparty_id', user.id)
        .order('created_at', { ascending: false });

    if (status !== 'all') q = q.eq('status', status);

    const { data, error } = await q;

    if (error) {
        console.error('[db] getReceivedOffers:', error.message);
        return [];
    }

    return (data as OpportunityWithSender[]) ?? [];
}

export async function updateOpportunityStatus(
    id: string,
    status: 'accepted' | 'rejected' | 'expired'
): Promise<{ error: string | null }> {
    // 1. Update the status
    const { error: updateError } = await supabase
        .from('opportunities')
        .update({ status })
        .eq('id', id);

    if (updateError) return { error: updateError.message };

    // 2. If accepted, create a network connection
    if (status === 'accepted') {
        const { data: opp, error: fetchError } = await supabase
            .from('opportunities')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !opp) {
            console.warn('[db] accepted opportunity but could not fetch details for network map');
            return { error: null }; // Status updated, just no connection
        }

        const { error: connError } = await supabase
            .from('network_connections')
            .upsert({
                from_company_id: opp.company_id,
                to_company_id: opp.counterparty_id || opp.company_id, // fallback if null
                material_type: opp.material_from,
                volume_mt: parseFloat(opp.volume?.split(' ')[0] || '0'),
                distance_km: opp.distance_km || 0,
                co2_saved_kg: opp.co2_saved_kg || 0,
                connection_type: 'trade',
                status: 'active',
                last_active_at: new Date().toISOString()
            }, { onConflict: 'from_company_id,to_company_id,material_type' });

        if (connError) {
            console.error('[db] failed to create network connection:', connError.message);
        }
    }

    return { error: null };
}

/* ═══════════════════════════════════
   IMPACT ANALYTICS
   ═══════════════════════════════════ */

export async function getMyImpactAnalytics(months = 6): Promise<ImpactAnalytics[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('impact_analytics')
        .select('*')
        .eq('company_id', user.id)
        .order('period_month', { ascending: true })
        .limit(months);
    if (error) { console.error('[db] getMyImpactAnalytics:', error.message); return []; }
    return (data as ImpactAnalytics[]) ?? [];
}

export async function upsertImpactMonth(
    payload: Omit<ImpactAnalytics, 'id' | 'company_id' | 'created_at'>
): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
        .from('impact_analytics')
        .upsert({ company_id: user.id, ...payload }, { onConflict: 'company_id,period_month' });
    if (error) return { error: error.message };
    return { error: null };
}

/* ═══════════════════════════════════
   CIRCULARITY SCORE
   ═══════════════════════════════════ */

export async function getMyCircularityScore(): Promise<CircularityScore | null> {
    const { data, error } = await supabase
        .from('circularity_scores')
        .select('*')
        .single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('[db] getMyCircularityScore:', error.message);
        return null;
    }
    return data as CircularityScore;
}

export async function upsertCircularityScore(
    payload: Omit<CircularityScore, 'id' | 'company_id' | 'last_computed_at' | 'updated_at'>
): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
        .from('circularity_scores')
        .upsert({
            company_id: user.id,
            ...payload,
            last_computed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'company_id' });
    if (error) return { error: error.message };
    return { error: null };
}

/* ═══════════════════════════════════
   NETWORK CONNECTIONS
   ═══════════════════════════════════ */

export async function getMyNetworkConnections(): Promise<NetworkConnection[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('network_connections')
        .select('*')
        .or(`from_company_id.eq.${user.id},to_company_id.eq.${user.id}`)
        .order('last_active_at', { ascending: false });

    if (error) { console.error('[db] getMyNetworkConnections:', error.message); return []; }

    // Fetch all companies involved in these connections to get their names
    const partnerIds = (data as NetworkConnection[]).map(c =>
        c.from_company_id === user.id ? c.to_company_id : c.from_company_id
    );

    if (partnerIds.length === 0) return [];

    const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('id, company_name, industry_type, location')
        .in('id', partnerIds);

    if (compError) { console.error('[db] getMyNetworkConnections companies join:', compError.message); }

    const companyMap = (companies || []).reduce((acc: any, comp: any) => {
        acc[comp.id] = comp;
        return acc;
    }, {});

    return (data as NetworkConnection[]).map(c => {
        const partnerId = c.from_company_id === user.id ? c.to_company_id : c.from_company_id;
        const partner = companyMap[partnerId];
        return {
            ...c,
            partner_name: partner?.company_name || 'Unknown Partner',
            partner_industry: partner?.industry_type,
            partner_location: partner?.location
        };
    });
}

/* ═══════════════════════════════════
   MESSAGES/CHAT
   ═══════════════════════════════════ */

export async function sendMessage(payload: {
    receiver_id: string;
    opportunity_id?: string;
    content: string;
}): Promise<{ data: Message | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('messages')
        .insert({
            sender_id: user.id,
            ...payload
        })
        .select()
        .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Message, error: null };
}

export async function getMessages(opportunity_id: string): Promise<Message[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('opportunity_id', opportunity_id)
        .order('created_at', { ascending: true });

    if (error) { console.error('[db] getMessages:', error.message); return []; }
    return (data as Message[]) ?? [];
}

export async function getConversationMessages(partner_id: string): Promise<Message[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partner_id}),and(sender_id.eq.${partner_id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

    if (error) { console.error('[db] getConversationMessages:', error.message); return []; }
    return (data as Message[]) ?? [];
}

export interface Conversation {
    partner_id: string;
    partner_name: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
}

export async function getConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('messages')
        .select(`
            id, content, created_at, sender_id, receiver_id, is_read
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    if (error) { console.error('[db] getConversations:', error.message); return []; }

    // Group and find unique partners
    const partners = new Map<string, any>();
    const msgs = data as any[];

    msgs.forEach(m => {
        const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (!partners.has(partnerId)) {
            partners.set(partnerId, {
                partner_id: partnerId,
                last_message: m.content,
                last_message_at: m.created_at,
                unread_count: (!m.is_read && m.receiver_id === user.id) ? 1 : 0
            });
        } else if (!m.is_read && m.receiver_id === user.id) {
            partners.get(partnerId).unread_count++;
        }
    });

    const partnerIds = Array.from(partners.keys());
    if (partnerIds.length === 0) return [];

    const { data: companies } = await supabase
        .from('companies')
        .select('id, company_name')
        .in('id', partnerIds);

    const companyMap = (companies || []).reduce((acc: any, c: any) => {
        acc[c.id] = c.company_name;
        return acc;
    }, {});

    return Array.from(partners.values()).map(p => ({
        ...p,
        partner_name: companyMap[p.partner_id] || 'Anonymous Company'
    }));
}

export async function markMessagesAsRead(partner_id: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', partner_id)
        .eq('is_read', false);

    if (error) {
        console.error('[db] markMessagesAsRead:', error.message);
        return false;
    }
    return true;
}

export async function createNetworkConnection(
    payload: Omit<NetworkConnection, 'id' | 'from_company_id' | 'established_at' | 'last_active_at'>
): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
        .from('network_connections')
        .insert({ from_company_id: user.id, ...payload });
    if (error) return { error: error.message };
    return { error: null };
}
