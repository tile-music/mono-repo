import { Database } from "../schema.ts";
export type Row<T extends keyof Database["prod" | "test"]["Tables"]> = Database["prod" | "test"]["Tables"][T];

export type MusicSchema = [Database, "prod" | "test", Database["prod" | "test"]]