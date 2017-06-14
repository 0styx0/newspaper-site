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
import { getCookies, edit, message, multiElementAction } from './stormScripts';
var info = location.pathname.split("/");
var artInfo = { 'name': info[4], 'issue': info[2] };
var jwt = getCookies().jwt[1];
;
;
fetch("../../../api/story?name=" + artInfo.name + "&issue=" + artInfo.issue, {
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then(function (data) { return __awaiter(_this, void 0, void 0, function () {
    var parsedData, loggedIn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, data.json()];
            case 1:
                parsedData = _a.sent();
                loggedIn = !!jwt.id;
                // puts the article's id as id of comment reply
                document.getElementsByClassName("content")[0].id = parsedData.ID;
                setupCommentsCreated(parsedData.COMMENTS);
                setupReplying(loggedIn);
                setupArticle(parsedData.BODY, parsedData.TAGS, parsedData.CAN_EDIT);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Loads article, it's tags and allows editing if have permission
 *
 * @param body - the entire article
 * @param tags - string of comma separated tags the article has
 * @param canEdit - boolean if user can edit the article
 */
function setupArticle(body, tags, canEdit) {
    document.getElementById("tags").textContent += tags;
    var heading = body.match(/<h1>[\s\S]+?<\/h4>/);
    var formattedBody = body.replace(heading[0], "");
    var storyContainer = document.getElementById("story");
    storyContainer.innerHTML = heading + storyContainer.innerHTML;
    var articleBody = document.getElementsByTagName("section")[0];
    articleBody.innerHTML = formattedBody;
    var imagesInLede = document.querySelector(".storyContainer > p:first-of-type > img");
    if (imagesInLede) {
        // put it before the entire article
        storyContainer.insertBefore(document.querySelector(".storyContainer > p:first-of-type > img"), articleBody);
    }
    if (canEdit) {
        edit('#story', '../../../api/story', { 'name': info[4], 'issue': +info[2], 'selector': "article" });
    }
}
/**
 * Loads comments already created in response to current article
 *
 * @param parsedData - @see CommentInfo interface
 */
function setupCommentsCreated(commentInfo) {
    if (!commentInfo) {
        return true;
    }
    var comments = "";
    commentInfo.forEach(function (comment) {
        comments += "<article class=\"comment\" id=\"" + comment.id + "\">\n                        <span class=\"author\">\n                            <a href=\"/u/" + comment.profile_link + "\">" + comment.author_name + "</a>\n                        </span>\n                        <div class=\"content\">" + comment.content + "</div>";
        if (comment.authorid == jwt.id || jwt.level && jwt.level > 2) {
            comments += "<button class=\"deleteReply\">Delete</button>";
        }
        comments += "</article>";
    });
    document.getElementById("comments").innerHTML += comments;
}
/**
 * Sets up stuff so viewers can reply
 *
 * @param loggedIn - boolean. If false, user cannot reply
 */
function setupReplying(loggedIn) {
    if (loggedIn) {
        var reply = document.getElementById("reply");
        document.getElementById("comments").appendChild(reply);
        reply.style.display = "block";
        setupDeletionForComments();
    }
    multiElementAction(document.querySelectorAll(".commentButtonHolder button"), function (button) {
        button.addEventListener("click", function () {
            var linkInfo = null;
            if (this.className === "createLink") {
                linkInfo = prompt("Insert where you would like to link to\n                (make sure to include the https:// if linking to an outside site)");
            }
            document.execCommand(this.className, false, linkInfo);
        });
    });
    multiElementAction(document.getElementsByClassName("reply"), function (reply) {
        reply.addEventListener("click", function () {
            var content = document.querySelector("#reply .content").innerHTML;
            if (content.length < 4 || content.length > 500) {
                message(400, "Invalid Comment");
                return;
            }
            var commentInfo = {
                content: content,
                url: artInfo.name,
                issue: +artInfo.issue,
            };
            sendReply(commentInfo);
        });
    });
}
/**
 * Sends comment to be saved in db
 *
 * @param commentInfo - @see CommentReply
 */
function sendReply(commentInfo) {
    var _this = this;
    fetch("../../../api/comment", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(commentInfo)
    }).then(function (data) { return __awaiter(_this, void 0, void 0, function () {
        var commentId, newComment, commentContainer, replyBox;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, data.text()];
                case 1:
                    commentId = _a.sent();
                    if (!commentId) {
                        return [2 /*return*/];
                    }
                    newComment = "<article class=\"comment\" id=\"" + commentId + "\">\n                                <span class=\"author\">\n                                    <a href=\"/u/" + jwt.email + "\">You</a>\n                                </span>\n                                <div class=\"content\">" + commentInfo.content + "</div>\n                                <button class=\"deleteReply\">Delete</button>\n                            </article>";
                    commentContainer = document.getElementById("comments");
                    commentContainer.innerHTML += newComment;
                    replyBox = document.getElementById("reply");
                    replyBox.getElementsByClassName("content")[0].innerHTML = "";
                    commentContainer.appendChild(replyBox);
                    setupDeletionForComments();
                    setupReplying(!!jwt.id);
                    return [2 /*return*/];
            }
        });
    }); });
}
/**
 * If article is deleted, notify server and if proper deletion, remove from article
 */
function setupDeletionForComments() {
    multiElementAction(document.getElementsByClassName("deleteReply"), function (elt) {
        elt.addEventListener("click", function () {
            var _this = this;
            var commentId = this.parentNode.id;
            fetch("../../../api/comment", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: commentId })
            }).then(function (success) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, success.status];
                        case 1:
                            if ((_a.sent()) == 200) {
                                document.getElementById(commentId).innerHTML = "deleted";
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
}
//# sourceMappingURL=story.js.map