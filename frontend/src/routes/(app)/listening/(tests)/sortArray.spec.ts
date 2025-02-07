import { sortArray, order, listeningColumns } from "../filters.svelte";


describe("sortArray helper function tests", () => {
  test("test sortArray", () => {
    console.log(`
      before to sort: ${Object.keys(listeningColumns)}
      sorted: ${order}
      after: ${sortArray(order, Object.keys(listeningColumns), Object.keys(listeningColumns))}`)
    expect(sortArray(order, Object.keys(listeningColumns), Object.keys(listeningColumns))).toBeCloseTo(4)
  })
})