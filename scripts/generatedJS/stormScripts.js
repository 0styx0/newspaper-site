"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function () {
    const currentNavItem = document.querySelector("nav a[href='" + window.location.pathname + "']");
    if (currentNavItem) {
        currentNavItem.style.color = '#f8ffff';
        currentNavItem.style.backgroundColor = '#212d23';
    }
    // for when user is browsing articles by tag
    const queryTag = location.pathname.split("tag/");
    const currentTagOption = document.querySelector("option[value=" + queryTag[1] + "]");
    if (currentTagOption) {
        currentTagOption.selected = true;
    }
    Array.from(document.querySelectorAll(":required")).forEach((elt) => {
        const label = elt.parentNode;
        label.innerHTML += "<span class='danger'>*</span>";
    });
    if (window.innerWidth <= 900) {
        // prevent menubar being initially open on pageload
        Array.from(document.querySelectorAll("#menuToggle ~ li")).forEach((elt) => elt.setAttribute("display", "none"));
        // after user clicks on menubar, take away above effect and make it function normally (css animations)
        document.getElementById("menuToggle").addEventListener("change", function menuChange() {
            Array.from(document.querySelectorAll("#menuToggle ~ li")).forEach((elt) => elt.style.display = "block");
            const curElt = this;
            curElt.checked = false;
            this.removeEventListener("change", menuChange);
        });
    }
}());
/**
 * Executes the callback on all elements in eltGroup
 *
 * @param nodeGroup - nodeList
 * @param callback - executes this once per node in the list
 */
export function multiElementAction(nodeGroup, callback) {
    for (const elt of Array.from(nodeGroup)) {
        callback(elt);
    }
}
if (document.getElementById("passConf")) {
    // if there's a #passConf, check if previous password input has the same value
    document.getElementById("passConf")
        .parentNode
        .parentNode
        .addEventListener("submit", function (event) {
        if (document.getElementById("passConf").value
            !==
                document.getElementById("password").value) {
            message(400, "Invalid Password Confirmation");
            event.preventDefault();
            event.stopImmediatePropagation(); // stops the submit event that leads to convertFormRequestToREST from firing
        }
    });
}
var Method;
(function (Method) {
    Method[Method["POST"] = 0] = "POST";
    Method[Method["PUT"] = 1] = "PUT";
    Method[Method["DELETE"] = 2] = "DELETE";
    Method[Method["GET"] = 3] = "GET";
})(Method || (Method = {}));
;
function convertFormRequestToREST(form) {
    if (form.querySelector("tr + tr") && form.querySelector("input.changed, textarea.changed, select.changed")) {
        const notChanged = document.querySelectorAll("td input:not(.changed), td textarea:not(.changed), td select:not(.changed)");
        multiElementAction(notChanged, (elt) => elt.disabled = true);
    }
    // HTTP[method][key][value] = array
    const HTTP = {
        // this should really be HTTP, but error when that happens
        push: function (method, key, value) {
            if (!method || key === undefined || key === "" || value === undefined || value === "") {
                return false;
            }
            if (!this[method]) {
                this[method] = {};
            }
            if (key.substr(key.length - 2) == "[]" && key != "type[]") {
                if (!this[method][key]) {
                    this[method][key] = [];
                }
                this[method][key].push(value);
            }
            else {
                this[method][key] = value;
            }
        }
    };
    Object.defineProperty(HTTP, "push", {
        enumerable: false
    });
    const submitButtonElt = form.querySelector("[type=submit]");
    const submitButtonName = submitButtonElt && submitButtonElt.name;
    for (let i = 0; i < form.length; i++) {
        const name = form[i].name;
        let value;
        let method = "";
        if (submitButtonName == "create") {
            method = "post";
        }
        else if (name.indexOf("del") === 0 && form[i].checked) {
            method = "delete";
        }
        else if (form[i].name.indexOf("del") == -1) {
            method = "put";
        }
        if (form[i].type == "checkbox") {
            value = (form[i].checked) ? form[i].value : false;
        }
        else if (form[i].multiple && form[i].selectedOptions) {
            value = multiElementAction(form[i].selectedOptions, (elt) => elt.value);
        }
        else {
            value = form[i].value;
        }
        if (form[i].disabled) {
            continue;
        }
        if ([form[i].type, form[i].name].indexOf("password") != -1 && !form.querySelector("[name=authCode]") && submitButtonName != "changePass") {
            for (const method in HTTP) {
                HTTP[method]["password"] = value;
                continue;
            }
        }
        HTTP.push(method, name, value);
    }
    for (const method in HTTP) {
        const action = form.action;
        fetch(action, {
            method: method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(HTTP[method])
        })
            .then(function (result) {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield result;
                const status = res.status;
                const currentURL = window.location.pathname;
                if (status == 201 && currentURL == "/signup" && !getCookies().jwt[1].id) {
                    return window.location.pathname = "/authLogin";
                }
                if (status == 200 && ["/login", "/authLogin"].indexOf(currentURL) != -1) {
                    return window.location.pathname = "/publish";
                }
                if (status == 200 && ["/login", "/signup"].indexOf(currentURL) != -1) {
                    return window.location.pathname = "/authLogin";
                }
                if (HTTP[method].logout) {
                    return window.location.pathname = "/login";
                }
                if (status == 201 && currentURL == "/publish") {
                    const resJSON = yield res.json();
                    return window.location.pathname = resJSON.url;
                }
                resetForm();
                message(result.status, result.statusText);
            });
        });
    }
    return false;
}
/**
 * Wipes away all that occurred because of user interaction from forms
 *   (leaving things that changed because the user submitted it)
 */
