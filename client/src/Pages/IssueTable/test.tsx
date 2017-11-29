import * as React from 'react';
import { IssueTableContainer  } from './container';
import { MemoryRouter } from 'react-router';
import * as casual from 'casual';
import renderWithProps from '../../tests/snapshot.helper';
import snapData from './__snapshots__/issues.example';
import setFakeJwt from '../../tests/jwt.helper';
import { Issue } from './interface.shared';

import { mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';



// NOTE: unless explicitly said, all numbers except jwt.level are completely random (although all must be positive)


setFakeJwt({level: 1});

/**
 * Randomly generate issue data
 *
 * @param amount - how many issues to generate
 *
 * @return the issues
 */
casual.define('issues', function generateIssues(amount: number) {

    const issues: Issue[] = [];

    while (amount-- > 0) {

        issues.push({
            num: amount,
            name: casual.title,
            views: casual.integer(0, 1000),
            datePublished: (new Date).toISOString(),
            public: true,
            canEdit: true
        });
    }

    return issues;
});

const data = {
    loading: false,
    issues: (casual as any).issues(5) as Issue[]
};

function setup(mockGraphql: {mutate?: Function} = {}) {

    return mount(
        <MemoryRouter>
            <IssueTableContainer
                data={data}
                mutate={mockGraphql.mutate ? mockGraphql.mutate : (test: {}) => false}
            />
        </MemoryRouter>
    );
}

describe('<IssueTableContainer>', () => {

    let wrapper: any;

    beforeEach(() => {
        wrapper = setup();
    });

    describe('snapshots', () => {

        /**
         * Tests a snapshot against a version of <IssueTableContainer /> where user is level @param userLevel
         */
        function testSnapshot(canEdit: boolean, graphql: typeof data = data) {

            snapData[0].canEdit = canEdit;

            const tree = renderWithProps(

                <IssueTableContainer
                    data={{
                        loading: false,
                        issues: snapData
                    }}
                    mutate={(test: any) => false}
                />
            );

            expect(tree).toMatchSnapshot();
        }

        test(`table is created and canEdit = false`, () => testSnapshot(false));

        test('if canEdit = true, get chance to name and/or make unpublished issue published', () => testSnapshot(true));
    });

    test(`if canEdit = true, can change most recent issue's name (state.privateIssue.name)`, () => {

        wrapper = setup();
        const component = wrapper.find(IssueTableContainer).instance();

        expect(component.state.privateIssue.name).toBeFalsy();

        const nameInput = wrapper.find('input[name="name"]');

        const expectedName = casual.title;

        nameInput.simulate('change', {target: {name: 'name', value: expectedName}});

        expect(component.state.privateIssue.name).toBe(expectedName);
    });

    test(`if canEdit = true, can change most recent issue's public status (state.privateIssue.public)`, () => {

        wrapper = setup();

        const component = wrapper.find(IssueTableContainer).instance();

        expect(component.state.privateIssue.public).toBeFalsy();

        const publicSelect = wrapper.find('select[name="public"]');

        publicSelect.simulate('change', {target: {value: 1, name: 'public'}});

        expect(component.state.privateIssue.public).toBe(1);
    });

    test('issue data mutation is submitted in correct format', () => {

        const password = casual.password;

        const expectedData = { // this is already tested in the 2 previous tests
            public: true,
            name: casual.title,
            password
        };

        wrapper = setup({mutate: (graphql: {variables: {public: boolean; name: string}}) =>
            expect(graphql.variables).toEqual(expectedData)
        });

        const component = wrapper.find(IssueTableContainer).instance();

        component.state.privateIssue = expectedData;
        (wrapper.find('input[type="password"]') as any).instance().value = password;

        wrapper.find('form').first().simulate('submit'); // this triggers wrapper's mutate function
    });
});
