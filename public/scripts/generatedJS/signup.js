import { getCookies, multiElementAction } from './stormScripts';
var userLevel = getCookies().jwt[1].level || 0;
if (userLevel >= 1) {
    multiElementAction(document.getElementsByClassName("mustBeLoggedIn"), function (elt) { return elt.style.display = "block"; });
    var levels = "";
    for (var i = 1; i <= userLevel; i++) {
        levels += "<option value=\"" + i + "\">" + i + "</option>";
    }
    document.getElementsByName("lvl")[0].innerHTML = levels;
}
//# sourceMappingURL=signup.js.map