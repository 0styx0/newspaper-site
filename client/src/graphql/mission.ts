import gql from 'graphql-tag';

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
            canEdit
        }
    }
`;

export {
    MissionEdit,
    MissionQuery
};