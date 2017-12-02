/**
 * @author https://github.com/lukerollans
 * https://github.com/facebook/jest/issues/4545
 */
// tslint:disable-next-line:no-any
const raf = (global as any).requestAnimationFrame = (cb: Function) => {
  setTimeout(cb, 0);
};

export default raf;
