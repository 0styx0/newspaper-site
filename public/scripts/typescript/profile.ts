
import { getCookies } from './stormScripts';

const path = window.location.pathname.split("/");
fetch(`../api/user?user=${path[2]}`, {
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then(async (data) => {

    const userInfo = await data.json();

    const basicInfo = userInfo[0];
    const articleInfo = userInfo[1];

    let currentUser;
    try {
        currentUser = (await getCookies()).id == userInfo[2].id;
    }
    catch (e) {
        currentUser = false;
    }

    const mutableSettings = userInfo[2];

    setupBasicInfo(basicInfo, currentUser);
    setupArticleTable(articleInfo, currentUser);
    setupMutableOptions(mutableSettings);
});

interface BasicUserInfo {
    [properties: string]: number | string | undefined
    articles: number,
    level?: number
    name: string,
    username?: string,
    views: number
}

/**
 * Sets up table containing info found in basicInfo
 *
 * @param basicInfo - object containing @see BasicUserInfo interface. Belongs to user whose profile is being viewed
 * @param currentUser - boolean if user is visiting own profile
 */
function setupBasicInfo(basicInfo: BasicUserInfo, currentUser: boolean) {

    // while checking username, might as well add Delete th for article table if user's viewing own profile
    if (currentUser) {
        Array.from(document.getElementsByClassName("onlyForOwnUser"))
          .forEach(elt => elt.classList.remove("onlyForOwnUser"));
    }

    let tableHTML = "";

    // takes care of first table (of basic user info)
    for (const bit in basicInfo) {

        let tableCell = `<td>${basicInfo[bit]}</td>`;

        // Username field always gets sent, but value is null if user viewing isn't logged in
        if (bit == "USERNAME" && !basicInfo[bit]) {

            tableCell = "";
            continue;
        }

        tableHTML += tableCell;
    }

    document.querySelector("#basicInfo tbody")!.innerHTML = tableHTML;
}

interface ArticleInfo {
    [properties: string]: string | number
    art_id: string,
    created: string,
    issue: number,
    tags: string,
    url: string,
    views: number
}


/**
 * Sets up table with info about articles user has published
 *
 * @param articleInfo - array of objects containing URL, CREATED, tags, VIEWS, ART_ID, ISSUE of articles user has published
 * @param currentUser - @see setupBasicInfo
 */
function setupArticleTable(articleInfo: Array<ArticleInfo>, currentUser: boolean) {

    let tableHTML = "";

    // take care of info about articles the user has published
    articleInfo.forEach(function(article) {

        let rowHTML = "<tr>";

        // issue and id shouldn't appear in the table
        Object.defineProperty(article, "issue", {
            enumerable: false
        });

        Object.defineProperty(article, "art_id", {
            enumerable: false
        });

        for (const bit in article) {


            if (bit == "url") {

                article[bit] = `<a href="/issue/${article.issue}/story/${article[bit]}">
                                 ${decodeURIComponent(article[bit])}
                                </a>`;
            }

            rowHTML += `<td>${article[bit]}</td>`;
        }

        // if user is viewing own profile
        if (currentUser) {

            rowHTML += `<td>
                            <input type="checkbox" name="delArt[]" value="${article.art_id}" />
                        </td>`;
        }

        tableHTML += rowHTML + "</tr>";
    });

    document.querySelector("#articleInfo tbody")!.innerHTML = tableHTML;
}


// last two are really booleans, only 0 or 1
interface MutableSettings {

    email: string,
    emailConfirmed: boolean,
    id: string, // really number but can't asign number to input value
    notificationStatus: number,
    twoFactor: number
}

/**
 * Sets up info that user can change. Only the user whose profile it is should have this
 */
function setupMutableOptions(mutableSettings: MutableSettings) {

    if (mutableSettings) {
        // fill in vals for options
        (<HTMLInputElement>document.getElementsByName("userEmail")[0]).value = mutableSettings.email;
        (<HTMLInputElement>document.getElementsByName("2fa")[0]).checked = !!mutableSettings.twoFactor;
        (<HTMLInputElement>document.getElementsByName("notifications")[0]).checked = !!mutableSettings.notificationStatus;
        (<HTMLInputElement>document.getElementsByName("delAcc")[0]).value = mutableSettings.id;
    }
}