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
import { multiElementAction, addChangedEvent } from './stormScripts';
var lastInPath = window.location.pathname.substr(window.location.pathname.lastIndexOf("/") + 1);
setupPage(lastInPath);
// last thing in path in many cases won't be a number, in which case backend will anyways ignore it
function setupPage(num) {
    fetch("../api/articleGroup?articlesFor=" + num, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    }).then(function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedData, e_1, articleInfo, tags, issueInfo, pubSelect;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, data.json()];
                    case 1:
                        parsedData = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 3:
                        articleInfo = parsedData[0], tags = parsedData[1], issueInfo = parsedData[2];
                        document.querySelector("input[name=issueName]").value = issueInfo.NAME;
                        // if issue is public, don't let changes to issue name or public status
                        if (issueInfo.ISPUBLIC == 1) {
                            pubSelect = document.getElementsByName("pub")[0];
                            pubSelect.options[1].selected = true;
                            pubSelect.disabled = false;
                            document.querySelector("input[name=issueName]").disabled = true;
                        }
                        multiElementAction(document.getElementsByClassName("issue"), function (elt) {
                            elt.max = issueInfo.MAX;
                            elt.value = issueInfo.NUM;
                        });
                        setupArticleTable(articleInfo, issueInfo, tags);
                        return [2 /*return*/];
                }
            });
        });
    });
}
/**
 * Puts info into table
 *
 * @param articleInfo - array of objects containing URL, CREATED, AUTHOR_NAME, TAGS, VIEWS, DISPLAY_ORDER, ART_ID, AUTHOR_USERNAME
 *   of all articles in the issue requested
 * @param issueInfo -  object containing NAME, ISPUBLIC, and NUM of the issue plus MAX issue
 * @param tags - array of all tags that have been used in any article
 */
function setupArticleTable(articleInfo, issueInfo, tags) {
    var tagOptions = "";
    tags.forEach(function (tag) {
        tagOptions += "<option name=\"" + tag + "\">" + tag + "</option>";
    });
    var select = "<select multiple name=\"tag[]\" required>\n                                " + tagOptions + "\n                        </select>";
    var tableHTML = "", tr = "";
    articleInfo.forEach(function (article) {
        tr += "<tr>";
        var _loop_1 = function (bit) {
            var td = "<td>";
            switch (bit) {
                case "URL":
                    td += "<a href=\"/issue/" + issueInfo.NUM + "/story/" + article.URL + "\">\n                                 " + decodeURIComponent(article[bit]) + "\n                               </a>";
                    break;
                case "AUTHOR_NAME":
                    td += "<a href=\"/u/" + article.AUTHOR_USERNAME + "\">" + article[bit] + "</a>";
                    break;
                case "DISPLAY_ORDER":
                    td += "<input type=\"number\" value=\"" + article[bit] + "\" name=\"order[]\" />";
                    break;
                case "TAGS":
                    var clone_1 = select;
                    // marks each tag that the article has as selected
                    article[bit].split(", ").forEach(function (tag) {
                        var regexName = new RegExp("name=\"" + tag + "\"");
                        clone_1 = clone_1.replace(regexName, regexName + " selected ");
                    });
                    td += clone_1;
                    break;
                case "ART_ID":
                    td += "<input type=\"checkbox\" value=\"" + article[bit] + "\" name=\"delArt[]\" />";
                    td += "<input type=\"hidden\" name=\"artId[]\" value=\"" + article.ART_ID + "\" />";
                    tr += td + "</td>";
                    return "break-article"; // once it reaches here, don't go to rest of object (which is just AUTHOR_USERNAME), which isn't meant for direct user viewing
                default:
                    td += article[bit];
            }
            tr += td + "</td>";
            td = ""; // reset for next iteration
        };
        article: for (var bit in article) {
            var state_1 = _loop_1(bit);
            switch (state_1) {
                case "break-article": break article;
            }
        }
        tableHTML += tr + "</tr>";
        tr = "";
    });
    document.getElementsByTagName("tbody")[0].innerHTML = tableHTML; // putting all html in one go is good performance
    addChangedEvent();
}
document.getElementById("leader").addEventListener("change", function () {
    document.getElementById("copycat").value = this.value;
});
// lets user go to different issue's info by inputting the issue number into input box
document.getElementById("issueInpt").addEventListener("change", function () {
    var elt = this;
    if (elt.value <= elt.max) {
        setupPage(elt.value);
    }
});
document.getElementById("updateIssueForm").addEventListener("submit", function () {
    var event = document.createEvent("HTMLEvents");
    event.initEvent("submit", true, true);
    document.getElementById("articleForm").dispatchEvent(event);
});
//# sourceMappingURL=modifyArticles.js.map