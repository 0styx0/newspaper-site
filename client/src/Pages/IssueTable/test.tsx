import * as React from 'react';
import { IssueTable, Issue } from './';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../tests/localstorage.mock';
import * as casual from 'casual';
import renderWithProps from '../../tests/snapshot.helper';
import snapData from './__snapshots__/issues.example';

// NOTE: unless explicitly said, all numbers except jwt.level are completely random (although all must be positive)


localStorageMock.setItem('jwt', JSON.stringify([,{level: 1}]));

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
            public: true
        });
    }

    issues[0].public = false; // most tests need it to private, to test if can change name etc

    return issues;
});

const data = {
    loading: false,
    issues: (casual as any).issues(5) as Issue[]
};

function setup(mockGraphql: {mutate?: Function} = {}) {

    return mount(
        <MemoryRouter>
            <IssueTable
                data={data}
                mutate={mockGraphql.mutate ? mockGraphql.mutate : (test: {}) => false}
            />
        </MemoryRouter>
    );
}

describe('<IssueTable>', () => {

    let wrapper: any;

    beforeEach(() => {
        wrapper = setup();
    });

    describe('snapshots', () => {

        /**
         * Tests a snapshot against a version of <IssueTable /> where user is level @param userLevel
         */
        function testSnapshot(userLevel: number, graphql: typeof data = data) {

            localStorageMock.setItem('jwt', JSON.stringify([,{level: userLevel}]));

            const tree = renderWithProps(

                <IssueTable
                    data={{
                        loading: false,
                        issues: snapData
                    }}
                    mutate={(test: any) => false}
                />
            );

            expect(tree).toMatchSnapshot();
        }

        test(`table is created and not admin (so can't modify anything)`, () => testSnapshot(2));

        test('if admin, get chance to name and/or make unpublished issue published', () => testSnapshot(3));

        test('if issue already published, nobody can change info', () => {

            const dataCopy = JSON.parse(JSON.stringify(data));
            dataCopy.issues[0].public = true;

            testSnapshot(3, dataCopy);
         });
    });

    test(`admins can change most recent issue's name if not public`, () => {

        wrapper = setup();
        const component = wrapper.find(IssueTable).node;
        component.componentWillReceiveProps({data});

        expect(component.state.privateIssue.name).toBeFalsy();

        const nameInput = wrapper.find('input[name="name"]');

        const expectedName = casual.title;

        nameInput.simulate('change', {target: {name: 'name', value: expectedName}});

        expect(component.state.privateIssue.name).toBe(expectedName);
    });

    test(`admins can change most recent issue's public status if not public`, () => {

        wrapper = setup();
        const component = wrapper.find(IssueTable).node;
        component.componentWillReceiveProps({data});

        expect(component.state.privateIssue.public).toBeFalsy();

        const publicSelect = wrapper.find('select[name="public"]');

        publicSelect.simulate('change', {target: {value: 1, name: 'public'}});

        expect(component.state.privateIssue.public).toBe(1);
    });

    test('issue data mutation is submitted in correct format', () => {

        const expectedData = { // this is already tested in the 2 previous tests
            public: true,
            name: casual.title
        };

        wrapper = setup({mutate: (graphql: {variables: {public: boolean; name: string}}) =>
            expect(graphql.variables).toEqual(expectedData)
        });

        const component = wrapper.find(IssueTable).node;

        component.state.privateIssue = expectedData;

        component.onSubmit(new Event('submit')); // this triggers wrapper's mutate function
    });
});
