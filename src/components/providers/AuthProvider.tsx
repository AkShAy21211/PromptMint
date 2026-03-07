"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface Profile {
    usage_count: number;
    is_pro: boolean;
    plan_type: string;
    razorpay_subscription_id?: string;
    cancel_at_period_end?: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    refreshProfile: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("usage_count, is_pro, plan_type, razorpay_subscription_id, cancel_at_period_end")
                .eq("id", userId)
                .maybeSingle();

            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    }, [supabase]);

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    useEffect(() => {
        // 1. Initial Load
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            }
            setLoading(false);
        };

        initAuth();

        // 2. Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, fetchProfile]);

    return (
        <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