function resetForm() {
    multiElementAction(document.querySelectorAll("input:not(.changed), textarea:not(.changed), select:not(.changed)"), (elt) => elt.disabled = false);
    // removes row whose contents were deleted
    multiElementAction(document.querySelectorAll("tr [name^=del]:checked"), (elt) => elt.parentNode.parentNode.remove());
    multiElementAction(document.getElementsByClassName("changed"), (elt) => elt.classList.remove("changed"));
    multiElementAction(document.querySelectorAll("input[type=password]"), (elt) => elt.value = "");
    multiElementAction(document.querySelectorAll(":required"), (elt) => {
        elt.required = false;
        elt.addEventListener("click", function addRequiredAttr() {
            this.required = true;
            removeEventListener("click", addRequiredAttr);
        });
    });
}
multiElementAction(document.getElementsByTagName("form"), function (elt) {
    elt.addEventListener("submit", function (event) {
        convertFormRequestToREST(this);
        event.preventDefault();
        event.stopPropagation();
    });
});
/**
 * When an `abbr element next to an `input is clicked on, its title appears under it
 */
function showTextOfAbbr(elt) {
    multiElementAction(document.getElementsByClassName("abbrMessage"), (elt) => elt.parentNode.removeChild(elt));
    const message = document.createElement('div');
    message.textContent = elt.getAttribute("title");
    message.className = "abbrMessage";
    const nextElt = elt.nextElementSibling;
    const messageSibling = (nextElt && nextElt.className === "danger") ? nextElt : elt;
    messageSibling.parentNode.appendChild(message);
}
multiElementAction(document.querySelectorAll("input + abbr"), function (elt) {
    elt.addEventListener("click", function () {
        showTextOfAbbr(this);
    });
});
/**
 * @return all cookies split into an array. If a cookie is JSON encoded array it is decoded
 */
export function getCookies() {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieSplit = decodedCookie.split("; ");
    const result = {};
    cookieSplit.forEach(function (val) {
        const keyPair = val.split("=");
        if (keyPair[0] == "jwt") {
            const jwt = keyPair[1].split('.')[1]
                .replace('-', '+')
                .replace('_', '/');
            keyPair[1] = JSON.parse(window.atob(jwt));
        }
        result[keyPair[0]] = (keyPair[1][0] == "[") ? JSON.parse(keyPair[1]) : keyPair[1];
    });
    return result;
}
// every 5 minutes check if user will be logged out for inactivity
const checkTimeUntilLogout = window.setInterval(function () {
    const JSTime = Date.now() / 1000;
    const lastAction = getCookies().jwt[0].iat;
    if (JSTime - lastAction < 60000000) {
        message(0, "timeOut");
        clearInterval(checkTimeUntilLogout);
    }
}, 300000);
document.getElementById("artTypes").addEventListener("change", function () {
    window.location.pathname = "/tag/" + this.value;
});
import { commands } from "./execCommands";
/**
 * Sets up editing on html (not for comments, which requires a small subset of this functionality)
 *
 * @param tag - tag to allow editing on
 * @param AJAXtarget - where to submit the html
 * @param info - object of info to send to server
 */
