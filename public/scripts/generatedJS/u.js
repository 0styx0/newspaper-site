var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { multiElementAction, getCookies, addChangedEvent } from './stormScripts';
fetch("/api/userGroup", {
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then(function (data) {
    return __awaiter(this, void 0, void 0, function () {
        var tableData, cookies, userLevel, tbody, templateContainer, select, deleteCheckbox, hiddenIdentifier, i, option;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, data.json()];
                case 1:
                    tableData = _a.sent();
                    cookies = getCookies();
                    userLevel = cookies.jwt[1].level || 0;
                    if (userLevel) {
                        multiElementAction(document.getElementsByClassName("mustBeLoggedIn"), function (elt) { return elt.classList.remove("mustBeLoggedIn"); });
                    }
                    else {
                        multiElementAction(document.getElementsByClassName("mustBeLoggedIn"), function (elt) { return elt.remove(); });
                    }
                    if (userLevel > 1) {
                        multiElementAction(document.getElementsByClassName("mustBeLevelTwo"), function (elt) { return elt.classList.remove("mustBeLevelTwo"); });
                    }
                    else {
                        multiElementAction(document.getElementsByClassName("mustBeLevelTwo"), function (elt) { return elt.remove(); }); // for sorting
                    }
                    tbody = document.createElement("tbody");
                    templateContainer = document.getElementById("templates");
                    select = templateContainer.querySelector("[name=lvl\\[\\]]");
                    deleteCheckbox = templateContainer.querySelector("[name=delAcc\\[\\]]");
                    hiddenIdentifier = templateContainer.querySelector("[name=name\\[\\]]");
                    for (i = 1; i <= userLevel; i++) {
                        option = document.createElement("option");
                        option.value = option.textContent = i.toString();
                        select.appendChild(option);
                    }
                    tableData.forEach(function (row) {
                        var userId = row.ID;
                        delete row.ID;
                        var profileLink = row.PROFILE_LINK;
                        delete row.PROFILE_LINK;
                        var tr = document.createElement("tr");
                        tbody.appendChild(tr);
                        // if user is lower level than logged in user, can delete
                        if (row.LEVEL < userLevel) {
                            row.delete = deleteCheckbox.cloneNode(true);
                            row.delete.value = userId.toString();
                        }
                        else if (userLevel > 1) {
                            row.delete = "N/A";
                        }
                        for (var cell in row) {
                            var tdVal = row[cell];
                            var td = document.createElement("td");
                            if (cell == "NAME") {
                                row[cell] = document.createElement("a");
                                row[cell].href = "/u/" + profileLink;
                                row[cell].textContent = tdVal;
                            }
                            if (cell == "LEVEL" && tdVal < userLevel) {
                                var hiddenClone = hiddenIdentifier.cloneNode(true);
                                hiddenClone.value = profileLink;
                                td.appendChild(hiddenClone);
                                var selectClone = select.cloneNode(true);
                                selectClone.value = tdVal;
                                row[cell] = selectClone;
                            }
                            try {
                                td.appendChild(row[cell]);
                            }
                            catch (e) {
                                td.appendChild(document.createTextNode(row[cell]));
                            }
                            tr.appendChild(td);
                        }
                        tbody.appendChild(tr);
                    });
                    document.getElementsByTagName("table")[0].appendChild(tbody);
                    addChangedEvent(); // see stormScripts.js
                    return [2 /*return*/];
            }
        });
    });
});
(function sortJournalists() {
    document.querySelector("select[name=sortBy]").addEventListener("change", function () {
        var filterType = this.value;
        var mapFilterToLocation = [];
        multiElementAction(document.getElementsByTagName("th"), function (elt) {
            return mapFilterToLocation.push(elt.textContent.toString());
        });
        var idxOfCol = mapFilterToLocation.indexOf(filterType);
        var filterIndex = (idxOfCol < 0) ? 0 : idxOfCol; // since Last Name != Name, can't sort by last name unless do this
        var tbody = document.getElementsByTagName('tbody')[0];
        // inspiration/help from https://stackoverflow.com/a/16589087
        var sortedArr = Array.from(tbody.querySelectorAll('tr')).sort(function (a, b) {
            var tda = a.querySelectorAll("td")[filterIndex];
            var tdb = b.querySelectorAll("td")[filterIndex];
            // if there's a select elt, get its value, else just it's text
            var tdaVal = (tda.querySelector("select")) ? tda.querySelector("select").value : tda.textContent;
            var tdbVal = (tdb.querySelector("select")) ? tdb.querySelector("select").value : tdb.textContent;
            return (+tdbVal - +tdaVal || tdaVal.localeCompare(tdbVal));
        });
        sortedArr.forEach(function (elt) { return tbody.appendChild(elt); });
    });
})();
//# sourceMappingURL=u.js.map