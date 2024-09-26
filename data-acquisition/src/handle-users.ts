import { AlbumInfo } from "./AlbumInfo";
import { TrackInfo } from "./TrackInfo";
import { Client, Player } from "spotify-api.js";
import * as database from "./database";
import dotenv from "dotenv";
import { TimeData } from "./TimeData";
import { time } from "console";
dotenv.config();
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * This type represents the data that is being played on spotify and the users information
 */
export declare type Playing = {
  
  trackInfo: TrackInfo;
  timeData: TimeData;
};

export declare type PlayingSpotify = Playing & {
  client: Client;
  player: Player;
}

export declare type SpDbResponse = { id: string; refresh_token: string };

/**
 * This function converts the data from the spotify_credentials table to a map
 * @param data represents the data from the spotify_credentials table
 * @returns a map containing the data from the spotify_credentials table
 */
function convertToMap(data: any[]) {
  let map = new Map<string, { refresh_token: string }>();
  if(data.length === 0) {
    return map
  };
  for (let obj of data) {
    map.set(obj.id, { refresh_token: obj.refresh_token });
  }
  return map;
}
/**
 * This combines the gather users and convert to map function to create a map...
 * of users and their refresh tokens
 * @returns a map containing the data from the spotify_credentials table
 */
export async function gatherAndMapUsers(
  currentUsers: string[]
): Promise<Map<string, { refresh_token: string }>> {
  const { credsData, grabError } = await database.gatherSpotifyUsers();
  let credsDataArray: { id: string; refresh_token: string }[];
  let credsDataArrayCleaned: { id: string; refresh_token: string }[];
  if (credsData) {
    credsDataArray = credsData as SpDbResponse[];
    credsDataArrayCleaned = removeCurrentUsers(credsDataArray, currentUsers);
    console.log("newUUIDs", credsDataArrayCleaned);
    return convertToMap(credsDataArrayCleaned);
  }
  if (grabError) {
    console.log(grabError);
    console.log("Error grabbing data");
    return convertToMap([]);
  } else {
    console.log("No data");
    return convertToMap([]);
  
  }
}
/**
 * 
 * @param credsDataArray contains the data from the spotify_credentials table
 * @param currentUsers array representing the keys of the current users which is their...
 * unique id from supabase
 * @returns 
 * 
 * Todo, this is apt for a .filter, i was just in a rush, so maybe refactor this later
 */
function removeCurrentUsers(
  credsDataArray: SpDbResponse[],
  currentUsers: string[]
) {
  const noop = () => {
    console.log("no arrays");
  };
  let ret: SpDbResponse[] = [];
  for (let obj of credsDataArray) {
    if (currentUsers.includes(obj.id)){ 
      noop()
    } else {
      console.log("adding new user")
      ret.push(obj);
    }
  }
  return ret;
}

/**
 *
 * @param data represents the data from the spotify_credentials table in map form
 * @returns a map containing the user data and their spotify information including...
 * the client, player, and track info
 */
export async function buildUserMap(
  data: Map<string, { refresh_token: string }>
): Promise<Map<string, PlayingSpotify>> {
  let ret = new Map();
  for (let [key, value] of data) {
    const client = await Client.create({
      refreshToken: true,
      token: {
        clientID: process.env.SP_CID as string,
        clientSecret: process.env.SP_SECRET as string,
        refreshToken: value.refresh_token,
      },
      onRefresh() {
        console.log(`Token has been refreshed. New token: ${client.token}!`);
      },
    });

    const player = new Player(client);
    ret.set(key, {
      client: client,
      trackInfo: new TrackInfo(),
      player: player,
      timeData: new TimeData(),
    });
  }
  return ret;
}

/**
 * this function consumes the data from the spotify_credentials table and updates the...
 * user's playback information if it has been 3 seconds since the last update, if the
 * data is already in the database then it will not be added again
 * 
 * @param data represents the data from the spotify_credentials table in map form
 */

export async function updateUsersPlayback(data: Map<string, PlayingSpotify>) {
  console.log(data);

  for (let [key, value] of data) {
    if (!value.timeData.isTimeToUpdate()) {
      console.log("Not time to update");
      await delay(1000);
    } else {
      value.timeData.reset();
      console.log("Getting currently playing");
      const currPlaying = await value.player.getCurrentlyPlaying();
      console.log(currPlaying);
      if (currPlaying) value.trackInfo.updateTrackInfo(currPlaying);
    }
    if (value.trackInfo.isProgressSufficient() && !value.trackInfo.getInDB()) {
      console.log("!!!!!!!!is in db", value.trackInfo.getInDB());
      console.log(
        "put me in the db",
        await database.insertPlayed({
          user_id: key,
          ...value.trackInfo.createDbEntryObject(),
        })
      );
      value.trackInfo.setInDB(true);
      //console.log(value);
    } else
      if(value.trackInfo.getInDB()) console.log("already in db");
      else if (!value.trackInfo.isProgressSufficient()) console.log("progress insufficient");
    /* .then((res) => {
      console.log(res);
      if (res) {
        value.trackInfo.updateTrackInfo(res);
        console.log("res", res);
      } else console.log("No track playing");
    }); */
  }
}
