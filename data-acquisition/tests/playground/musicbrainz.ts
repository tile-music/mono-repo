import { MusicBrainzApi } from "musicbrainz-api";

const config = {
  appName: 'collage-gen',
  appVersion: "0.0.0",
  appContactInfo: "ivybixler@gmail.com", 
};

const mbAPI = new MusicBrainzApi(config);
async function run(){

  console.log(await mbAPI.lookupUrl('https://open.spotify.com/track/2AMysGXOe0zzZJMtH3Nizb'));
}
run();

