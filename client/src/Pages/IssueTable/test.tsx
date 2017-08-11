import * as React from 'react';
import { IssueTable, Issue } from './';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../tests/localstorage.mock';
import { generateRandomNum, generateRandomStr } from '../../tests/helpers';

/**
 * Randomly generate issue data
 *
 * @param amount - how many issues to generate
 *
 * @return the issues
 */
function generateIssues(amount: number) {

    const issues: Issue[] = [];

    while (amount-- > 0) {

        issues.push({
            num: amount,
            name: generateRandomStr(10),
            views: generateRandomNum(1, 100),
            datePublished: new Date,
            public: !!generateRandomNum(0, 1)
        });
    }
}

const data = {
    loading: false,
    issues: generateIssues(5)
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

    describe('snapshots', () => {

        test('table is created', () => {

            //
        });

        test('if admin, get chance to name and/or make unpublished issue published', () => {

            //
        });

        test(`if not admin, don't get option to modify anything`, () => {

            //
        });
    });

    test(`admins can change most recent issue's name if not public`, () => {
        //
    });

    test(`admins can change most recent issue's public status if not public`, () => {

        //
    });

    test('issue data mutation is submitted in correct format', () => {

        //
    });
});