export function edit(tag, AJAXtarget, info) {
    const tagElt = document.querySelector(tag);
    tagElt.setAttribute("contentEditable", "true");
    tagElt.setAttribute("contextmenu", "buttonMenu");
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "buttonContainer";
    buttonContainer.appendChild(document.createElement("br"));
    const submitButton = document.createElement("button");
    submitButton.id = "submitEdit";
    submitButton.textContent = "Submit Changed";
    buttonContainer.appendChild(submitButton);
    document.body.insertBefore(buttonContainer, document.body.children[1]);
    const buttonPrototype = document.createElement("button");
    const menuitemPrototype = document.createElement("menuitem");
    const contextMenu = document.createElement("menu");
    contextMenu.type = "context";
    contextMenu.id = "buttonMenu";
    document.body.appendChild(contextMenu);
    // commands is from /scripts/execCommands.js
    commands.forEach(function (arrVal) {
        if (!document.queryCommandSupported(arrVal.cmd) && arrVal.cmd != "hideFromPreview") {
            return;
        }
        const buttonClone = buttonPrototype.cloneNode();
        buttonClone.textContent = buttonClone.className = arrVal.cmd;
        buttonContainer.insertBefore(buttonClone, submitButton.previousSibling);
        buttonContainer.querySelector("." + arrVal.cmd)
            .addEventListener("click", () => buttonEdits(arrVal));
        // really should be HTMLMenuItemElement, but typescript doesn't have it
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menuitem
        const menuitemClone = menuitemPrototype.cloneNode();
        menuitemClone.label = arrVal.cmd;
        menuitemClone.id = arrVal.cmd + "Menu";
        document.getElementById("buttonMenu").appendChild(menuitemClone);
        document.getElementById(arrVal.cmd + "Menu")
            .addEventListener("click", () => buttonEdits(arrVal));
    });
    submitButton.addEventListener("click", function () {
        // prevent button mashing
        this.disabled = true;
        // info is a parameter from top function (edit)
        info.edit = document.querySelector(info.selector).innerHTML;
        // when editing stories, layout would get messed up if not for this
        info.edit = info.edit.replace(/<section\sclass="storyContainer"[^>]+>|<\/section>|style=""|class=""/gi, "");
        info.edit = info.edit.replace(/<p\s+><\/p>/gi, "");
        info.edit = info.edit.replace(/<p\s>/gi, "<p>");
        fetch(AJAXtarget, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(info)
        })
            .then((status) => __awaiter(this, void 0, void 0, function* () {
            yield status;
            message(status.status, status.statusText);
            this.disabled = false;
        }));
    });
}
function buttonEdits(arrVal) {
    if (arrVal.cmd == "hideFromPreview") {
        return toggleClassOnElementSelected("previewHidden");
    }
    const userInput = (arrVal.val) ? prompt("Value for " + arrVal.cmd + " (" + arrVal.val + ")?") : null;
    const cmdVal = (arrVal.cmd === "heading") ? "h" + userInput : userInput;
    document.execCommand(arrVal.cmd, false, cmdVal);
}
/**
 * Adds a class to user-highlighted element
 *
 * @param className - name of class to add
 */
function toggleClassOnElementSelected(className) {
    const eltAnchor = window.getSelection().anchorNode;
    if (eltAnchor.children) {
        eltAnchor.children[0].classList.toggle(className);
    }
    else {
        const eltToChange = (eltAnchor.nodeType == Node.TEXT_NODE)
            ? eltAnchor.parentNode
            : eltAnchor.lastElementChild;
        eltToChange.classList.toggle(className);
    }
}
/**
 * disables table rows where no inputs in that row were changed. Saves time on server side
 */
