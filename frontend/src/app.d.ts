import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile } from "$lib/types";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            supabase: SupabaseClient;
            safeGetSession: () => Promise<{
                session: Session | null;
                user: User | null;
            }>;
            session: Session | null;
            user: User | null;
            profile: Profile | null;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
    declare const MusicKit: any;
}

export {};
