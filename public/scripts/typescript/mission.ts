

    import {getCookies, edit} from './stormScripts';

(async function() {
    const userLevel = (await getCookies()).level;

    if (userLevel && userLevel > 2) {
        edit('#missionEdit', '/api/mission', {'selector':"#missionEdit"});
    }
}());