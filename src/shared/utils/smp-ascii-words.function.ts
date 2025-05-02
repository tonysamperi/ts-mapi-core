/** Used to match words composed of alphanumeric characters. */
// eslint-disable-next-line no-control-regex
const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

export function smpAsciiWords(string: string): string[] | null {
    return string.match(reAsciiWord);
}
