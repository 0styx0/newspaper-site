

/**
 * Mocks window.localStorage for testing
 *
 * @author https://stackoverflow.com/a/13702187/6140527
 */
const localStorageMock = (function() {

  let store = {};

  return {

    getItem: (key: string) => store[key],
    setItem: (key: string, value: string) => store[key] = value,
    clear: () => store = {},
    removeItem: (key: string) => delete store[key]
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

export default localStorageMock;