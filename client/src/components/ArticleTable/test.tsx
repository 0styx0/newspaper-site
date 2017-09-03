import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import * as casual from 'casual';
import ArticleLink from './Link';
import snapData from './__snapshots__/props.example';

describe('<ArticleLink>', () => {

    describe('snapshots', () => {

        it('renders correctly when url does NOT need to be decoded for viewing', () => {

            const tree = renderer.create(
                <MemoryRouter>
                    <ArticleLink url={snapData.oneWord.url} issue={snapData.oneWord.issue} />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('renders correctly when url DOES need to be decoded for viewing', () => {

            const tree = renderer.create(
                <MemoryRouter>
                    <ArticleLink url={snapData.urlEncoded.url} issue={snapData.urlEncoded.issue} />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });
});
