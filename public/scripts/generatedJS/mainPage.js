"use strict";
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
var num = window.location.pathname.substr(window.location.pathname.lastIndexOf("/") + 1);
fetch("../api/previews?issueNum=" + num, {
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then(function (data) { return __awaiter(_this, void 0, void 0, function () {
    var parsedData, e_1, currentIssue;
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
                return [2 /*return*/];
            case 3:
                document.getElementById("issueName").textContent = parsedData.name;
                currentIssue = parsedData.articles.length > 0 ? parsedData.articles[0].ISSUE : parsedData.maxIssue;
                setupPreviews(parsedData.articles);
                createSlideshow(parsedData.slides);
                setupNumberLine(currentIssue, parsedData.maxIssue);
                return [2 /*return*/];
        }
    });
}); });
;
/**
 * Sets up boxes in mainPage thor tag
 *
 * @param articlePreviews - object containing each article of an issue's URL, LEDE, VIEWS, and ISSUE
 */
function setupPreviews(articlePreviews) {
    if (articlePreviews === void 0) { articlePreviews = []; }
    var previewBox = document.getElementById("template");
    articlePreviews.forEach(function (article) {
        var previewBoxClone = previewBox.cloneNode(true);
        previewBoxClone.removeAttribute("id");
        previewBoxClone.querySelector(".content").innerHTML = article.LEDE;
        previewBoxClone.querySelector("a.small").href =
            "/issue/" + article.ISSUE + "/story/" + article.URL;
        previewBoxClone.querySelector("span.small").textContent = "(" + article.VIEWS + " views)";
        document.getElementById("mainContent").appendChild(previewBoxClone);
    });
}
/**
 * Creates a slideshow consisting of all pictures in articles of either the issue or tag that a user selects
 *   except for images whose corresponding index in SLIDE_IMG is 0
 *
 * @param slideInfo - object consisting of each article's IMG_URL, URL, ISSUE, SLIDE_IMG, if applicable
 */
function createSlideshow(slideInfo) {
    if (slideInfo === void 0) { slideInfo = []; }
    if (slideInfo.length == 0) {
        return;
    }
    var i = 0;
    var pics = [];
    var counter = -1;
    slideInfo.forEach(function (picArray) {
        var decodedPics = JSON.parse(picArray.IMG_URL);
        var show = JSON.parse(picArray.SLIDE_IMG);
        decodedPics.forEach(function (pic, indTwo) {
            if (show[indTwo] === 0) {
                return;
            }
            var img = "<img src=\"" + pic + "\" alt=\"Picture from " + picArray.URL + "\" id=\"" + ++counter + "\" class=\"slideshowPic\" />";
            var picWithLink = "<a href='/issue/" + picArray.ISSUE + "/story/" + picArray.URL + "'>" + img + "</a>";
            document.getElementById("slideLink").innerHTML += picWithLink;
            pics.push(counter);
        });
    });
    var mod = (pics.length > 1) ? pics.length : 1; // when to loop back to beginning of slideshow
    if (pics.length > 0) {
        document.getElementById("placeholderPic").style.display = "none";
    }
    else {
        document.getElementById("placeholderPic").className += " activePic";
    }
    i++;
    // perhaps move to ln ~90 since already loop there
    // convert from nodeList to array since no forEach available in nodeList
    Array.from(document.getElementsByClassName("slideshowPic")).forEach(function (elt, i) {
        // deals with any inline styles that someone put on while editing article
        elt.style.width = "500px";
        elt.style.height = "320px";
        if (i == 0) {
            elt.className += " activePic";
        }
    });
    function switchSlide() {
        var pic;
        // if there's no pictures in issue, either make error by selecting nonexistant elt by id,
        // or try to access null id
        pic = document.getElementById("" + pics[i % mod]);
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
    var i = 1;
    var issueLinks = "";
    while (i <= maxIssue) {
        issueLinks += "<a href=\"/issue/" + i + "\">" + i + "</a>";
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