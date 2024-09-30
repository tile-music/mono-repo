import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserPlaying } from "./UserPlaying";

export class ServiceAdapter{
  supabase!: SupabaseClient;
  users!: Map<string, UserPlaying>;
  constructor() {
    this.supabase = this.makeSupabase();
  }
  /**
   * this function returns a reference to the supabase client
   * @returns a reference to the supabase client
   */
  public makeSupabase(){
    return createClient(
      process.env.SB_URL as string,
      process.env.SERVICE as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  run = async () => {

  }
  
}