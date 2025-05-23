import { Client, SupabaseClient} from "../../deps.ts";

import "jsr:@std/dotenv/load";

export type SpotifyUpdateData = {
  play_id: number;
  listened_at: number;
  track_id: number;
  album_id: number;
  track_popularity: number;
  album_popularity: number;
  albums: {
    spotify_id: string;
    ean: string;
    upc: string;
  }
  tracks: {
    spotify_id: string;
  }
}


export const selectString = `
play_id, listened_at, track_id, album_id, track_popularity, album_popularity,
albums (spotify_id, ean, upc),
tracks (spotify_id)`;

/** doing it this way because the js api wrapper does not provide popularity */
/**
 * Represents a Spotify album with its popularity, unique identifier, and external IDs.
 * 
 * @property {number} popularity - The popularity of the album.
 * @property {string} id - The unique identifier for the album.
 * @property {Object} external_ids - The external identifiers for the album.
 * @property {string} external_ids.ean - The EAN (European Article Number) of the album.
 * @property {string} external_ids.upc - The UPC (Universal Product Code) of the album.
 */
type SpotifyAlbum = { popularity: number, id: string, external_ids: { ean: string, upc: string } }

/**
 * Represents a Spotify track with additional album information.
 * 
 * This type extends the `SpotifyAlbum` type and includes an `album` property
 * with an `id` field to uniquely identify the album.
 * 
 * @extends SpotifyAlbum
 * 
 * @property {Object} album - The album information.
 * @property {string} album.id - The unique identifier for the album.
 */
type SpotifyTrack = SpotifyAlbum & { album: { id: string } };

type SpotifyAlbums = { albums: SpotifyAlbum[] };
type SpotifyTracks = { tracks: SpotifyTrack[] };

/** this is so we can pass a "callback🕵️‍♀️" */
type spotifyDataFn = (ids: string[], token: string) => Promise<SpotifyAlbum[] | SpotifyTrack[]>;
 

async function setupSpotifyClient(): Promise<Client> {
  const token = Deno.env.get("SP_REFRESH");

  if (!token) throw new Error("FATAL: Missing Spotify API token");
  const client = await Client.create({
    refreshToken: true,
    token: {
      clientID: Deno.env.get("SP_CID")!,
      clientSecret: Deno.env.get("SP_SECRET")!,
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

/**
 * Fetches data from the Spotify API for the specified data type (albums or tracks) and IDs.
 * Handles retries for token expiration, rate limiting, and other errors.
 *
 * @param dataType - The type of data to fetch, either "albums" or "tracks".
 * @param ids - An array of Spotify IDs to fetch data for.
 * @param token - The Spotify API token for authorization.
 * @param retries - The number of retry attempts made so far (default is 0).
 * @returns A promise that resolves to an array of SpotifyAlbum or SpotifyTrack objects, or void if an error occurs.
 * @throws Will throw an error if the IDs array is empty or not an array, or if the maximum number of retries is exceeded.
 */
async function getSpotifyData(dataType: "albums" | "tracks", ids: string[], token: string, retries: number = 0): Promise<void | SpotifyAlbum[] | SpotifyTrack[]> {
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('FATAL: IDs must be a non-empty array of strings.');
  }
  const url = `https://api.spotify.com/v1/${dataType}?ids=${encodeURIComponent(ids.join(','))}`;
  //console.log("url: ", url);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${String(token)}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (retries <= 5) {
        switch (response.status) {
          case 401: {
            console.error(`WARNING: Token expired, refreshing token
              THIS SHOULD NEVER EVER HAPPEN, IN THEORY,
              the spotify js lib should automatically update the token
              retrying once
              Token: ${token}
              Retries: ${retries}
              URL: ${url}
              `);
            /** we should probably just throw and gtfo */
            const client = await setupSpotifyClient();
            return getSpotifyData(dataType, ids, client.token, retries + 5);
          }
          case 404:
            throw new Error(`Resource not found, ${dataType} URL: ${url} IDS: ${ids.entries}`);
          case 429: {
            console.error("WARNING: Rate limit exceeded");
            const retryAfterHeader = response.headers?.get("Retry-After");
            const retryAfter: number | null = retryAfterHeader ? parseInt(retryAfterHeader) : 0;
            console.log(`  Retrying after ${retryAfter} seconds`);
            await sleep(retryAfter * 1000);
            return getSpotifyData(dataType, ids, token, retries + 1);
          }
          default:
            throw new Error(`FATAL: Error fetching data, ${response.status} ${response.statusText}`);
        }
      } else throw new Error(`FATAL: Retried ${retries} times, giving up Data Type: ${dataType} IDs: ${ids}`);
    }

    const data = await response.json();
    if (!data[dataType]) throw new Error(`FATAL, Incorrect or Missing data ${data}`)
    return data[dataType] ? data[dataType] : []; // Return the data for further use
  } catch (error) {
    console.error(`Spotify Album Information update failed with fatal error: ${error}`);
    return;
  }
}

