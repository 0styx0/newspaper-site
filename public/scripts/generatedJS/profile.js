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
var _this = this;
import { getCookies } from './stormScripts';
var path = window.location.pathname.split("/");
fetch("../api/user?user=" + path[2], {
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then(function (data) { return __awaiter(_this, void 0, void 0, function () {
    var userInfo, basicInfo, articleInfo, currentUser, mutableSettings;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, data.json()];
            case 1:
                userInfo = _a.sent();
                basicInfo = userInfo[0];
                articleInfo = userInfo[1];
                try {
                    currentUser = getCookies().jwt[1].id == userInfo[2].id;
                }
                catch (e) {
                    currentUser = false;
                }
                mutableSettings = userInfo[2];
                setupBasicInfo(basicInfo, currentUser);
                setupArticleTable(articleInfo, currentUser);
                setupMutableOptions(mutableSettings);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Sets up table containing info found in basicInfo
 *
 * @param basicInfo - object containing @see BasicUserInfo interface. Belongs to user whose profile is being viewed
 * @param currentUser - boolean if user is visiting own profile
 */
function setupBasicInfo(basicInfo, currentUser) {
    // while checking username, might as well add Delete th for article table if user's viewing own profile
    if (currentUser) {
        Array.from(document.getElementsByClassName("onlyForOwnUser"))
            .forEach(function (elt) { return elt.classList.remove("onlyForOwnUser"); });
    }
    var tableHTML = "";
    // takes care of first table (of basic user info)
    for (var bit in basicInfo) {
        var tableCell = "<td>" + basicInfo[bit] + "</td>";
        // Username field always gets sent, but value is null if user viewing isn't logged in
        if (bit == "USERNAME" && !basicInfo[bit]) {
            tableCell = "";
            continue;
        }
        tableHTML += tableCell;
    }
    document.querySelector("#basicInfo tbody").innerHTML = tableHTML;
}
/**
 * Sets up table with info about articles user has published
 *
 * @param articleInfo - array of objects containing URL, CREATED, TAGS, VIEWS, ART_ID, ISSUE of articles user has published
 * @param currentUser - @see setupBasicInfo
 */
function setupArticleTable(articleInfo, currentUser) {
    var tableHTML = "";
    // take care of info about articles the user has published
    articleInfo.forEach(function (article) {
        var rowHTML = "<tr>";
        // issue and id shouldn't appear in the table
        Object.defineProperty(article, "issue", {
            enumerable: false
        });
        Object.defineProperty(article, "art_id", {
            enumerable: false
        });
        for (var bit in article) {
            if (bit == "url") {
                article[bit] = "<a href=\"/issue/" + article.issue + "/story/" + article[bit] + "\">\n                                 " + decodeURIComponent(article[bit]) + "\n                                </a>";
            }
            rowHTML += "<td>" + article[bit] + "</td>";
        }
        // if user is viewing own profile
        if (currentUser) {
            rowHTML += "<td>\n                            <input type=\"checkbox\" name=\"delArt[]\" value=\"" + article.art_id + "\" />\n                        </td>";
        }
        tableHTML += rowHTML + "</tr>";
    });
    document.querySelector("#articleInfo tbody").innerHTML = tableHTML;
}
/**
 * Sets up info that user can change. Only the user whose profile it is should have this
 */
function setupMutableOptions(mutableSettings) {
    if (mutableSettings) {
        // fill in vals for options
        document.getElementsByName("userEmail")[0].value = mutableSettings.email;
        document.getElementsByName("2fa")[0].checked = !!mutableSettings.twoFactor;
        document.getElementsByName("notifications")[0].checked = !!mutableSettings.notificationStatus;
        document.getElementsByName("delAcc")[0].value = mutableSettings.id;
    }
}
//# sourceMappingURL=profile.js.map