import { gql } from 'react-apollo';

const MissionEdit = gql`
    mutation editMission($mission: String!) {
        editMission(mission: $mission) {
            mission
        }
    }
`;

const MissionQuery = gql`
    query missionQuery {
        mission {
            mission
        }
    }
`;

export {
    MissionEdit,
    MissionQuery
};