import * as React from 'react';
import { JournalistTable, User } from './';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../../__tests__/localstorage.mock';

const data = {
    loading: false,
    users: [
        {
            articles: 2,
            views: 5,
            level: 3,
            id: 'string',
            profileLink: 'link',
            firstName: 'John',
            middleName: '',
            lastName: 'Doe'
        },
        {
            articles: 0,
            views: 3,
            level: 2,
            id: 'adfg',
            profileLink: 'hreg',
            firstName: 'Bob',
            middleName: '',
            lastName: 'Zerg'
        },
        {
            articles: 5,
            views: 1,
            level: 1,
            id: 'qwert',
            profileLink: 'a',
            firstName: 'Grok',
            middleName: 'T',
            lastName: 'Tre'
        }
    ]
};

// for some reason beforeEvery doesn't work
function setup() {

    return mount(
        <MemoryRouter>
            <JournalistTable
                data={data}
                userUpdate={(test: any) => true}
                userDelete={(test: any) => false}
            />
        </MemoryRouter>
    );
}

describe('<JournalistTable>', () => {

    it('should render correctly', () => {

        const tree = renderer.create(
            <JournalistTable
                data={data}
                userUpdate={(test: any) => true}
                userDelete={(test: any) => false}
            />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    it(`should show users' levels only when one is logged in`, () => {

       localStorageMock.setItem('jwt', JSON.stringify([,{level: 1}]));

        const tree = renderer.create(
            <JournalistTable
                data={data}
                userUpdate={(test: any) => true}
                userDelete={(test: any) => false}
            />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    it(`should let higher level users modify lower level users' level and delete their account`, () => {

        // 2 tests since lvl 2 can only modify lvl 1, and change them to lvl 2,
        // while lvl 3 can delete/modify lvl 2 until lvl 3
        [2, 3].forEach(level => {

            localStorageMock.setItem('jwt', JSON.stringify([,{level}]));

                const tree = renderer.create(
                    <JournalistTable
                        data={data}
                        userUpdate={(test: any) => true}
                        userDelete={(test: any) => false}
                    />
                ).toJSON();

                expect(tree).toMatchSnapshot();
        });
    });
    describe('sorting `select`', () => {


        let wrapper: any; // really ReactWrapper
        let sortingSelect: any;
        let component: any; // really JSX class

        /**
         * Finds JournalistTable and remounts it with fresh props
         * Also finds the `select` element that is being tested
         */
        function setupSelect() {
            wrapper = setup();

            sortingSelect = wrapper.find('#sortingContainer select');
            component = wrapper.find(JournalistTable).node;

            component.componentWillReceiveProps({data});
        }

        /**
         * Simulates a change event to sorting select and sets its value to @param value
         */
        function setSelectValue (value: string) {

            sortingSelect.node.value = value;
            sortingSelect.simulate('change');

            expect(sortingSelect.node.value).toEqual(value);
        }

        /**
         * When the `option` to be sorted is a number, for example, 'level'
         */
        function testNumberSorting(option: string, sortingIdices: Object) {

            setSelectValue(option);

            const expected = data.users.
                                 sort((a, b) => +a[option] - +b[option])
                                 .map(user => user[option]);

            expect(component.state.userInfo.map((user: User) => user[sortingIdices[option]])).toEqual(expected)
        }

        /**
         * Tests that will run in multiple descriptions
         *
         *  *   lastName
         *  *   articles
         *  *   views
         */
        function testSortByNameArticlesViews(sortingIdices: {lastName: number; articles: number; views: number}) {

            it('can sort by lastName', () => {

                setSelectValue('lastName');

                const expected = data
                                .users
                                .sort((a, b) => a.lastName.localeCompare(b.lastName))
                                .map(user =>
                                  `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
                                );

                expect(component.state.userInfo.map((user: User) =>
                user[sortingIdices.lastName].props.children)
                ).toEqual(expected);
            });

            it('can sort by articles', () => testNumberSorting('articles', sortingIdices));

            it('can sort by views', () => testNumberSorting('views', sortingIdices));
        }

        beforeEach(setupSelect);

        describe('when logged in', () => {

            const sortingIdices = {
                lastName: 0,
                level: 1,
                articles: 2,
                views: 3
            };

            it('and level 1, can sort by level (regular number)', () => {

                localStorageMock.setItem('jwt', JSON.stringify([,{level: 1}]));
                setupSelect();

                setSelectValue('level');
                testNumberSorting('level', sortingIdices);
            });

            it('and above level 1, can sort by level (mixed `select` and number)', () => {

                localStorageMock.setItem('jwt', JSON.stringify([,{level: 2}]));
                setupSelect();

                const expected = data.users.
                                 sort((a, b) => a.level - b.level)
                                 .map(user => user.level);

                expect(component.state.userInfo.map((user: User) =>

                    user[sortingIdices.level].props ?
                     +user[sortingIdices.level].props.defaultValue :
                     user[sortingIdices.level])

                ).toEqual(expected);
            });

            testSortByNameArticlesViews(sortingIdices);
        });

        describe('when not logged in (and no access to level)', () => {

            beforeAll(() => localStorageMock.removeItem('jwt'));

            const sortingIdices = {
                lastName: 0,
                articles: 1,
                views: 2
            };

            testSortByNameArticlesViews(sortingIdices);
        });
    });
});
