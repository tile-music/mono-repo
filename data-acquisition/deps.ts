// BullMQ for queue management
export { Queue, Worker } from "npm:bullmq";

// Spotify API client
export { Client, Player } from "npm:spotify-api.js";

// Supabase client
export { SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Node.js built-in modules
export { fork } from "node:child_process";
export { default as os } from "node:os";
export { default as process } from "node:process";

// dotenv for environment variable management
export * as dotenv from "npm:dotenv";

// Express for web server
export { default as express } from "npm:express";