import * as React from 'react';
import { JournalistTable, User } from './';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../../__tests__/localstorage.mock';

/** @author https://stackoverflow.com/a/1527820/6140527 */
const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * @param amount - how many users to return
 *
 * @return array of randomly generated Users
 */
function generateUsers(amount: number, requiredLevels: number[] = []) {

    let users: User[] = [];

    /** @author https://stackoverflow.com/a/38622545/6140527 */
    const randomStr = (length: number) => (Math.random() + 1).toString(36).substr(2, length);


    while (amount > 0) {

        // all numbers, except where noted otherwise, are magic numbers
        users.push({
                articles: randomNum(0, 20),
                views: randomNum(0, 10),
                level: randomNum(1, 3), // lvls can only be 1-3
                id: randomStr(randomNum(1, 7)),
                profileLink: randomStr(5),
                firstName: randomStr(randomNum(5, 50)),
                middleName: randomStr(randomNum(0, 2)), // 2 is the most a middleName can be
                lastName: randomStr(randomNum(5, 7))
        });

        amount--;
    }

    return users;
}

const data = {
    loading: false,
    users: generateUsers(5)
};

// for some reason beforeEvery doesn't work
function setup(mockGraphql: {userUpdate?: Function, userDelete?: Function} = {}) {

    return mount(
        <MemoryRouter>
            <JournalistTable
                data={data}
                userUpdate={mockGraphql.userUpdate ? mockGraphql.userUpdate : (test: any) => true}
                userDelete={mockGraphql.userDelete ? mockGraphql.userDelete : (test: any) => false}
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
        function setSelectValue(value: string) {

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

    describe('level `select`', () => {

        let wrapper: any;
        let component: any;
        const userLevel = 3;
        let levelSelect: any;

        beforeEach(() => {

            localStorageMock.setItem('jwt', JSON.stringify([,{level: userLevel}]));

            wrapper = setup();
            component = wrapper.find(JournalistTable).node;

            component.componentWillReceiveProps({data});

            levelSelect = wrapper.find('select[name="lvl"]');
        });

        it(`adds map of id => level when a user's level is changed`, () => {

            const firstLevelSelect = levelSelect.first();
            const updatedLevel = 2;

            const userToChange = component.props.data.users.find((user: User) => user.level < userLevel);

            firstLevelSelect.simulate('change', {target: { value: updatedLevel }});

            const mappings = [...component.state.idLevelMap];

            expect(mappings).toEqual([[userToChange.id, updatedLevel]]);
        });

        it('cannot add 1 user to 2 different levels', () => {

            const firstLevelSelect = levelSelect.first();
            const initialNewLevel = 2;
            const updatedLevel = userLevel;

            const userToChange = component.props.data.users.find((user: User) => user.level < userLevel);

            firstLevelSelect.simulate('change', {target: { value: initialNewLevel }});
            firstLevelSelect.simulate('change', {target: { value: updatedLevel}});

            const mappings = [...component.state.idLevelMap];

            expect(mappings).toEqual([[userToChange.id, updatedLevel]]);
        });

        it('can add multiple users to the same level', () => {

            const updatedLevel = 2;

            for (let i = 0; i < levelSelect.length; i++) {

                levelSelect.at(i).simulate('change', {target: { value: updatedLevel }});
            }

            const mappings = [...component.state.idLevelMap];

            const usersToMatch = component.props.data.users
                                 .filter((user: User) => user.level < userLevel)
                                 .map((user: User) => [user.id, updatedLevel]);

            expect(mappings).toEqual(usersToMatch);
        });
    });

    describe('when sending level data to server', () => {


        it('formats data correctly when multiple ids, 1 level', () => {

            const expectedLevel = 2;

            const wrapper = setup({
                // this will execute after everything else
                userUpdate: (mapping: {variables: {data: {level: number, ids: string[]}[]}}) => {

                    const expectedIds = data.users.reduce(
                                            (accumulator: string[], user: User) => accumulator.concat(user.id), []
                                        );

                    expect(mapping.variables.data).toEqual([{level: expectedLevel, ids: expectedIds}]);
                }
            });

            const component = wrapper.find(JournalistTable).node;

            // using data.users since already there. No difference if would generate another array of random users
            const idLevelMap = data.users.map((user: User) => [user.id, expectedLevel]);

            component.state.idLevelMap = new Map<string, number>(idLevelMap);

            wrapper.find('form').first().simulate('submit');
        });

        it('formats data correctly when multiple ids, multiple levels', () => {

            const expectedLevels = [2, 3];
            let idLevelMap: Array<string | number>[];

            const wrapper = setup({
                // this will execute after everything else
                userUpdate: (mapping: {variables: {data: {level: number, ids: string[]}[]}}) => {

                    let expectedFormat = [] as {level: number, ids: string[]}[];

                    expectedLevels.forEach(level => expectedFormat.push({level, ids: []}))

                    idLevelMap.forEach(mapping => {

                        const place = expectedFormat.find(elt => elt.level == mapping[1]);

                        place && place.ids.push(mapping[0] as string)
                    });

                    expectedFormat = expectedFormat.filter(elt => !!elt.ids.length);

                    const sortBy = (a: {level: number}, b: typeof a) => a.level - b.level;

                    // the sorting is so test doesn't fail because indices don't match
                    expect(mapping.variables.data.sort(sortBy)).toEqual(expectedFormat.sort(sortBy));
                }
            });

            const component = wrapper.find(JournalistTable).node;

            // using data.users since already there. No difference if would generate another array of random users
            idLevelMap = data.users.map((user: User) => [user.id, expectedLevels[randomNum(0, 1)]]);

            component.state.idLevelMap = new Map<string, number>(idLevelMap);

            wrapper.find('form').first().simulate('submit');
        });
    });
});
