import * as React from 'react';
import { MissionContainer, Props } from './container';
import * as renderer from 'react-test-renderer';
import * as sinon from 'sinon';
import * as casual from 'casual';
import { mount } from 'enzyme';

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

        function snap(canEdit: boolean) {

            const tree = renderer.create(
                <MissionContainer
                    editMission={fakeEditMission()}
                    data={{
                        mission: {
                            mission: casual.sentences(),
                            canEdit
                        }
                    }}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        it('lets user edit when canEdit = true', () => snap(true));

        it('does not let user edit canEdit = false', () => snap(false));
    });

    type editMissionType = Props['editMission'];

    /**
     * @param newMission @see fakeEditMission's newMission
     *
     * @return mounted MissionContainer
     */
    function setup(editMission: editMissionType) {

        const wrapper = mount(
            <MissionContainer
              editMission={editMission || fakeEditMission(casual.sentences())}
              data={{
                  mission: {
                      mission: casual.sentences(),
                      canEdit: true
                  }
              }}
            />
        );

        wrapper.setProps({data: {mission: {
                      mission: casual.sentences(),
                      canEdit: true
                  }}});

        return wrapper;
    }

    describe('editMission', () => {

        it('gets called after submission', () => {

            const spy = sinon.spy();

            const wrapper = setup(function (params) {
                spy();
                return fakeEditMission()(params);
            });

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
            (content.instance() as {} as HTMLDivElement).innerHTML = newMission;
            content.simulate('blur'); // so container can save to state

            wrapper.find('button').last().simulate('click');
        });
    });
});