/**
 * Fetches album data from Spotify for the given album IDs.
 * @implements spotifyDataFn
 * @param ids - An array of Spotify album IDs to fetch data for.
 * @param token - The authentication token to access the Spotify API.
 * @returns A promise that resolves to an array of SpotifyAlbum objects.
 */
const getSpotifyAlbumData: spotifyDataFn = async (ids: string[], token: string): Promise<SpotifyAlbum[]> => {
  const albums: SpotifyAlbum[] = await getSpotifyData("albums", ids, token) as SpotifyAlbum[] ?? [];
  return albums;
};

/**
 * Yeah bitch i wrote these using co-pilot suck my fucking cock 🍆
 * not so much the code but the comments lul
 * 
 * Fetches Spotify track data for the given track IDs.
 * @implements spotifyDataFn
 * @param ids - An array of Spotify track IDs.
 * @param token - The Spotify API access token.
 * @returns A promise that resolves to an array of SpotifyTrack objects.
 */
const getSpotifyTrackData: spotifyDataFn = async (ids: string[], token: string): Promise<SpotifyTrack[]> => {
  const tracks: SpotifyTrack[] = await getSpotifyData("tracks", ids, token) as SpotifyTrack[] ?? [];
  return tracks;
}

export async function getPopularity(ids: Map<string, SpotifyUpdateData>, functionPtr: spotifyDataFn): Promise<void> {
  const limit = 20;
  const token: string | undefined = await setupSpotifyClient().then(client => client.token);
  let updated: number = 0;
  let spotifyIdList: string[] = Array.from(ids.keys());
  /**  */
  spotifyIdList = spotifyIdList.filter((id) => typeof id === 'string' && id.length > 0 );
  let remaining = spotifyIdList.length;
  let beginIdx: number = 0;
  let endIdx: number = limit > remaining ? remaining : limit;

  if (!token) throw new Error("Missing Spotify API token");
  if (!spotifyIdList || spotifyIdList.length == 0) throw Error("No items in the playlist");

  //console.log(`spotify ids len: ${spotifyIdList.length}`);
  while (remaining) {
    //console.log(`beginIdx: ${beginIdx}, endIdx: ${endIdx}, remaining: ${remaining}`);

    const tmp: SpotifyAlbum[] | SpotifyTrack[] = await functionPtr(spotifyIdList.slice(beginIdx, endIdx), token);

    //console.log(`tmpAlbums: ${tmp.length}`);
    /** e is either a spotifyAlbum or Spotify track 
     *  if the entry does not have an album property it is a track so we update the map with the correct album id
     *  if the entry does have an album property we update the map with the album id and the corresponding popularity
    */
    for (const e of tmp) {
      try {
        //console.log("album: ", album.id);
        const data = ids.get(e.id)
        if ('id' in e && 'popularity' in e && !('album' in e)) {
          if (data) {
            data.album_popularity = e.popularity;
            data.albums.spotify_id = e.id;
            data.albums.ean = e.external_ids.ean;
            data.albums.upc = e.external_ids.upc;
            //console.log(data)
            ids.set(e.id, data);
          } else {
            throw Error(`WARNING: THIS SHOULD ALSO NEVER HAPPEN 
                        no album found with e: ${e}`);
          }
        } else if ('id' in e && 'popularity' in e && 'album' in e) {
          if (data) {
            data.albums.spotify_id = e.album.id;
            ids.set(e.album.id, data);
          } else {
            throw Error(`WARNING: THIS SHOULD ALSO NEVER HAPPEN 
                        no album found with e: ${e}`);
          }
        } else {
          throw Error(`WARNING: No popularity found for element e: ${e}`);
        }
      } catch (error) {
        console.error("error:", error);
        continue;
      } finally {
        updated += 1;
      }

    };
    remaining -= tmp.length;
    beginIdx = updated;
    endIdx = remaining > limit ? beginIdx + limit : remaining + beginIdx;
  }
  if (updated !== spotifyIdList.length) throw new Error(`FATAL: Updated ${updated} items, expected ${spotifyIdList.length}`);
}

