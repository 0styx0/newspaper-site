
import { multiElementAction, addChangedEvent } from './stormScripts';

const lastInPath = window.location.pathname.substr(window.location.pathname.lastIndexOf("/") + 1);

setupPage(lastInPath);



// last thing in path in many cases won't be a number, in which case backend will anyways ignore it
function setupPage(num: string | number) {

    fetch(`../api/articleGroup?articlesFor=${num}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
    }).then(async function(data) {

        let parsedData;

        try {
            parsedData = await data.json();
        }
        // if there's no articles then there will be a json parsing problem
        catch(e) {
            return false;
        }

        const [articleInfo, tags, issueInfo] = parsedData;

        (<HTMLInputElement>document.querySelector("input[name=issueName]")).value = issueInfo.NAME;

        // if issue is public, don't let changes to issue name or public status
        if (issueInfo.ISPUBLIC == 1) {

            const pubSelect = <HTMLSelectElement> document.getElementsByName("pub")[0];

            pubSelect.options[1].selected = true;
            pubSelect.disabled = false;
            (<HTMLInputElement>document.querySelector("input[name=issueName]")).disabled = true;
        }

        multiElementAction(document.getElementsByClassName("issue"), (elt: HTMLInputElement) => {
            elt.max = issueInfo.MAX;
            elt.value = issueInfo.NUM;
        });

        setupArticleTable(articleInfo, issueInfo, tags);
    });
}


interface ArticleInfo {
    [properties: string]: string | number
    URL: string,
    CREATED: string,
    AUTHOR_NAME: string,
    TAGS: string,
    VIEWS: number,
    DISPLAY_ORDER: number,
    ART_ID: string,
    AUTHOR_USERNAME: string
}

interface IssueInfo {

    NAME: string | null,
    ISPUBLIC: number,
    NUM: number,
    MAX: number
}

/**
 * Puts info into table
 *
 * @param articleInfo - array of objects containing URL, CREATED, AUTHOR_NAME, TAGS, VIEWS, DISPLAY_ORDER, ART_ID, AUTHOR_USERNAME
 *   of all articles in the issue requested
 * @param issueInfo -  object containing NAME, ISPUBLIC, and NUM of the issue plus MAX issue
 * @param tags - array of all tags that have been used in any article
 */
function setupArticleTable(articleInfo: Array<ArticleInfo>, issueInfo: IssueInfo, tags: string[]) {


        let tagOptions = "";

        tags.forEach(function(tag) {
            tagOptions += `<option name="${tag}">${tag}</option>`;
        });

        const select = `<select multiple name="tag[]" required>
                                ${tagOptions}
                        </select>`;

        let tableHTML = "", tr="";

        articleInfo.forEach(function(article) {

            tr += "<tr>";

            article:
            for (const bit in article) {


                let td = "<td>";

                switch (bit) {

                    case "URL":

                        td += `<a href="/issue/${issueInfo.NUM}/story/${article.URL}">
                                 ${decodeURIComponent(article[bit])}
                               </a>`;
                        break;

                    case "AUTHOR_NAME":

                        td += `<a href="/u/${article.AUTHOR_USERNAME}">${article[bit]}</a>`;
                        break;

                    case "DISPLAY_ORDER":

                        td += `<input type="number" value="${article[bit]}" name="order[]" />`;
                        break;

                    case "TAGS":

                        let clone = select;

                        // marks each tag that the article has as selected
                        article[bit].split(", ").forEach(function(tag) {

                            const regexName = new RegExp(`name="${tag}"`);
                            clone = clone.replace(regexName, regexName + " selected ");

                        });

                        td += clone;

                        break;

                    case "ART_ID":

                        td += `<input type="checkbox" value="${article[bit]}" name="delArt[]" />`;
                        td += `<input type="hidden" name="artId[]" value="${article.ART_ID}" />`;

                        tr += td + "</td>";
                        break article; // once it reaches here, don't go to rest of object (which is just AUTHOR_USERNAME), which isn't meant for direct user viewing

                     default:
                        td += article[bit];
                }

                tr += td + "</td>";
                td = ""; // reset for next iteration
            }

            tableHTML += tr + "</tr>";
            tr = "";
        });

        document.getElementsByTagName("tbody")[0].innerHTML = tableHTML; // putting all html in one go is good performance

        addChangedEvent();
}


document.getElementById("leader")!.addEventListener("change", function() {

    (<HTMLInputElement>document.getElementById("copycat")).value = (<HTMLInputElement>this).value;
});


// lets user go to different issue's info by inputting the issue number into input box
document.getElementById("issueInpt")!.addEventListener("change", function() {

    const elt = <HTMLInputElement> this;

    if (elt.value <= elt.max) {
        setupPage(elt.value);
    }
});

document.getElementById("updateIssueForm")!.addEventListener("submit", function() {

    const event = document.createEvent("HTMLEvents");
    event.initEvent("submit", true, true);
    document.getElementById("articleForm")!.dispatchEvent(event);
});