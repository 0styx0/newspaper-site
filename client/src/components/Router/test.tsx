import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import RouterContainer from './container';
import localStorageMock from '../../tests/localstorage.mock';
import { renderWithGraphql } from '../../tests/snapshot.helper';
import mockGraphql, { createMutation, mountWithGraphql } from '../../tests/graphql.helper'; 
import mainPageSnapData from '../../Pages/MainPage/__snapshots__/issue.example';
import { ArticlePreviewIssueQuery, ArticlePreviewTagQuery } from '../../graphql/articles';
import { IssueInfoQuery } from '../../graphql/issues';
import issueData from '../../Pages/MainPage/__snapshots__/issue.example';
import customCasual from '../../tests/casual.data';
import setFakeJwt from '../../tests/jwt.helper';

describe('<RouterContainer>', () => {

    describe('snapshots', () => {

        async function snap() {

            await renderWithGraphql(
                mockGraphql(
                    [
                        createMutation(ArticlePreviewIssueQuery, { issue: '' }, { issues: [mainPageSnapData] })
                        createMutation(IssueInfoQuery, { num: 0 }, { issues: [issueData] })
                    ],
                    <RouterContainer />
                )
            );
        }

        test('when not logged in, renders only public paths', async () => {

            localStorageMock.clear();
            await snap();
        });

        test('when logged in, renders all paths', async () => {
            setFakeJwt({ level: 3 });
            await snap();
        });
    });

    test(`when not logged in and try to access private path, can't`, async () => {

        localStorageMock.clear();
        const wrapper = await mountWithGraphql(
            [
                createMutation(ArticlePreviewIssueQuery, { issue: '' }, { issues: [mainPageSnapData] })
                createMutation(IssueInfoQuery, { num: 0 }, { issues: [issueData] })
            ],
            <RouterContainer />
            );

        expect(wrapper.find('Link[to="/publish"]')).toHaveLength(0);
    });
});
