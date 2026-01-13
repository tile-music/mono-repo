// BullMQ for task scheduling
export { Queue, Worker, QueueEvents } from "npm:bullmq";

// Spotify API client
export { Client, Player } from "npm:spotify-api.js";

// Musicbrainz Client

export { MusicBrainzApi, CoverArtArchiveApi, type IReleaseMatch, } from 'npm:musicbrainz-api';

const config = {
  appName: 'tile.music',
  appVersion: "0.0.0",
  appContactInfo: "ivybixler@gmail.com",
};



// Supabase client
export { SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Node.js built-in modules
export { fork } from "node:child_process";
export { default as process } from "node:process";

// Express for web server
export { default as express } from "npm:express";

export * as munite from "jsr:@tile-music/munite";
