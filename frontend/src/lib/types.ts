import type { Database } from "$shared/schema";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
