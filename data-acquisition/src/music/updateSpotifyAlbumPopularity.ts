import { Client } from 'spotify-api.js';
import { SupabaseClient } from "@supabase/supabase-js";


import * as dotenv from "dotenv";

dotenv.config();

export type SpotifyUpdateData = {
  listened_at: number;
  track_id: number;
  album_id: number;
  track_popularity: number;
  album_popularity: number;
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

async function getAlbumPopularity(ids: Map<string, SpotifyUpdateData>): Promise<Map<string, SpotifyUpdateData>> {
  const albumLimit = 20;
  const token: string | undefined = process.env.SP_REFRESH;
  let updated: number =0; 
  let remaining = ids.size;
  let albumSpotifyIdList: string[] = Array.from(ids.keys());
  let beginIdx: number = 0;
  let endIdx: number = albumLimit > remaining ? remaining : albumLimit;

  if (!token) throw new Error("Missing Spotify API token");
  if (!albumSpotifyIdList || albumSpotifyIdList.length == 0) throw Error("No items in the playlist");


  while (remaining) {

    let tmpAlbums: any[] = await getSpotifyAlbumData(albumSpotifyIdList.slice(beginIdx, endIdx), token);
    //let tmpAlbums : any[] = await this.client.albums.getMultiple(albumSpotifyIdList.slice(beginIdx, endIdx));
    for (const album of tmpAlbums) {
      if (album.popularity) {
        let data = ids.get(album.id)
        if (data) {
          data.album_popularity = album.popularity;
          ids.set(album.id, data);
        }
      } else {
        throw Error("No popularity data found for album");
      }
      updated+=1;
      
    };
    remaining -= tmpAlbums.length;
    beginIdx = updated;
    endIdx = remaining > albumLimit ? beginIdx + albumLimit : remaining + beginIdx;
  }
  return ids;
}

async function updateSpotifyAlbumPopularity() {
  const spotifyClient: Client = await setupSpotifyClient();
  updateSpotifyAlbumPopularityHelper(spotifyClient.token, "prod", false, new Date(Date.now() - (1000 * 60 * 60 * 24)));

}

export async function updateSpotifyAlbumPopularityHelper(token: string, schema: string, internal: boolean, beginAt?: Date, data?: SpotifyUpdateData[]) : Map<string,SpotifyUpdateData> {
  if (!(process.env.SB_URL || process.env.SB_URL_TEST) || !process.env.SERVICE) throw new Error("Missing Supabase URL or Service Role Key");
  if (data && data.length == 0 || data == undefined) throw Error("No items in the playlist");
  const sbUrl = internal ? process.env.SB_URL : process.env.SB_URL_TEST;
  const serviceRoleKey = process.env.SERVICE;
  const map : Map<string,SpotifyUpdateData> = new Map(); 
  let spotifyIDs: string[] = [];
  if (!sbUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or Service Role Key");
  }

  const sbClient = new SupabaseClient(sbUrl, serviceRoleKey, { db: { schema: schema } });

  let query = sbClient.schema("prod").from("played_tracks").select(`
    listened_at, track_id, album_id, track_popularity, album_popularity,
    tracks ( spotify_id, track_name, track_artists, track_duration_ms),
    albums (spotify_id)
    )
  `)
  if (beginAt) query = query.gte("listened_at", beginAt.valueOf());
  
  const { data: dbData, error } = data ? await query : {data: data, error: null};
  
  if (error) throw error;
  for (const entry of dbData) {
    try{

      const typedEntry = entry as unknown as SpotifyUpdateData;
      console.log(typedEntry)
      map.set(typedEntry.albums.spotify_id, typedEntry);
      
    } catch (error) {
      console.error("Error updating Spotify album popularity:", error);
    }
  }

  return map;

}
