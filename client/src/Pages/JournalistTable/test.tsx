import * as React from 'react';
import { JournalistTableContainer } from './container';
import { MemoryRouter } from 'react-router';
import * as mocks from '../../tests/setup.mocks';
import * as casual from 'casual';
import snapData from './__snapshots__/users.example';
import renderWithProps from '../../tests/snapshot.helper';
import { User } from './interface.shared';
import setFakeJwt from '../../tests/jwt.helper';
import { setInput, submitForm, setupComponent } from '../../tests/enzyme.helpers';
import * as sinon from 'sinon';

import { configure, mount, ReactWrapper } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { getJWT } from '../../helpers/jwt/index';



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
                id: casual.word + '--' + amount,
                profileLink: casual.word,
                firstName: casual.first_name,
                middleName: casual.coin_flip ? casual.letter : '', // 2 is the most a middleName can be
                lastName: casual.last_name,
                canEdit: true
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
            <JournalistTableContainer
                data={data}
                userUpdate={mockGraphql.userUpdate ? mockGraphql.userUpdate : async (test: any) => true}
                userDelete={mockGraphql.userDelete ? mockGraphql.userDelete : async (test: any) => false}
            />
        </MemoryRouter>
    );
}

describe('<JournalistTableContainer>', () => {

    describe('snapshots', () => {

        const fixedData = {
                        loading: false,
                        users: snapData
                    };

        it('should render correctly when canEdit = false', () => {

            fixedData.users.forEach(user => user.canEdit = false);

            const tree = renderWithProps(
                <JournalistTableContainer
                    data={fixedData}
                    userUpdate={(test: any) => true}
                    userDelete={(test: any) => false}
                />);

            expect(tree).toMatchSnapshot();
        });

        it(`should show users' levels only when one is logged in`, () => {

            setFakeJwt({level: 1});

            const tree = renderWithProps(
                <JournalistTableContainer
                    data={fixedData}
                    userUpdate={(test: any) => true}
                    userDelete={(test: any) => false}
                />);

            expect(tree).toMatchSnapshot();
        });

        it(`lets modify users' level and delete account if canEdit = true`, () => {

            fixedData.users.forEach(user => user.canEdit = true);
            setFakeJwt( {level: 3});

            const tree = renderWithProps(
                <JournalistTableContainer
                    data={fixedData}
                    userUpdate={(test: any) => true}
                    userDelete={(test: any) => false}
                />
            );

            expect(tree).toMatchSnapshot();
        });
    });

    describe('sorting `select`', () => {

        let wrapper: any; // really ReactWrapper
        let sortingSelect: any;
        let component: any; // really JSX class

        /**
         * Finds JournalistTableContainer and remounts it with fresh props
         * Also finds the `select` element that is being tested
         */
        function setupSelect() {
            wrapper = setup();

            component = setupComponent(wrapper, JournalistTableContainer);

            sortingSelect = wrapper.find('#sortingContainer select');
        }

        /**
         * Simulates a change event to sorting select and sets its value to @param value
         */
        function setSelectValue(value: string) {

            sortingSelect.instance().value = value;
            sortingSelect.simulate('change');

            expect(sortingSelect.instance().value).toEqual(value);
        }

        /**
         * When the `option` to be sorted is a number, for example, 'level'
         */
        function testNumberSorting(option: string) {

            setSelectValue(option);

            const expected = (data.users as User[]).
                                 sort((a, b) => +a[option] - +b[option])
                                 .map(user => user[option]);

            expect(component.state.users.map((user: User) => user[option])).toEqual(expected);
        }

        /**
         * Tests that will run in multiple descriptions
         *
         *  *   lastName
         *  *   articles
         *  *   views
         */
        function testSortByNameArticlesViews() {

            it('can sort by lastName', () => {

                setSelectValue('lastName');

                const expected = (data
                                .users as User[])
                                .sort((a, b) => a.lastName.localeCompare(b.lastName))
                                .map(user =>
                                  user.lastName
                                );

                expect(component.state.users.map((user: User) => user.lastName)).toEqual(expected);
            });

            it('can sort by articles', () => testNumberSorting('articleCount'));

            it('can sort by views', () => testNumberSorting('views'));
        }

        beforeEach(setupSelect);

        describe('when logged in', () => {

            it('and level 1, can sort by level (regular number)', () => {

                setFakeJwt({level: 1});
                setupSelect();

                setSelectValue('level');
                testNumberSorting('level');
            });

            it('and above level 1, can sort by level (mixed `select` and number)', () => {

                setFakeJwt({level: 2});
                setupSelect();

                const expected = data.users.
                                 sort((a, b) => a.level - b.level)
                                 .map(user => user.level);

                expect(component.state.users.map((user: User) =>

                     user.level

                )).toEqual(expected);
            });

            testSortByNameArticlesViews();
        });

        describe('when not logged in (and no access to level)', () => {

            beforeAll(() => mocks.localStorage.removeItem('jwt'));

            testSortByNameArticlesViews();
        });
    });

    describe(`changing users' levels`, () => {

        describe('level `select`', () => {

            let wrapper;
            let component: any;
            const userLevel = 3;
            let levelSelect: any;

            beforeEach(() => {

                setFakeJwt({level: userLevel});

                wrapper = setup();
                component = setupComponent(wrapper, JournalistTableContainer);

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

            function getComponent(wrapper: ReactWrapper<any, any>): React.Component<any, any> {

                setFakeJwt({ level: 3 });

                const component = setupComponent(wrapper, JournalistTableContainer);

                return component!;
            }

            it('formats data correctly when multiple ids, 1 level', () => {

                const expectedLevel = 2;
                const password = casual.password;

                const wrapper = setup({
                    // this will execute after everything else
                    userUpdate: async (mapping: {variables: {data: {level: number, ids: string[]}[]}}) => {

                        const expectedIds = data.users.reduce(
                                                (accumulator: string[], user: User) => accumulator.concat(user.id), []
                                            );

                        expect(mapping.variables).toEqual({
                            data: [{
                                level: expectedLevel,
                                ids: [...new Set(expectedIds)]
                            }],
                            password
                        });
                    }
                });

                const component = getComponent(wrapper);

                setInput(wrapper, password);

                // using data.users since already there. No difference if would generate another array of random users
                const idLevelMap = data.users.map((user: User) => [user.id, expectedLevel]);

                component.state.idLevelMap = new Map<string, number>(idLevelMap as any);

                submitForm(wrapper);
            });

            it('formats data correctly when multiple ids, multiple levels', () => {

                const expectedLevels = [2, 3];
                let password = '';
                let idLevelMap: Array<string | number>[];

                const wrapper = setup({
                    // this will execute after everything else
                    userUpdate:
                        async (
                            params: { variables: { data: { level: number, ids: string[] }[] }, password: string }
                        ) => {

                        const expectedFormat = [] as {level: number, ids: string[]}[];

                        expectedLevels.forEach(level => expectedFormat.push({level, ids: []}));

                        // puts ids from each level into `expectedFormat`
                        idLevelMap.forEach(mapping => {

                            const elt = expectedFormat.find(elt => elt.level === mapping[1]); // [1] = level

                            elt && elt.ids.push(mapping[0] as string);
                        });

                        const uniqueExpectedFormat = expectedFormat
                                         .filter(elt => !!elt.ids.length)
                                         .map(elt => {

                                            elt.ids = [...new Set(elt.ids)];
                                            return elt;
                                        });

                        const sortBy = (a: {level: number}, b: typeof a) => a.level - b.level;

                        params.variables.data.forEach(elt => elt.ids.sort());
                        uniqueExpectedFormat.forEach(elt => elt.ids.sort());

                        let sortedData = Object.assign(params.variables, { data: params.variables.data.sort(sortBy) });

                        let expected = {
                            data: uniqueExpectedFormat.sort(sortBy),
                            password
                        };

                        // the sorting is so test doesn't fail because indices don't match
                        expect(sortedData).toEqual(expected);
                    }
                });

                const component = getComponent(wrapper);

                // using data.users since already there. No difference if would generate another array of random users
                idLevelMap = data.users.map((user: User) => [user.id, casual.random_element(expectedLevels)]);

                component.setState({
                    idLevelMap: new Map<string, number>(idLevelMap as any)
                });

                password = setInput(wrapper);

                submitForm(wrapper);
            });

            // integration between toggling `select` and that same data being sent to server
            it('sends the same data to server that was put into state when level `select`s were changed', () => {

                const expectedLevel = 2;
                let password = '';

                const wrapper = setup({
                    // this will execute after everything else
                    userUpdate: async (
                        mapping: { variables: { data: { level: number, ids: string[] }[] }, password: string }
                    ) => {

                        const expectedIds = data.users.reduce((accumulator: string[], user: User) => {

                            if (user.level < getJWT().level) {
                                return accumulator.concat(user.id);
                            }
                            return accumulator;
                        }, []);

                        expect(mapping.variables).toEqual({
                            data: [{level: expectedLevel, ids: expectedIds}],
                            password
                        });
                    }
                });

                getComponent(wrapper);
                const levelSelect = wrapper.find('select[name="lvl"]');
                password = setInput(wrapper);

                for (let i = 0; i < levelSelect.length; i++) {
                    levelSelect.at(i).simulate('change', {target: { value: expectedLevel }});
                }

                submitForm(wrapper);
            });
        });
    });

    describe('deleting users', () => {

        let wrapper: ReactWrapper<any, any>;
        let component: any;

        describe('delete `checkbox`', () => {

            let deleteCheckbox;

            beforeEach(() => {

                setFakeJwt({level: 3});

                wrapper = setup();

                component = setupComponent(wrapper, JournalistTableContainer);

                deleteCheckbox = wrapper.find('input[name="delAcc"]');
            });

            /**
             * Toggle the first deleteCheckbox
             *
             * @return first deleteCheckbox
             */
            function toggleTheBox() {

                const firstCheckbox = deleteCheckbox.first();
                firstCheckbox.instance().checked = !firstCheckbox.instance().checked;
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

            beforeEach(() => setFakeJwt({level: 3}));

            it('deleteUser is called when form is submitted', () => {

                const spy = sinon.spy();
                wrapper = setup({userDelete: async () => spy()});

                component = setupComponent(wrapper, JournalistTableContainer);

                wrapper
                 .find('input[name="delAcc"]')
                 .first()
                 .simulate('change', { target: { checked: true, value: casual.word } });

                submitForm(wrapper);

                expect(spy.called).toBeTruthy();
            });

            it('sends the same ids that were put into state.usersToDelete when checkboxes were toggled', () => {

                let password = '';
                wrapper = setup({
                        // this will execute after everything else
                        userDelete: async (mapping: {variables: {ids: string[]}, password: string}) => {
                            const expectedIds = data
                                                .users
                                                .reduce(
                                                    (accumulator: string[], user: User) =>
                                                      user.level < 3 ? accumulator.concat(user.id) : accumulator,
                                                    []
                                                );

                            expect(mapping.variables).toEqual({ids: expectedIds, password});
                        }
                    });

                component = setupComponent(wrapper, JournalistTableContainer);

                const deleteCheckboxes: any = wrapper.find('input[name="delAcc"]');
                password = setInput(wrapper);

                for (let i = 0; i < deleteCheckboxes.length; i++) {
                    const box = deleteCheckboxes.at(i);
                    box.simulate('change', { target: { checked: true, value: box.instance().value } });
                }

                submitForm(wrapper);
            });
        });
    });
});
