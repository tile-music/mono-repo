import type {ListeningDataRequest} from '../../../../../../lib/Request';
import { assertListeningColumns } from '../../../../../../lib/Request';

export const listeningDataRequest: ListeningDataRequest = {
    listened_at: {column :{start: null, end: null}, order:""},
    title: {column: [], order: ""},
    album: {column: [], order: ""},
    artist: {column: [], order: ""},
    duration: { column: {start: null, end: null}, order: ""},
    upc: {column: [], order: ""},
    spotify_track_id: {column: [], order: ""},
    spotify_album_id: {column: [], order: ""},
    isrc: {column: [], order: ""},
    listens: {column: [], order: ""}
}

describe("test ListeningDateRequest validation", (() => {
  test("validate listening request", () => {
    expect(() => assertListeningColumns(listeningDataRequest)).not.toThrow();
  })
  test("bad listening request", ()=> {
    const badRequest = {...listeningDataRequest} 
    delete badRequest.listened_at;
    console.log(badRequest)
    expect(() => assertListeningColumns(badRequest)).toThrow();
  })
  test("validate listening request with null", ()=>{
    const nullRequest = {...listeningDataRequest}
    nullRequest.listened_at = null;
    nullRequest.title = null;
    nullRequest.album = null;
    nullRequest.artist = null;
    nullRequest.duration = null;
    nullRequest.upc = null;
    nullRequest.spotify_track_id = null;
    nullRequest.spotify_album_id = null;
    nullRequest.isrc = null;
    console.log(nullRequest)  
    expect(() => assertListeningColumns(nullRequest)).not.toThrow();
  })
  test("validate listening request with order", ()=>{
    const orderRequest = {...listeningDataRequest}
    if (orderRequest.listened_at) orderRequest.listened_at.order = "asc";
    
    console.log(orderRequest)
    expect(() => assertListeningColumns(orderRequest)).not.toThrow();
    orderRequest.listened_at.order = "desc";
  })
}))