"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, SupabaseClient } from "@supabase/supabase-js";

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
    supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

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
        let mounted = true;

        const initialize = async () => {
            try {
                // Get initial session
                const { data: { session } } = await supabase.auth.getSession();
                if (!mounted) return;

                const initialUser = session?.user ?? null;
                setUser(initialUser);

                if (initialUser) {
                    await fetchProfile(initialUser.id);
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error("Auth init error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            const currentUser = session?.user ?? null;

            // Check if user actually changed to avoid redundant fetches
            // We use the functional update or just rely on the session data
            setUser(prevUser => {
                if (currentUser?.id !== prevUser?.id) {
                    if (currentUser) {
                        fetchProfile(currentUser.id);
                    } else {
                        setProfile(null);
                    }
                }
                return currentUser;
            });

            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile]);

    return (
        <AuthContext.Provider value={{ user, profile, loading, refreshProfile, supabase }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
