import { Client } from 'spotify-api.js';
import { SupabaseClient } from "@supabase/supabase-js";


import * as dotenv from "dotenv";

dotenv.config();

/*
 *"listened_at": 1736221125706,
    "track_id": 150859,
    "album_id": 150859,
    "albums": { "spotify_id": "0equCatWbHF6wgpR7Lxh0Q" } 
 * 
 */

export type SpotifyUpdateData = {
  listened_at: number;
  track_id: number;
  album_id: number;
  albums: {
    spotify_id: string;
  }
}

export async function setupSpotifyClient(): Promise<Client> {
  const token = process.env.SP_REFRESH;
  if (!token) throw new Error("Missing Spotify API token");
  const client = await Client.create({
    refreshToken: true,
    token: {
      clientID: process.env.SP_CID as string,
      clientSecret: process.env.SP_SECRET as string,
      refreshToken: token,
    },
    onRefresh: () => {
      console.log(
        `Token has been refreshed. New token: ${token}!`
      );
    },
  });
  return client;
}

async function getSpotifyAlbumData(ids: string[], token: string): Promise<any> {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('IDs must be a non-empty array of strings.');
  }

  const url = `https://api.spotify.com/v1/albums?ids=${encodeURIComponent(ids.join(','))}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${String(token)}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.albums ? data.albums : []; // Return the data for further use
  } catch (error) {
    console.error('Error fetching albums:', error);
    throw error; // Re-throw the error for external handling
  }
};

async function getAlbumPopularity(ids: string[]): Promise<Map<string, number>> {
  const albumLimit = 20;
  const token: string | undefined = process.env.SP_REFRESH;
  const ret: Map<string, number> = new Map<string, number>();
  let remaining = ids.length;
  let albumSpotifyIdList: string[] = [];

  let beginIdx: number = 0;
  let endIdx: number = albumLimit > remaining ? remaining : albumLimit;

  if (!token) throw new Error("Missing Spotify API token");
  if (!ids || ids.length == 0) throw Error("No items in the playlist");


  while (remaining) {

    let tmpAlbums: any[] = await getSpotifyAlbumData(albumSpotifyIdList.slice(beginIdx, endIdx), token);
    //let tmpAlbums : any[] = await this.client.albums.getMultiple(albumSpotifyIdList.slice(beginIdx, endIdx));
    tmpAlbums.forEach((album) => {
      ret.set(album.id, album.popularity);
    });
    remaining -= tmpAlbums.length;
    beginIdx = ret.size;
    endIdx = remaining > albumLimit ? beginIdx + albumLimit : remaining + beginIdx;
  }
  return ret
}

async function updateSpotifyAlbumPopularity() {
  const spotifyClient: Client = await setupSpotifyClient();
  updateSpotifyAlbumPopularityHelper(spotifyClient.token, "prod", false, new Date(Date.now() - (1000 * 60 * 60 * 24)));

}

export async function updateSpotifyAlbumPopularityHelper(token: string, schema: string, internal: boolean, beginAt?: Date, data?: any) {
  if (!(process.env.SB_URL || process.env.SB_URL_TEST) || !process.env.SERVICE) throw new Error("Missing Supabase URL or Service Role Key");
  const sbUrl = internal ? process.env.SB_URL_TEST : process.env.SB_URL;
  const serviceRoleKey = process.env.SERVICE;
  let spotifyIDs: string[] = [];
  if (!sbUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or Service Role Key");
  }

  const sbClient = new SupabaseClient(sbUrl, serviceRoleKey, { db: { schema: schema } });

  let query  = sbClient.schema("prod").from("played_tracks").select(`
    listened_at, track_id, album_id,
    tracks ( spotify_id, track_name, track_artists, track_duration_ms),
    albums (spotify_id) 
    )
  `)
  if (beginAt) query = query.gte("listened_at", beginAt.valueOf());
  
  const { data: dbData, error } = data ? await query : {data: data};
  
  if (error) throw error;
  for (const entry of dbData) {
    const typedEntry = entry as unknown as SpotifyUpdateData;
    
  }

}
