

import {getCookies, edit, message, multiElementAction} from './stormScripts';

const info = location.pathname.split("/");

const artInfo = {'name':info[4], 'issue':info[2]};

let jwt: any = {};

(async function() {
    jwt = (await getCookies());
}());

interface CommentInfo {
        authorid: string,
        author_name: string,
        content: string,
        created: string,
        id: string,
        profile_link: string
};

interface ArticleInfo {
    body: string,
    can_edit: boolean,
    comments: Array<CommentInfo> // or it can be empty array
    id: string,
    tags: string,
};

fetch(`../../../api/story?name=${artInfo.name}&issue=${artInfo.issue}`, {

    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then(async (data: any) => {

    const parsedData: ArticleInfo = await data.json();
    const loggedIn = !!jwt.id;

    // puts the article's id as id of comment reply
    document.getElementsByClassName("content")[0].id = parsedData.id;


    setupCommentsCreated(parsedData.comments);

    setupReplying(loggedIn);

    setupArticle(parsedData.body, parsedData.tags, parsedData.can_edit);
});


/**
 * Loads article, it's tags and allows editing if have permission
 *
 * @param body - the entire article
 * @param tags - string of comma separated tags the article has
 * @param canEdit - boolean if user can edit the article
 */
function setupArticle(body: string, tags: string, canEdit: boolean) {

    document.getElementById("tags")!.textContent += tags;

    const heading = body.match(/<h1>[\s\S]+?<\/h4>/)!;

    const formattedBody = body.replace(heading[0], "");

    const storyContainer = document.getElementById("story")!
    storyContainer.innerHTML = heading + storyContainer!.innerHTML;

    const articleBody = document.getElementsByTagName("section")[0];
    articleBody.innerHTML = formattedBody;

    const imagesInLede = document.querySelector(".storyContainer > p:first-of-type > img");

    if (imagesInLede) {

        // put it before the entire article
        storyContainer.insertBefore(<Node>document.querySelector(".storyContainer > p:first-of-type > img"), articleBody);
    }


    if (canEdit) {
        edit('#story', '../../../api/story', {'name':info[4], 'issue':+info[2], 'selector':"article"});
    }

}

/**
 * Loads comments already created in response to current article
 *
 * @param parsedData - @see CommentInfo interface
 */
function setupCommentsCreated(commentInfo: Array<CommentInfo>) {

    if (!commentInfo) {
        return true;
    }

    let comments = "";

    commentInfo.forEach(function(comment) {

        comments += `<article class="comment" id="${comment.id}">
                        <span class="author">
                            <a href="../u/${comment.profile_link}">${comment.author_name}</a>
                        </span>
                        <div class="content">${comment.content}</div>`;

        if (comment.authorid == jwt.id || jwt.level && jwt.level > 2) {
            comments += `<button class="deleteReply">Delete</button>`;
        }

        comments += "</article>";
    });

    document.getElementById("comments")!.innerHTML += comments;
}

/**
 * Sets up stuff so viewers can reply
 *
 * @param loggedIn - boolean. If false, user cannot reply
 */
function setupReplying(loggedIn: boolean) {


    if (loggedIn) {

        const reply = document.getElementById("reply");

        document.getElementById("comments")!.appendChild(<Node>reply);
        reply!.style.display = "block";

        setupDeletionForComments();
    }

    multiElementAction(document.querySelectorAll(".commentButtonHolder button"), (button: HTMLButtonElement) => {

        button.addEventListener("click", function(this: HTMLButtonElement) {

            let linkInfo: any = null;

            if (this.className === "createLink") {
                linkInfo = prompt(`Insert where you would like to link to
                (make sure to include the https:// if linking to an outside site)`);
            }

            document.execCommand(this.className, false, linkInfo);
        });
    });

    multiElementAction(document.getElementsByClassName("reply"), function(reply: HTMLButtonElement) {

        reply.addEventListener("click", function() {

            const content = document.querySelector("#reply .content")!.innerHTML;

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

interface CommentReply {
    issue: number,
    url: string,
    content: string
}

/**
 * Sends comment to be saved in db
 *
 * @param commentInfo - @see CommentReply
 */
function sendReply(commentInfo: CommentReply) {


    fetch("../../../api/comment", {

        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(commentInfo)

    }).then(async(data) => {

        const commentId: string = await data.text();


        if (!commentId) {
            return;
        }

        const newComment = `<article class="comment" id="${commentId}">
                                <span class="author">
                                    <a href="../u/${jwt.email}">You</a>
                                </span>
                                <div class="content">${commentInfo.content}</div>
                                <button class="deleteReply">Delete</button>
                            </article>`;

        const commentContainer = document.getElementById("comments")!;
        commentContainer.innerHTML += newComment;

        const replyBox = document.getElementById("reply")!;

        replyBox.getElementsByClassName("content")[0].innerHTML = "";
        commentContainer.appendChild(<Node>replyBox);

        setupDeletionForComments();
        setupReplying(!!jwt.id);
    });
}

/**
 * If article is deleted, notify server and if proper deletion, remove from article
 */
function setupDeletionForComments() {

    multiElementAction(document.getElementsByClassName("deleteReply"), (elt: HTMLButtonElement) => {


        elt.addEventListener("click", function(this: HTMLButtonElement) {

            const commentId = (<HTMLElement>this.parentNode).id;

            fetch("../../../api/comment", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({id: commentId})
            }).then(async (success) => {

                if (await success.status == 200) {
                    document.getElementById(commentId)!.innerHTML = "deleted";
                }
            });

        });
    });
}

