"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const num = window.location.pathname.substr(window.location.pathname.lastIndexOf("/") + 1);
fetch(`../api/previews?issueNum=${num}`, {
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then((data) => __awaiter(this, void 0, void 0, function* () {
    let parsedData;
    try {
        parsedData = yield data.json();
    }
    catch (e) {
        return;
    }
    document.getElementById("issueName").textContent = parsedData.name;
    // if no articles in the issue yet, make it the max
    const currentIssue = parsedData.articles.length > 0 ? parsedData.articles[0].ISSUE : parsedData.maxIssue;
    setupPreviews(parsedData.articles);
    createSlideshow(parsedData.slides);
    setupNumberLine(currentIssue, parsedData.maxIssue);
}));
;
/**
 * Sets up boxes in mainPage thor tag
 *
 * @param articlePreviews - object containing each article of an issue's URL, LEDE, VIEWS, and ISSUE
 */
function setupPreviews(articlePreviews = []) {
    const previewBox = document.getElementById("template");
    articlePreviews.forEach(function (article) {
        const previewBoxClone = previewBox.cloneNode(true);
        previewBoxClone.removeAttribute("id");
        previewBoxClone.querySelector(".content").innerHTML = article.LEDE;
        previewBoxClone.querySelector("a.small").href =
            `/issue/${article.ISSUE}/story/${article.URL}`;
        previewBoxClone.querySelector("span.small").textContent = `(${article.VIEWS} views)`;
        document.getElementById("mainContent").appendChild(previewBoxClone);
    });
}
/**
 * Creates a slideshow consisting of all pictures in articles of either the issue or tag that a user selects
 *   except for images whose corresponding index in SLIDE_IMG is 0
 *
 * @param slideInfo - object consisting of each article's IMG_URL, URL, ISSUE, SLIDE_IMG, if applicable
 */
function createSlideshow(slideInfo = []) {
    if (slideInfo.length == 0) {
        return;
    }
    let i = 0;
    let pics = [];
    let counter = -1;
    slideInfo.forEach(function (picArray) {
        const decodedPics = JSON.parse(picArray.IMG_URL);
        const show = JSON.parse(picArray.SLIDE_IMG);
        decodedPics.forEach(function (pic, indTwo) {
            if (show[indTwo] === 0) {
                return;
            }
            const img = `<img src="${pic}" alt="Picture from ${picArray.URL}" id="${++counter}" class="slideshowPic" />`;
            const picWithLink = `<a href='/issue/${picArray.ISSUE}/story/${picArray.URL}'>${img}</a>`;
            document.getElementById("slideLink").innerHTML += picWithLink;
            pics.push(counter);
        });
    });
    let mod = (pics.length > 1) ? pics.length : 1; // when to loop back to beginning of slideshow
    if (pics.length > 0) {
        document.getElementById("placeholderPic").style.display = "none";
    }
    else {
        document.getElementById("placeholderPic").className += " activePic";
    }
    i++;
    // perhaps move to ln ~90 since already loop there
    // convert from nodeList to array since no forEach available in nodeList
    Array.from(document.getElementsByClassName("slideshowPic")).forEach((elt, i) => {
        // deals with any inline styles that someone put on while editing article
        elt.style.width = "500px";
        elt.style.height = "320px";
        if (i == 0) {
            elt.className += " activePic";
        }
    });
    function switchSlide() {
        let pic;
        // if there's no pictures in issue, either make error by selecting nonexistant elt by id,
        // or try to access null id
        pic = document.getElementById(`${pics[i % mod]}`);
        if (!pic) {
            pic = document.getElementById("placeholderPic");
        }
        pic.classList.toggle("activePic");
        this.classList.toggle("activePic");
        pic.addEventListener("animationiteration", switchSlide, false);
        i++;
    }
    document.getElementsByClassName("activePic")[0].addEventListener("animationiteration", switchSlide, false);
}
/**
 * Appends a number line to the buttom of the page with links to a few other issues
 *
 * @param curIssue - current issue being displayed
 * @param maxIssue - the maximum issue a user can see
 */
function setupNumberLine(curIssue, maxIssue) {
    let i = 1;
    let issueLinks = "";
    while (i <= maxIssue) {
        issueLinks += `<a href="/issue/${i}">${i}</a>`;
        if (i === 3 && curIssue - 2 <= maxIssue && curIssue - 2 > i) {
            issueLinks += '...';
            i = curIssue - 2;
        }
        else if (i === curIssue + 1 && maxIssue - 3 > i) {
            issueLinks += '...';
            i = maxIssue - 3;
        }
        else {
            issueLinks += ' ';
        }
        i++;
    }
    document.getElementById("issueRange").innerHTML = issueLinks;
}
//# sourceMappingURL=mainPage.js.map