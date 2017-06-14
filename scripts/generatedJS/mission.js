import { getCookies, edit } from './stormScripts';
const userLevel = getCookies().jwt[1].level;
if (userLevel && userLevel > 2) {
    edit('#missionEdit', '/api/mission', { 'selector': "#missionEdit" });
}
//# sourceMappingURL=mission.js.map