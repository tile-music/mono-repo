import type {
    ListeningDataRequest,
    ListeningColumnKeys,
    ListeningColumns,
} from "$shared/Request";

export const order = [
    "art",
    "title",
    "artist",
    "album",
    "duration",
    "plays",
    "listened_at",
    "upc",
    "isrc",
    "spotify_track_id",
    "spotify_album_id",
];

export const listeningDataFilter: ListeningColumns = $state<ListeningColumns>({
    listened_at: {
        column: { start: null, end: null },
        order: "desc",
        checked: true,
    },
    title: { column: [], order: "", checked: true },
    album: { column: [], order: "", checked: true },
    artist: { column: [], order: "", checked: true },
    duration: { column: { start: null, end: null }, order: "", checked: true },
    upc: { column: [], order: "", checked: false },
    spotify_track_id: { column: [], order: "", checked: false },
    spotify_album_id: { column: [], order: "", checked: false },
    isrc: { column: [], order: "", checked: false },
});

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
export function sortArray(
    sortedArr: string[],
    unsortedArr: string[],
    unsortedArrToSort: string[],
) {
    let holderArr = [];
    let invertedIndex: any = {};
    // initialize
    unsortedArr.forEach((e) => (invertedIndex[e] = { indices: [], index: 0 }));
    // create inverted index to save time
    unsortedArr.forEach((e, i) => invertedIndex[e]["indices"].push(i));

    for (let sortValue of sortedArr) {
        let currIndex = invertedIndex?.[sortValue]?.["index"];

        let searchedIndex =
            invertedIndex?.[sortValue]?.["indices"]?.[currIndex];

        if (searchedIndex === undefined) continue;

        holderArr.push(unsortedArrToSort[searchedIndex]);

        invertedIndex[sortValue]["index"] += 1;
    }
    return holderArr;
}

/**
 * A derived store that computes a filtered list of `ListeningColumnKeys` based on the `listeningDataFilter` object.
 *
 * This store performs the following operations:
 * 1. Retrieves the keys from `listeningDataFilter` and casts them to `ListeningColumnKeys[]`.
 * 2. Logs the keys and the `listeningDataFilter` object to the console.
 * 3. Sorts the keys using the `sortArray` function with the provided `order`.
 * 4. Filters the keys to include only those where the corresponding `listeningDataFilter` entry has `checked` set to `true`.
 *
 * @returns {ListeningColumnKeys[]} An array of filtered and sorted `ListeningColumnKeys`.
 */
const filterColumnLists: ListeningColumnKeys[] = $derived.by(() => {
    let keys: ListeningColumnKeys[] = Object.keys(
        listeningDataFilter,
    ) as ListeningColumnKeys[];
    console.log(keys);
    console.log({ ...listeningDataFilter });
    keys = sortArray(order, keys, keys) as ListeningColumnKeys[];
    return keys.filter(
        (column) => listeningDataFilter[column].checked === true,
    );
});

export const filterColumnList = () => filterColumnLists;