export function addChangedEvent() {
    multiElementAction(document.querySelectorAll("table input, table textarea, table select"), function (elt) {
        elt.addEventListener("change", function () {
            let child = this;
            while (child.parentNode && child.nodeName != "TR") {
                child = child.parentNode;
            }
            multiElementAction(child.querySelectorAll("input, textarea, select"), (elt) => elt.className += " changed");
        });
    });
}
/**
 * Shows user a message
 *
 * @param param - key to either userErrors or userSuccess (defined in the function)
 * @param timeToFade - time, in miliseconds of how long the message should last
 */
export function message(httpStatus, httpText = "") {
    const userErrors = {
        "400": {
            "Invalid Username": "Username must be 1 word and less than 20 letters.",
            "Invalid Name": `Must have first and last name, and an optional middle name,
                   which if given must be at most 3 letters.`,
            "Invalid Level": "Level must be 1-3.",
            "Invalid Email": `Email must not belong to any other account on this site,
                   and it must be your TABC address.`,
            "Invalid Article": "Articles must have a heading 1, heading 4, and at least 1 paragraph (in that order).",
            "Invalid Tag": "Articles must have at least 1 tag and no more than 3",
            "Invalid Image": "Certain images cannot be accepted due to technical reasons. Please choose a different one",
            "Invalid URL": `Article name must be between 1 and 20 letters.
                   Note that as spaces may count as 3 letters due to technical reasons,
                   it is advised to use dashes instead.`,
            "Invalid Issue Name": `Issue name cannot be greater than 20 letters,
                   and nor can it be blank when issue is made public.`,
            "Invalid Status": "Once an issue is made public, it cannot be made private again.",
            "Invalid Comment": "Comments must be at least 4 letters long.",
            "Invalid Password": "Invalid password",
            "Invalid Auth Code": `Authentication code is invalid. Please check your email and try again.
                  If it still fails, please request another one by logging in again`,
            "Invalid Password Confirmation": "Your passwords do not match. Please try again."
        },
        "409": {
            "Email Already In Use": "Email is already in use by a different account. Please try a different one."
        },
        "422": {
            "Missing Required Field": "Please fill out all required fields."
        },
    };
    const userSuccess = {
        "0": {
            'formatted': `Article has been formatted. If something became a heading that might not be, remember to include both a title
                    and the people who wrote it as the first things in your article.`,
            'timeOut': "You will be logged out if no action is taken in the next few minutes."
        },
        "200": {
            'Edited': 'Edits have been saved.',
            "Email Sent": 'An email has been sent. It may take a few moments to arrive.',
            "User(s) Updated": 'Updates have been saved.',
            "Article(s) Updated": "Updates have been saved.",
            "Article(s) Deleted": "Updated have been saved.",
            "Issue Updated": "Updates have been saved.",
            "Mission Edited": "Update has been saved."
        },
    };
    const messageContainer = document.getElementsByClassName("messages")[0];
    messageContainer.classList.remove("success");
    messageContainer.classList.remove("danger");
    if (!userErrors[httpStatus] && !userSuccess[httpStatus]) {
        return false;
    }
    if (userErrors[httpStatus] && userErrors[httpStatus][httpText]) {
        messageContainer.textContent = userErrors[httpStatus][httpText];
        messageContainer.className += " danger";
    }
    else if (userSuccess[httpStatus] && userSuccess[httpStatus][httpText]) {
        messageContainer.textContent = userSuccess[httpStatus][httpText];
        messageContainer.className += " success";
    }
    const originalPosition = window.scrollY;
    const scrollToTop = window.setInterval(function () {
        if (window.scrollY == 0) {
            window.clearInterval(scrollToTop);
        }
        window.scrollTo(0, window.scrollY - (originalPosition / 50));
    }, 7);
}
document.getElementsByClassName("messages")[0].addEventListener("animationend", function () {
    this.classList.remove("danger");
    this.classList.remove("success");
});
multiElementAction(document.getElementsByTagName("form"), (elt) => {
    elt.addEventListener("submit", function () {
        const messageContainer = document.getElementsByClassName("messages")[0];
        messageContainer.classList.remove("danger");
        messageContainer.classList.remove("success");
    });
});
//# sourceMappingURL=stormScripts.js.map