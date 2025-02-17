import type { ListeningDataSongInfo } from "../../../../../../lib/Song";

describe("sortArray helper function tests", () => {
  const dataIn : ListeningDataSongInfo[] = 
    [
      {isrc: "AUNV02100106",
      title: "b2b heartbeat",
      artists: ["Donatachi", "Cowgirl Clue"],
      duration: 194705,
      listened_at: 1739723482198,
      spotify_id: "74qfodwGiiGoz3CxLN8xNc",
      albums: [
        {
          title: "donatachi.com",
          tracks: 9,
          release_day: 20,
          release_month: 4,
          release_year: 2022,
          artists: ["Donatachi"],
          image: "https://i.scdn.co/image/ab67616d0000b273f75f2af7c5d712a0b577a1d6",
          upc: "196626743671",
          spotify_id: "6el22aECvoCeHsv4oTDk9B"
        }
      ],
      is_child: false,
      has_children: false,
      is_parent: true,
      inserted: false,
      size: 1,
      show_children: false},
      {
        isrc: "AUNV02100106",
        title: "b2b heartbeat",
        artists: ["Donatachi", "Cowgirl Clue"],
        duration: 194705,
        listened_at: 1739723270107,
        spotify_id: "74qfodwGiiGoz3CxLN8xNc",
        albums: [
          {
            title: "donatachi.com",
            tracks: 9,
            release_day: 20,
            release_month: 4,
            release_year: 2022,
            artists: ["Donatachi"],
            image: "",
            upc: "196626743671",
            spotify_id: "6el22aECvoCeHsv4oTDk9B"
          }
        ],
        is_child: false,
        has_children: false,
        is_parent: false,
        inserted: false,
        size: 0
      } 
    ]
  const dataOut = {
    isrc: "AUNV02100106",
    title: "b2b heartbeat",
    artists: ["Donatachi", "Cowgirl Clue"],
    duration: 194705,
    listened_at: 1739723482198,
    spotify_id: "74qfodwGiiGoz3CxLN8xNc",
    albums: [
      {
        title: "donatachi.com",
        tracks: 9,
        release_day: 20,
        release_month: 4,
        release_year: 2022,
        artists: ["Donatachi"],
        image: "https://i.scdn.co/image/ab67616d0000b273f75f2af7c5d712a0b577a1d6",
        upc: "196626743671",
        spotify_id: "6el22aECvoCeHsv4oTDk9B"
      }
    ],
    is_child: false,
    has_children: false,
    is_parent: true,
    inserted: false,
    size: 1,
    show_children: false,
    child: {
      isrc: "AUNV02100106",
      title: "b2b heartbeat",
      artists: ["Donatachi", "Cowgirl Clue"],
      duration: 194705,
      listened_at: 1739723270107,
      spotify_id: "74qfodwGiiGoz3CxLN8xNc",
      albums: [
        {
          title: "donatachi.com",
          tracks: 9,
          release_day: 20,
          release_month: 4,
          release_year: 2022,
          artists: ["Donatachi"],
          image: "",
          upc: "196626743671",
          spotify_id: "6el22aECvoCeHsv4oTDk9B"
        }
      ],
      is_child: true,
      has_children: false,
      is_parent: false,
      inserted: false,
      size: 0
    }
  };

  
  test("test sortArray", () => {
    console.log(`
      before to sort: ${Object.keys(listeningDataFilter)}
      sorted: ${order}
      after: ${sortArray(order, Object.keys(listeningDataFilter), Object.keys(listeningDataFilter))}`)
    expect(sortArray(order, Object.keys(listeningDataFilter), Object.keys(listeningDataFilter))).toBeCloseTo(4)
  })
})