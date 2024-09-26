import { SupabaseClient, createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import {Client, Player} from "spotify-api.js"
import {gatherAndMapUsers, buildUserMap,  updateUsersPlayback, Playing,PlayingSpotify, delay} from "./handle-users";
import { TimeData } from "./TimeData";
dotenv.config();



console.log(process.env.ANON);


/**
 * This function runs the entire program by gathering the users and their refresh tokens...
 * then updating the users and their playback information continuously for all users
 * if there are any new users, they are added to the map of users at a given time interval
 * 
 * TODO: Cleanup the code and add more comments
 */
async function run() {
  let timeToAcquire : TimeData = new TimeData();
  timeToAcquire.alterDelay(30000)
  let obj : Map<string, PlayingSpotify> | undefined
  let users = await gatherAndMapUsers([])
  let newUsers;
  if (users){
    obj = await buildUserMap(users)
  }
  while (true){
    if(timeToAcquire.isTimeToUpdate()) {
      const userIds = Array.from(obj!.keys())
      newUsers = await gatherAndMapUsers(userIds)
      if((newUsers).size > 0){
        let newObj = await buildUserMap(newUsers as Map<string, { refresh_token: string; }>)
        obj =  new Map([...obj!, ...newObj!])
      }
      timeToAcquire.reset()
    }
    if(obj) await updateUsersPlayback(obj)
    await delay(3000)
  }
}

run()