/**
 * Updates the popularity of Spotify albums.
 * 
 * This function sets up a Spotify client, determines the schema (test or prod) based on environment variables,
 * checks if the operation is internal, and then calls a helper function to update the album popularity.
 * 
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
export async function updateSpotifyAlbumPopularity() {
  const spotifyClient: Client = await setupSpotifyClient();
  const schema: "test" | "prod" = Deno.env.get("SB_SCHEMA") === "test" ? "test" : "prod";
  const internal: boolean = Deno.env.get("INTERNAL") === "true";
  await updateSpotifyAlbumPopularityHelper(spotifyClient.token, schema, internal, new Date(Date.now().valueOf() - (1000 * 60 * 60 * 24)));

}

/**
 * Updates the popularity of Spotify albums in the database.
 *
 * @param {string} token - The authentication token for Spotify API.
 * @param {"test" | "prod"} schema - The schema to use in the database, either "test" or "prod".
 * @param {boolean} internal - Flag to determine whether to use internal or external Supabase URL.
 * @param {Date} [beginAt] - Optional date to filter tracks listened at or after this date.
 * @param {SpotifyUpdateData[]} [data] - Optional data to use instead of querying the database, for testing.
 * @returns {Promise<Map<string, SpotifyUpdateData>>} - A promise that resolves to a map of Spotify album data.
 * @throws {Error} - Throws an error if Supabase URL or Service Role Key is missing.
 */
export async function updateSpotifyAlbumPopularityHelper(token: string, schema: "test" | "prod", internal: boolean, beginAt?: Date, data?: SpotifyUpdateData[]): 
Promise<Map<string, SpotifyUpdateData>> {
  if (!(Deno.env.get("SB_URL") || Deno.env.get("SB_URL_TEST")) || !Deno.env.get("SERVICE")) throw new Error("Missing Supabase URL or Service Role Key");
  const sbUrl = internal ? Deno.env.get("SB_URL") : Deno.env.get("SB_URL_TEST");
  const serviceRoleKey = Deno.env.get("SERVICE");
  const albumMap: Map<string, SpotifyUpdateData> = new Map();
  const trackMap: Map<string, SpotifyUpdateData> = new Map();

  if (!sbUrl || !serviceRoleKey) {
    throw new Error(" Missing Supabase URL or Service Role Key");
  }

  const sbClient = new SupabaseClient(sbUrl, serviceRoleKey, { db: { schema: schema } });

  let query = sbClient.schema(schema).from("played_tracks").select(selectString);
  if (beginAt) query = query.gte("listened_at", beginAt.valueOf());

  const { data: dbData, error } = data ? { data: data, error: null } : await query;
  if (error) console.log(error)

  if (error) throw error;
  
  for (const [_, entry] of dbData.entries()) {
    const typedEntry = entry as unknown as SpotifyUpdateData;
    if (!typedEntry.albums.spotify_id){
      console.error(`WARNING: No spotify id found for entry
                    seeing this a lot probably means problem
                    updating the spotify track id: ${typedEntry.track_id}`);
      if(typedEntry.tracks.spotify_id) trackMap.set(typedEntry.tracks.spotify_id, typedEntry);
    } else {
      albumMap.set(typedEntry.albums.spotify_id, typedEntry);
    }
  }
  console.log(`trackMap: ${trackMap.size}, albumMap: ${albumMap.size}`);
  /** this might could be a reference so it might not actually matter 
   * tldr: i was right and it is in-fact pbr baby
  */
  if(trackMap.size > 0){
    await getPopularity(trackMap, getSpotifyTrackData);
    for(const [_, value] of trackMap.entries()){
      if(value.albums.spotify_id) albumMap.set(value.albums.spotify_id, value);
      else console.error(`WARNING: No album id found for track: ${value}`);
    }
  } 
  await getPopularity(albumMap, getSpotifyAlbumData);

  for (const [_, value] of albumMap.entries()) {
    try {
      let query = sbClient.schema(schema).from("played_tracks").update({ album_popularity: value.album_popularity, album_popularity_updated_at: Date.now() }).eq("album_id", value.album_id);
      if(beginAt) query = query.gte("listened_at", beginAt.valueOf());
      const { error } = await query;
      const { error: albumInsertError } = await sbClient.schema(schema).from("albums").update(value.albums).eq("album_id", value.album_id);
      /** postgrest gets mad if you try to update something that is already updated */
      if (albumInsertError && albumInsertError?.code !== "23505") throw albumInsertError;
      if (error) throw error

    } catch (error) {
      console.error("Error updating Spotify album popularity:", error);
    }
  }
  return albumMap;
}