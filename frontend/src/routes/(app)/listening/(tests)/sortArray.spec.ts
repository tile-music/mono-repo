import { sortArray, order, listeningDataFilter } from "../filters.svelte";


describe("sortArray helper function tests", () => {
  test("test sortArray", () => {
    console.log(`
      before to sort: ${Object.keys(listeningDataFilter)}
      sorted: ${order}
      after: ${sortArray(order, Object.keys(listeningDataFilter), Object.keys(listeningDataFilter))}`)
    expect(sortArray(order, Object.keys(listeningDataFilter), Object.keys(listeningDataFilter))).toBeCloseTo(4)
  })
})