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

    describe('sorting `select`', () => {


        let wrapper: any; // really ReactWrapper
        let sortingSelect: any;
        let component: any; // really JSX class

        /**
         * Finds JournalistTable and remounts it with fresh props
         * Also finds the `select` element that is being tested
         */
        beforeEach(() => {

            wrapper = setup()

            sortingSelect = wrapper.find('#sortingContainer select');
            component = wrapper.find(JournalistTable).node;

            component.componentWillReceiveProps({data});
        });

        /**
         * Simulates a change event to sorting select and sets its value to @param value
         */
        const setSelectValue = (value: string) => {

            sortingSelect.node.value = value;
            sortingSelect.simulate('change')

            expect(sortingSelect.node.value).toEqual(value);
        }

        /**
         * When the `option` to be sorted is a number, for example, 'level'
         */
        const testNumberSorting = (option: string, sortingIdices: Object) => {

            setSelectValue(option);

            const expected = data.users.
                                 sort((a, b) => a[option] - b[option])
                                 .map(user => user[option]);

            expect(component.state.userInfo.map((user: User) => user[sortingIdices[option]])).toEqual(expected)
        }

        describe('when logged in', () => {

            localStorageMock.setItem('jwt', JSON.stringify([,{level: 2}]))

            it('sorts by level correctly (even when some levels are `select`s)', () => {


            });
        });

        describe('when not logged in (and no access to level)', () => {

            localStorageMock.clear();

            const sortingIdices = {
                lastName: 0,
                articles: 1,
                views: 2
            };

            // it('can sort by level', () => testNumberSorting('level'));

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
        });
    });
});
