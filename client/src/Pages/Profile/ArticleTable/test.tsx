import * as React from 'react';
import { UserArticleTableContainer } from './container';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import casual from '../casual.data';
import snapData from './articles.example';
import { randomCheckboxToggle, setInput, submitForm } from '../../../tests/enzyme.helpers';
import toggler from '../../../helpers/toggler';
import setFakeJwt from '../../../tests/jwt.helper';
import * as sinon from 'sinon';
import { mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';



setFakeJwt({level: 3});

const data = {
    articles: casual.articles(casual.integer(0, 25)) // if do more than around 25, the test will be really slow
};

function setup(mockGraphql: {deleteArticle?: Function} = {}) {

    return mount(
        <MemoryRouter>
            <UserArticleTableContainer
                articles={data.articles}
                deleteArticle={mockGraphql.deleteArticle ? mockGraphql.deleteArticle : (test: {}) => false}
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

        let wrapper: any;
        let component: any;
        let deleteBoxes: any;

        beforeEach(() => {

            wrapper = setup();

            deleteBoxes = wrapper.find('[name="delArt"]');
            component = wrapper.find(UserArticleTableContainer).instance();
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
                const id = result.input.instance().value;

                toggler(expectedIds, id);
                toggler(indices, result.index);
            }

            for (let i = 0; i < casual.integer(0, indices.size - 1); i++) {

                const indexToRemove = casual.random_element([...indices]);

                const result = randomCheckboxToggle(deleteBoxes, indexToRemove);
                indices.delete(indexToRemove);

                expectedIds.delete(result.input.instance().value);
            }

            expect([...component.state.idsToDelete].sort()).toEqual([...expectedIds].sort());
        });

        it('formats data correctly', () => {

            const expected = {
                password: '',
                ids: casual.array_of_words()
            };

            const spy = sinon.spy();

            wrapper = setup({
                deleteArticle: (params: {variables: { ids: string[], password: string }}) => {
                    spy();

                    expect(params.variables).toEqual(expected);
                }
            });

            component = wrapper.find(UserArticleTableContainer).instance();
            component.state.idsToDelete = expected.ids;
            expected.password = setInput(wrapper);

            submitForm(wrapper);

            expect(spy.called).toBeTruthy();
        });
    });
});
