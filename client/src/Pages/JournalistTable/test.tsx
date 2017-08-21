import * as React from 'react';
import { JournalistTable, User } from './';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../tests/localstorage.mock';
import * as casual from 'casual';
import snapData from './__snapshots__/users.example';
import renderWithProps from '../../tests/snapshot.helper';

/**
 * @param amount - how many users to return
 *
 * @return array of randomly generated Users
 */
casual.define('users', function(amount: number, requiredLevels: number[] = []) {

    let users: User[] = [];

    while (amount > 0) {

        // all numbers, except where noted otherwise, are magic numbers
        users.push({
                articleCount: casual.integer(0, 100),
                views: casual.integer(0, 1000),
                level: casual.integer(1, 3), // lvls can only be 1-3
                id: casual.word,
                profileLink: casual.word,
                firstName: casual.first_name,
                middleName: casual.coin_flip ? casual.letter : '', // 2 is the most a middleName can be
                lastName: casual.last_name
        });

        amount--;
    }

    return users;
});

const data = {
    loading: false,
    users: (casual as any).users(5) as User[]
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

    describe('snapshots', () => {

        const fixedData = {
                        loading: false,
                        users: snapData
                    };

        it('should render correctly', () => {

            const tree = renderWithProps(
                <JournalistTable
                    data={fixedData}
                    userUpdate={(test: any) => true}
                    userDelete={(test: any) => false}
                />);

            expect(tree).toMatchSnapshot();
        });

        it(`should show users' levels only when one is logged in`, () => {

            localStorageMock.setItem('jwt', JSON.stringify([, {level: 1}]));

            const tree = renderWithProps(
                <JournalistTable
                    data={fixedData}
                    userUpdate={(test: any) => true}
                    userDelete={(test: any) => false}
                />);

            expect(tree).toMatchSnapshot();
        });

        it(`should let higher level users modify lower level users' level and delete their account`, () => {

            // 2 tests since lvl 2 can only modify lvl 1, and change them to lvl 2,
            // while lvl 3 can delete/modify lvl 2 until lvl 3
            [2, 3].forEach(level => {

                localStorageMock.setItem('jwt', JSON.stringify([, {level}]));

                const tree = renderWithProps(
                    <JournalistTable
                        data={fixedData}
                        userUpdate={(test: any) => true}
                        userDelete={(test: any) => false}
                    />
                );

                expect(tree).toMatchSnapshot();
            });
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

            const expected = (data.users as User[]).
                                 sort((a, b) => +a[option] - +b[option])
                                 .map(user => user[option]);

            expect(component.state.userInfo.map((user: User) => user[sortingIdices[option]])).toEqual(expected);
        }

        /**
         * Tests that will run in multiple descriptions
         *
         *  *   lastName
         *  *   articles
         *  *   views
         */
        function testSortByNameArticlesViews(sortingIdices: {lastName: number; articleCount: number; views: number}) {

            it('can sort by lastName', () => {

                setSelectValue('lastName');

                const expected = (data
                                .users as User[])
                                .sort((a, b) => a.lastName.localeCompare(b.lastName))
                                .map(user =>
                                  `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
                                );

                expect(component.state.userInfo.map((user: User) =>
                user[sortingIdices.lastName].props.children)
                ).toEqual(expected);
            });

            it('can sort by articles', () => testNumberSorting('articleCount', sortingIdices));

            it('can sort by views', () => testNumberSorting('views', sortingIdices));
        }

        beforeEach(setupSelect);

        describe('when logged in', () => {

            const sortingIdices = {
                lastName: 0,
                level: 1,
                articleCount: 2,
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
                articleCount: 1,
                views: 2
            };

            testSortByNameArticlesViews(sortingIdices);
        });
    });

    describe(`changing users' levels`, () => {

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

                const sortFunc = (a: [string, number], b: [string, number]) => a[0].localeCompare(b[0]);

                expect(mappings.sort(sortFunc)).toEqual(usersToMatch.sort(sortFunc));
            });
        });

        describe('when sending level data to server', () => {


            it('formats data correctly when multiple ids, 1 level', () => {

                const expectedLevel = 2;

                const wrapper: any = setup({
                    // this will execute after everything else
                    userUpdate: (mapping: {variables: {data: {level: number, ids: string[]}[]}}) => {

                        const expectedIds = data.users.reduce(
                                                (accumulator: string[], user: User) => accumulator.concat(user.id), []
                                            );

                        expect(mapping.variables.data).toEqual(
                            [{
                                level: expectedLevel,
                                ids: [...new Set(expectedIds)]
                            }]
                        );
                    }
                });

                const component = wrapper.find(JournalistTable).node;

                // using data.users since already there. No difference if would generate another array of random users
                const idLevelMap = data.users.map((user: User) => [user.id, expectedLevel]);

                component.state.idLevelMap = new Map<string, number>(idLevelMap as any);

                wrapper.find('form').first().simulate('submit');
            });

            it('formats data correctly when multiple ids, multiple levels', () => {

                const expectedLevels = [2, 3];
                let idLevelMap: Array<string | number>[];

                const wrapper: any = setup({
                    // this will execute after everything else
                    userUpdate: (mapping: {variables: {data: {level: number, ids: string[]}[]}}) => {

                        let expectedFormat = [] as {level: number, ids: string[]}[];

                        expectedLevels.forEach(level => expectedFormat.push({level, ids: []}));

                        idLevelMap.forEach(mapping => {

                            const place = expectedFormat.find(elt => elt.level === mapping[1]);

                            place && place.ids.push(mapping[0] as string)
                        });

                        expectedFormat = expectedFormat
                                         .filter(elt => !!elt.ids.length)
                                         .map(elt => {

                                            elt.ids = [...new Set(elt.ids)];
                                            return elt;
                                        });

                        const sortBy = (a: {level: number}, b: typeof a) => a.level - b.level;

                        mapping.variables.data.forEach(elt => elt.ids.sort());
                        expectedFormat.forEach(elt => elt.ids.sort());

                        // the sorting is so test doesn't fail because indices don't match
                        expect(mapping.variables.data.sort(sortBy)).toEqual(expectedFormat.sort(sortBy));
                    }
                });

                const component = wrapper.find(JournalistTable).node;

                // using data.users since already there. No difference if would generate another array of random users
                idLevelMap = data.users.map((user: User) => [user.id, casual.random_element(expectedLevels)]);

                component.state.idLevelMap = new Map<string, number>(idLevelMap as any);

                wrapper.find('form').first().simulate('submit');
            });

            // integration between toggling `select` and that same data being sent to server
            it('sends the same data to server that was put into state when level `select`s were changed', () => {

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

                const levelSelect = wrapper.find('select[name="lvl"]');

                for (let i = 0; i < levelSelect.length; i++) {

                    levelSelect.at(i).simulate('change', {target: { value: expectedLevel }});
                }

                wrapper.find('form').first().simulate('submit');
            });
        });
    });

    describe('deleting users', () => {

        let wrapper: any;
        let component: any;

        describe('delete `checkbox`', () => {

            let deleteCheckbox: any;

            beforeEach(() => {

                localStorageMock.setItem('jwt', JSON.stringify([,{level: 3}]));

                wrapper = setup();
                component = wrapper.find(JournalistTable).node;

                component.componentWillReceiveProps({data});

                deleteCheckbox = wrapper.find('input[name="delAcc"]')
            });

            /**
             * Toggle the first deleteCheckbox
             *
             * @return first deleteCheckbox
             */
            function toggleTheBox() {

                const firstCheckbox = deleteCheckbox.first();
                firstCheckbox.nodes[0].checked = !firstCheckbox.nodes[0].checked;
                firstCheckbox.simulate('change');

                return firstCheckbox;
            }

            it('adds ids to props.usersToDelete when checked', () => {

                toggleTheBox();

                const expectedUser = component.props.data.users.find((user: User) => user.level < 3);

                expect([...component.state.usersToDelete]).toEqual([expectedUser.id]);
            });

            it('should remove users from props.usersToDelete if checkbox is unchecked', () => {

                toggleTheBox();

                expect(component.state.usersToDelete.size).toBe(1);

                toggleTheBox();

                expect(component.state.usersToDelete.size).toBe(0);
            });
        });

        describe('when sending delete data to server', () => {

            it('sends the same ids that were put into state.usersToDelete when checkboxes were toggled', () => {

               const wrapper = setup({
                    // this will execute after everything else
                    userUpdate: (mapping: {variables: {ids: string[]}}) => {

                        const expectedIds = data
                                            .users
                                            .reduce(
                                                (accumulator: string[], user: User) => accumulator.concat(user.id), []
                                            );

                        expect(mapping.variables).toEqual({ids: expectedIds});
                    }
                });

               const deleteCheckboxes: any = wrapper.find('input[name="delAcc"]');

               for (let i = 0; i < deleteCheckboxes.length; i++) {
                    deleteCheckboxes.at(i).nodes[0].checked = true;
                }

               wrapper.find('form').first().simulate('submit');
            });
        });
    });
});
