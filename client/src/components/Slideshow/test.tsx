import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import Slideshow from './';
import { Image } from './';
import casual from '../../tests/casual.data';
import { setupComponent } from '../../tests/enzyme.helpers';

import { mount } from 'enzyme';


casual.define('images', () => {

   let amount = casual.randomPositive;
   const images: Image[] = [];

   while (amount-- > 0) {
       images.push({
           url: casual.url,
           img: casual.url
       });
   }

   return images;
});

type CustomCasual = typeof casual & {images: Image[]};
const customCasual = casual as CustomCasual;

describe('<Slideshow>', () => {

    function setup(images: Image[]) {

        return mount(
            <MemoryRouter>
                <Slideshow images={images} />
            </MemoryRouter>
        );
    }

    describe('snapshots', () => {

        function snap(images: Image[]) {

            const tree = renderer.create(
                <MemoryRouter>
                    <Slideshow images={images} />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        it('renders correctly', () => {

            snap([{
                    url: 'test',
                    img: 'hello.png'
                }]);
        });
    });

    describe('#switchActiveImage', () => {

        it('switches to next image', () => {

            const images = customCasual.images;

            const wrapper = setup(images);
            const component = setupComponent(wrapper, Slideshow);

            expect(component.state.activeImg).toBe(0);

            component.switchActiveImg();

            expect(component.state.activeImg).toBe(1);
        });

        it('loops back to first img', () => {

            const images = customCasual.images;
            const wrapper = setup(images);
            const component = setupComponent(wrapper, Slideshow);

            component.state.activeImg = images.length - 1;

            component.switchActiveImg();

            expect(component.state.activeImg).toBe(0);
        });
    });
});
