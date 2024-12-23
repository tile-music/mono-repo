/**
 * Represents a request for user data within a specified time window.
 * 
 * @property {number | null} beginWindow - The start of the time window in unix time. Can be null if not specified.
 * @property {number | null} endWindow - The end of the time window in unix time. Can be null if not specified.
 */
export type ListeningDataReqPerams = {
  beginWindow: number | null,
  endWindow: number | null
}