// Type alias for a string that is shaped like an MBID (UUID)
type MBID = `${string}-${string}-${string}-${string}-${string}`;
// /**
//  * Asserts that a string is a valid MBID (UUID v4).
//  * Throws an error if the string is not a valid MBID.
//  */
// export function assertMBID(value: string): asserts value is MBID {
//   const mbidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
//   if (!mbidRegex.test(value)) {
//     throw new Error(`Invalid MBID: ${value}`);
//   }
// }
// Example generic type where MBID is the key
type MBIDMap<T> = {
  [key in MBID]?: T;
};
