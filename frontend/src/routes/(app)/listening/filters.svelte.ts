import type { ListeningDataRequest, ListeningColumns, ListeningColumnKeys} from "../../../../../lib/Request";
import { assertListeningColumns } from "../../../../../lib/Request";
export const order = ["art", "title", "artist", "album", "duration", 
                    "plays", "listened_at", "upc", "isrc", "spotify_track_id", "spotify_album_id"];
export const listeningColumns: ListeningColumns = $state<ListeningColumns>({
    listened_at: { column: {start:null, end: null }, order: "desc"},
    title: { column: [], order: ""},
    album: { column: [], order: ""},
    artist: { column: [], order: ""},
    duration: { column: {start: null, end: null}, order: ""},
    listens: { column: [], order: ""},
    upc: null,
    spotify_track_id: null,
    spotify_album_id: null,
    isrc: null
} as ListeningColumns)

/**
 * Sorts an array (`unsortedArrToSort`) based on the order of elements in another array (`sortedArr`).
 * 
 * @param sortedArr - An array of strings that defines the desired order.
 * @param unsortedArr - An array of strings that contains the elements to be sorted.
 * @param unsortedArrToSort - An array of strings that will be sorted according to the order defined by `sortedArr`.
 * 
 * @returns A new array containing the elements of `unsortedArrToSort` sorted according to the order defined by `sortedArr`.
 * 
 * source: https://stackoverflow.com/questions/13304543/sort-a-javascript-array-based-on-another-array
 */
export function sortArray(sortedArr : string[], unsortedArr: string[], unsortedArrToSort: string[]){

    let holderArr = []
    let invertedIndex : any = {}
    // initialize
    unsortedArr.forEach((e)=>invertedIndex[e] = {indices:[],index:0})
    // create inverted index to save time
    unsortedArr.forEach((e,i)=>invertedIndex[e]['indices'].push(i))

    for(let sortValue of sortedArr){

        let currIndex = invertedIndex?.[sortValue]?.['index']

        let searchedIndex = invertedIndex?.[sortValue]?.['indices']?.[currIndex]

        if(searchedIndex===undefined)
        continue

        holderArr.push(unsortedArrToSort[searchedIndex])

        invertedIndex[sortValue]['index']+=1
    }

    return holderArr

}
const filterColumnLists : ListeningColumnKeys[] = $derived.by(()=> {
    let keys : ListeningColumnKeys[] = Object.keys(listeningColumns) as ListeningColumnKeys[];
    console.log(keys)
    console.log({...listeningColumns})
    keys = sortArray(order, keys, keys) as ListeningColumnKeys[];
    return keys.filter(column => listeningColumns[column] !== null)
});

export const filterColumnList = () => filterColumnLists


/* export const listeningColumns: ListeningColumns = $state({
    listened_at: { date:{start:null, end: null }, order: "dsc"},
    songs: { column: [], order: ""},
    albums: { column: [], order: ""},
    artists: { column: [], order: ""},
    duration: { start: null, end: null, order: ""},
    upcs: { column: [], order: ""},
    spotify_track_uri: { column: [], order: ""},
    spotify_album_uri: { column: [], order: ""},
    isrcs: { column: [], order: ""},
    listens: { column: [], order: ""}
}) */