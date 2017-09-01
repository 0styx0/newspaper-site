import * as React from 'react';
import { MissionContainer, Props } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import * as sinon from 'sinon';
import * as casual from 'casual';
import setFakeJwt from '../../tests/jwt.helper';

document.queryCommandSupported = () => true; // used in Editable component

describe('<MissionContainer>', () => {

    /**
     * For use in props.editMission
     *
     * @param newMission - payload
     *
     * @return function editMission used in props
     */
    function fakeEditMission(newMission: string = casual.sentences()) {

        return async (params: { query: Function, variables: { mission: string } }) => ({
            data: {
                editMission: {
                    mission: newMission
                }
            }
        });
    }

    describe('snapshot', () => {

        function snap(level: number) {

            setFakeJwt({level});

            const tree = renderer.create(
                <MissionContainer
                    editMission={fakeEditMission()}
                    data={{
                        mission: {
                            mission: casual.sentences()
                        }
                    }}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        it('lets user edit when lvl 3+', () => snap(3));

        it('does not let user edit if 2-', () => snap(casual.integer(0, 2)));
    });

    type editMissionType = Props['editMission'];

    /**
     * @param newMission @see fakeEditMission's newMission
     *
     * @return mounted MissionContainer
     */
    function setup(editMission: editMissionType) {

        return mount(
            <MissionContainer
              editMission={editMission || fakeEditMission(casual.sentences())}
              data={{
                  mission: {
                      mission: casual.sentences()
                  }
              }}
            />
        );
    }

    describe('editMission', () => {

        beforeEach(() => {

            setFakeJwt({level: 3, id: Math.random()});
        });

        it('gets called after submission', () => {

            const spy = sinon.spy();

            const wrapper = setup(spy);

            wrapper.find('button').last().simulate('click');

            expect(spy.called).toBeTruthy();
        });

        it('gets called with correct data (edited mission)', () => {

            const newMission = casual.sentences();

            const wrapper = setup(async (params: { query: Function, variables: { mission: string }}) => {

                expect(params.variables.mission).toBe(newMission);

                return {
                    data: {
                        editMission: {
                            mission: params.variables.mission
                        }
                    }
                };
            });

            const content = wrapper.find('[contentEditable]').first();

            (content as any).node.innerHTML = newMission;
            content.simulate('blur'); // so container can save to state

            wrapper.find('button').last().simulate('click');
        });
    });
});