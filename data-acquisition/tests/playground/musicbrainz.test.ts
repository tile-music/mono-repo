import { MusicBrainzApi } from "musicbrainz-api";

const config = {
  appName: 'collage-gen',
  appVersion: "0.0.0",
  appContactInfo: "ivybixler@gmail.com", 
};

const mbAPI = new MusicBrainzApi(config);

describe("musicbrainz Playground", async () => {

  console.log(await mbAPI.lookup("recording", {isrcs: "USXXX930483"}))

});