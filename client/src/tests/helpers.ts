
/** @author https://stackoverflow.com/a/1527820/6140527 */
export const generateRandomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** @author https://stackoverflow.com/a/38622545/6140527 */
export const generateRandomStr = (length: number) => (Math.random() + 1).toString(36).substr(2, length);

