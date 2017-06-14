

    const userLevel = getCookies().jwt[1].level;

    if (userLevel > 2) {
        edit('#missionEdit', '/api/mission', {'selector':"#missionEdit"});
    }