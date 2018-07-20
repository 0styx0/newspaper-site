// TODO: Remove this `raf` polyfill once the below issue is sorted
// https://github.com/facebookincubator/create-react-app/issues/3199#issuecomment-332842582
import './tempPolyfills';
import * as mocks from './tests/setup.mocks';

mocks.localStorage.clear(); // must use some part of mocks to get them to define their properties
mocks.document();

import { configure } from 'enzyme';

import * as Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
