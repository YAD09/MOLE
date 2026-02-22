import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

/* ─── Types ─── */
interface UserProfile {
    name: string;
    company: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: UserProfile | null;
    session: Session | null;
    supabaseUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: string | null }>;
    signup: (email: string, password: string, company: string, industry: string, location: string) => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ─── Helper: build profile from Supabase user ─── */
const buildProfile = (user: User, company?: string): UserProfile => {
    const meta = user.user_metadata || {};
    return {
        name: meta.full_name || meta.name || user.email?.split('@')[0] || 'User',
        company: meta.company || company || 'Your Organisation',
        email: user.email || '',
    };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    /* ─── Listen to Supabase auth state changes ─── */
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setSupabaseUser(session?.user ?? null);
            setUser(session?.user ? buildProfile(session.user) : null);
            setLoading(false);
        });

        // Subscribe to changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setSupabaseUser(session?.user ?? null);
            setUser(session?.user ? buildProfile(session.user) : null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    /* ─── Sign In ─── */
    const login = async (email: string, password: string): Promise<{ error: string | null }> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
    };

    /* ─── Sign Up ─── */
    const signup = async (
        email: string,
        password: string,
        company: string,
        industry: string,
        location: string
    ): Promise<{ error: string | null }> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    company,
                    industry,
                    location,
                    full_name: email.split('@')[0],
                },
            },
        });

        if (error) return { error: error.message };

        // If email confirmation is required, user will be null but no error
        if (data.user && !data.session) {
            return { error: 'Please check your email to confirm your account before signing in.' };
        }

        if (data.user) {
            setUser(buildProfile(data.user, company));
        }

        return { error: null };
    };

    /* ─── Sign Out ─── */
    const logout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setSupabaseUser(null);
        setUser(null);
    };

    /* ─── Reset Password ─── */
    const resetPassword = async (email: string): Promise<{ error: string | null }> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return { error: error.message };
        return { error: null };
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!session,
                user,
                session,
                supabaseUser,
                loading,
                login,
                signup,
                logout,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
