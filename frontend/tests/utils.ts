/**
 * Generates a random string of the desired length and complexity. For lowercase alpha
 * characters, include `a` in `chars`. For uppercase alpha, numbers, and special characters,
 * include `A`, `#`, and `!` respectively.
 * 
 * https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
 * 
 * @param length The length of the desired string
 * @param chars The character types desired in the string
 * @returns 
 */
export function randomString(length: number, chars: string) {
    let mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    let result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}