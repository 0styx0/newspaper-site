import { gql } from 'react-apollo';

const MissionEdit = gql`
    mutation editMission($mission: String!) {
        editMission(mission: $mission) {
            mission
        }
    }
`;

export {
    MissionEdit
};