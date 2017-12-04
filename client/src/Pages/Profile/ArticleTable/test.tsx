import * as React from 'react';
import { UserArticleTableContainer, Props, State } from './container';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import casual from '../casual.data';
import snapData from './articles.example';
import { randomCheckboxToggle, setInput, submitForm } from '../../../tests/enzyme.helpers';
import toggler from '../../../helpers/toggler';
import setFakeJwt from '../../../tests/jwt.helper';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

setFakeJwt({level: 3});

const data = {
    articles: casual.articles(casual.integer(0, 25)) // if do more than around 25, the test will be really slow
};

function setup(mockGraphql: {deleteArticle?: Function} = {}) {

    return mount(
        <MemoryRouter>
            <UserArticleTableContainer
                articles={data.articles}
                deleteArticle={mockGraphql.deleteArticle ? mockGraphql.deleteArticle : async (test: {}) => false}
            />
        </MemoryRouter>
    );
}

describe('<UserArticleTableContainer>', () => {

    describe('snapshots', () => {

        function testSnap(canEdit: boolean) {

            const articles = snapData;

            articles.forEach(article => article.canEdit = canEdit);

            const tree = renderer.create(

                <MemoryRouter>
                    <UserArticleTableContainer
                        articles={snapData}
                        deleteArticle={(test: {}) => false}
                    />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();

        }

        it('renders correctly when canEdit is true', () => testSnap(true));

        it('renders correctly when canEdit is false', () => testSnap(false));
    });

    describe('onDelete', () => {

        let wrapper: ReactWrapper<Props, State>;
        let component: UserArticleTableContainer;
        let deleteBoxes: ReactWrapper<HTMLInputElement, {}>; // not sure if correct type

        beforeEach(() => {

            wrapper = setup();

            deleteBoxes = wrapper.find('input[name="delArt"]') as {} as ReactWrapper<HTMLInputElement, {}>;
            component = wrapper.find(UserArticleTableContainer).instance() as UserArticleTableContainer;
        });

        it('adds article id to state.idsToDelete when checkbox is clicked', () => {

            let expectedIds = new Set<string>();
            let articlesToTest = casual.integer(0, deleteBoxes.length - 1);

            for (let i = 0; expectedIds.size < articlesToTest; i++) {

                const result = randomCheckboxToggle(deleteBoxes);

                toggler(expectedIds, component.props.articles[result.index].id);
            }

            expect([...component.state.idsToDelete]).toEqual([...expectedIds]);
        });

        it('removes article id from state.idsToDelete when checkbox is unchecked', () => {

            let expectedIds = new Set<string>();
            let indices = new Set<String>();
            let articlesToTest = casual.integer(0, deleteBoxes.length - 1);

            for (let i = 0; expectedIds.size < articlesToTest; i++) {

                const result = randomCheckboxToggle(deleteBoxes);
                const id = (result.input.instance() as {} as HTMLInputElement).value;

                toggler(expectedIds, id);
                toggler(indices, result.index);
            }

            for (let i = 0; i < casual.integer(0, indices.size - 1); i++) {

                const indexToRemove = casual.random_element([...indices]);

                const result = randomCheckboxToggle(deleteBoxes, indexToRemove);
                indices.delete(indexToRemove);

                expectedIds.delete((result.input.instance() as {} as HTMLInputElement).value);
            }

            expect([...component.state.idsToDelete].sort()).toEqual([...expectedIds].sort());
        });

        it('formats data correctly', () => {

            const expected = {
                password: '',
                ids: [...new Set(casual.array_of_words())]
            };

            const spy = sinon.spy();

            wrapper = setup({
                deleteArticle: async (params: {variables: { ids: string[], password: string }}) => {
                    spy();

                    expect(params.variables).toEqual(expected);
                }
            });

            component = wrapper.find(UserArticleTableContainer).instance() as UserArticleTableContainer;
            component.setState({
                idsToDelete: new Set(expected.ids)
            });

            expected.password = setInput(wrapper);

            submitForm(wrapper);

            expect(spy.called).toBeTruthy();
        });
    });
});
