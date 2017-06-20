
(async function() {
    const userLevel = (await getCookies()).level;

    if (userLevel > 2) {
        edit('#missionEdit', '/api/mission', {'selector':"#missionEdit"});
    }

}())