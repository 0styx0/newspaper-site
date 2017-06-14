var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCookies, edit, message, multiElementAction } from './stormScripts';
const info = location.pathname.split("/");
const artInfo = { 'name': info[4], 'issue': info[2] };
const jwt = getCookies().jwt[1];
;
;
fetch(`../../../api/story?name=${artInfo.name}&issue=${artInfo.issue}`, {
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then((data) => __awaiter(this, void 0, void 0, function* () {
    const parsedData = yield data.json();
    const loggedIn = !!jwt.id;
    // puts the article's id as id of comment reply
    document.getElementsByClassName("content")[0].id = parsedData.ID;
    setupCommentsCreated(parsedData.COMMENTS);
    setupReplying(loggedIn);
    setupArticle(parsedData.BODY, parsedData.TAGS, parsedData.CAN_EDIT);
}));
/**
 * Loads article, it's tags and allows editing if have permission
 *
 * @param body - the entire article
 * @param tags - string of comma separated tags the article has
 * @param canEdit - boolean if user can edit the article
 */
function setupArticle(body, tags, canEdit) {
    document.getElementById("tags").textContent += tags;
    const heading = body.match(/<h1>[\s\S]+?<\/h4>/);
    const formattedBody = body.replace(heading[0], "");
    const storyContainer = document.getElementById("story");
    storyContainer.innerHTML = heading + storyContainer.innerHTML;
    const articleBody = document.getElementsByTagName("section")[0];
    articleBody.innerHTML = formattedBody;
    const imagesInLede = document.querySelector(".storyContainer > p:first-of-type > img");
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
    let comments = "";
    commentInfo.forEach(function (comment) {
        comments += `<article class="comment" id="${comment.id}">
                        <span class="author">
                            <a href="/u/${comment.profile_link}">${comment.author_name}</a>
                        </span>
                        <div class="content">${comment.content}</div>`;
        if (comment.authorid == jwt.id || jwt.level && jwt.level > 2) {
            comments += `<button class="deleteReply">Delete</button>`;
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
        const reply = document.getElementById("reply");
        document.getElementById("comments").appendChild(reply);
        reply.style.display = "block";
        setupDeletionForComments();
    }
    multiElementAction(document.querySelectorAll(".commentButtonHolder button"), (button) => {
        button.addEventListener("click", function () {
            let linkInfo = null;
            if (this.className === "createLink") {
                linkInfo = prompt(`Insert where you would like to link to
                (make sure to include the https:// if linking to an outside site)`);
            }
            document.execCommand(this.className, false, linkInfo);
        });
    });
    multiElementAction(document.getElementsByClassName("reply"), function (reply) {
        reply.addEventListener("click", function () {
            const content = document.querySelector("#reply .content").innerHTML;
            if (content.length < 4 || content.length > 500) {
                message(400, "Invalid Comment");
                return;
            }
            const commentInfo = {
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
    fetch("../../../api/comment", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(commentInfo)
    }).then((data) => __awaiter(this, void 0, void 0, function* () {
        const commentId = yield data.text();
        if (!commentId) {
            return;
        }
        const newComment = `<article class="comment" id="${commentId}">
                                <span class="author">
                                    <a href="/u/${jwt.email}">You</a>
                                </span>
                                <div class="content">${commentInfo.content}</div>
                                <button class="deleteReply">Delete</button>
                            </article>`;
        const commentContainer = document.getElementById("comments");
        commentContainer.innerHTML += newComment;
        const replyBox = document.getElementById("reply");
        replyBox.getElementsByClassName("content")[0].innerHTML = "";
        commentContainer.appendChild(replyBox);
        setupDeletionForComments();
        setupReplying(!!jwt.id);
    }));
}
/**
 * If article is deleted, notify server and if proper deletion, remove from article
 */
function setupDeletionForComments() {
    multiElementAction(document.getElementsByClassName("deleteReply"), (elt) => {
        elt.addEventListener("click", function () {
            const commentId = this.parentNode.id;
            fetch("../../../api/comment", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: commentId })
            }).then((success) => __awaiter(this, void 0, void 0, function* () {
                if ((yield success.status) == 200) {
                    document.getElementById(commentId).innerHTML = "deleted";
                }
            }));
        });
    });
}
//# sourceMappingURL=story.js.map