// BullMQ for task scheduling
export { Queue, Worker, QueueEvents } from "npm:bullmq";

// Spotify API client
export { Client, Player } from "npm:spotify-api.js";

// Musicbrainz Client
export { MusicBrainzApi, CoverArtArchiveApi } from 'npm:musicbrainz-api';

// Supabase client
export { SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Node.js built-in modules
export { fork } from "node:child_process";
export { default as process } from "node:process";