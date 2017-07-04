"use strict";


(function() {

    const currentNavItem = <HTMLAnchorElement> document.querySelector("nav a[href='" + window.location.pathname + "']");

    if (currentNavItem) {
        currentNavItem.style.color = '#f8ffff';
        currentNavItem.style.backgroundColor = '#212d23';
    }

    // for when user is browsing articles by tag
    const queryTag = location.pathname.split("tag/");

    const currentTagOption = <HTMLOptionElement> document.querySelector("option[value="+queryTag[1] +"]");

    if (currentTagOption) {
        currentTagOption.selected = true;
    }


    Array.from(document.querySelectorAll(":required")).forEach((elt) => {

        const label = <HTMLLabelElement> elt.parentNode;
        label.innerHTML += "<span class='danger'>*</span>";
    });

    if (window.innerWidth <= 900) {

        // prevent menubar being initially open on pageload
        Array.from(document.querySelectorAll("#menuToggle ~ li")).forEach((elt) =>
          elt.setAttribute("display", "none"));
        // after user clicks on menubar, take away above effect and make it function normally (css animations)


        document.getElementById("menuToggle")!.addEventListener("change", function menuChange() {

            Array.from(document.querySelectorAll("#menuToggle ~ li")).forEach((elt: HTMLLIElement) => elt.style.display = "block");

            const curElt = <HTMLInputElement> this;
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
export function multiElementAction(nodeGroup: NodeList | HTMLCollectionOf<Element>, callback: Function) {

    for (const elt of Array.from(nodeGroup)) {
        callback(elt);
    }
}


if (document.getElementById("passConf")) {


    // if there's a #passConf, check if previous password input has the same value
    document.getElementById("passConf")!
    .parentNode!
    .parentNode!
    .addEventListener("submit", function(event) {

        if ((<HTMLInputElement>document.getElementById("passConf")).value
                !==
            (<HTMLInputElement>document.getElementById("password")).value) {

            message(400, "Invalid Password Confirmation");
            event.preventDefault();
            event.stopImmediatePropagation(); // stops the submit event that leads to convertFormRequestToREST from firing
        }
    });
}

interface HTTP {
    [push: string]: any // really Function but get error that type 'Function' has no index signature
    PUT?: any,
    DELETE?: any,
    POST?: any,
    GET?: any
}

enum Method {
    POST,
    PUT,
    DELETE,
    GET
};

function convertFormRequestToREST(form: HTMLFormElement) {


        if (form.querySelector("tr + tr") && form.querySelector("input.changed, textarea.changed, select.changed")) {

            const notChanged =
              document.querySelectorAll("td input:not(.changed), td textarea:not(.changed), td select:not(.changed)");

            multiElementAction(notChanged, (elt: HTMLInputElement) => elt.disabled = true);
        }

        // HTTP[method][key][value] = array
        const HTTP: HTTP = {

            // this should really be HTTP, but error when that happens
            push: function(this: any, method: Method, key: string | undefined, value: any) {

                if (!method || key === undefined || key === "" || value === undefined || value === "") {

                    return false;
                }

                if (!this[method]) {
                    this[method] = {};
                }


                if (key.substr(key.length - 2) == "[]" && key != "type[]") { // not type[] is so get 1d array when publishing

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



        const submitButtonElt = <HTMLInputElement>form.querySelector("[type=submit]");
        const submitButtonName = submitButtonElt && submitButtonElt.name;

        for (let i = 0; i < form.length; i++) {


            const name: string = form[i].name;
            let value: any;
            let method: string = "";

            if (submitButtonName == "create") { // create
                method = "post";
            }

            else if (name.indexOf("del") === 0 && form[i].checked) { // delete

                method = "delete";
            }
            else if (form[i].name.indexOf("del") == -1) { // update
                method = "put";
            }


            if (form[i].type == "checkbox") {

                value = (form[i].checked) ? form[i].value : false;
            }
            else if (form[i].multiple && form[i].selectedOptions) {
                value = multiElementAction(form[i].selectedOptions, (elt: HTMLOptionElement) => elt.value);
            }
            else {
                value = form[i].value
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
       .then(async function(result) {

           const res = await result;
           const status = res.status;
           const currentURL = window.location.pathname;

           if (status == 201 && currentURL == "/signup" && !(await getCookies()).id) {

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

               const resJSON = await res.json();

               return window.location.pathname = resJSON.url;
           }

           resetForm();

           message(result.status, result.statusText);
        });
    }

   return false;
}

/**
 * Wipes away all that occurred because of user interaction from forms
 *   (leaving things that changed because the user submitted it)
 */
function resetForm() {

        multiElementAction(document.querySelectorAll("input:not(.changed), textarea:not(.changed), select:not(.changed)"),
            (elt: HTMLInputElement) => elt.disabled = false);

        // removes row whose contents were deleted
        multiElementAction(document.querySelectorAll("tr [name^=del]:checked"), (elt: HTMLInputElement) =>
          (<HTMLTableRowElement> elt.parentNode!.parentNode).remove());

        multiElementAction(document.getElementsByClassName("changed"), (elt: HTMLElement) =>
          elt.classList.remove("changed"));

        multiElementAction(document.querySelectorAll("input[type=password]"), (elt: HTMLInputElement) => elt.value = "");


        multiElementAction(document.querySelectorAll(":required"), (elt: HTMLInputElement) => {

            elt.required = false;

            elt.addEventListener("click", function addRequiredAttr() {
                this.required = true;
                removeEventListener("click", addRequiredAttr);
            });
        });
}

multiElementAction(document.getElementsByTagName("form"), function(elt: HTMLFormElement) {

    elt.addEventListener("submit", function(event: Event) {

        convertFormRequestToREST(this);
        event.preventDefault();
        event.stopPropagation();
    });
});

/**
 * When an `abbr element next to an `input is clicked on, its title appears under it
 */
function showTextOfAbbr(elt: HTMLElement): void {

     multiElementAction(document.getElementsByClassName("abbrMessage"), (elt: HTMLDivElement) =>
       elt.parentNode!.removeChild(elt));

     const message = document.createElement('div');
     message.textContent = elt.getAttribute("title");
     message.className = "abbrMessage";

     const nextElt = elt.nextElementSibling;

     const messageSibling = (nextElt && nextElt.className === "danger") ? nextElt : elt;
     messageSibling.parentNode!.appendChild(message);

}

multiElementAction(document.querySelectorAll("input + abbr"), function(elt: HTMLElement) {
    elt.addEventListener("click", function() {
        showTextOfAbbr(this);
    });
});


interface JWT {

    email: string | null,
    level: number | null,
    id: string | null
}

/**
 * @return all cookies split into an array. If a cookie is JSON encoded array it is decoded
 */
export async function getCookies(): Promise<JWT> {

    const call = await fetch('/api/userStatus', {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

    return call.json();
}


document.getElementById("artTypes")!.addEventListener("change", function() {
    window.location.pathname = "/tag/" + (<HTMLSelectElement>this).value;
});




interface EditInfo {
    selector: string,
    edit?: string // never passed as parameter, added on in edit function
    // for editing articles
    name?: string,
    issue?: number,
}

import { commands } from "./execCommands";
/**
 * Sets up editing on html (not for comments, which requires a small subset of this functionality)
 *
 * @param tag - tag to allow editing on
 * @param AJAXtarget - where to submit the html
 * @param info - object of info to send to server
 */
export function edit(tag: string, AJAXtarget: string, info: EditInfo) {


    const tagElt = document.querySelector(tag);
    tagElt!.setAttribute("contentEditable", "true");
    tagElt!.setAttribute("contextmenu", "buttonMenu");

    const buttonContainer = document.createElement("div");
     buttonContainer.id = "buttonContainer";
    buttonContainer.appendChild(document.createElement("br"));
    const submitButton = document.createElement("button");
     submitButton.id = "submitEdit"
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
    commands.forEach(function(arrVal) {

        if (!document.queryCommandSupported(arrVal.cmd) && arrVal.cmd != "hideFromPreview") { // hideFromPreview is a custom command
            return;
        }

        const buttonClone = <HTMLButtonElement> buttonPrototype.cloneNode();
         buttonClone.textContent = buttonClone.className = arrVal.cmd;

        buttonContainer.insertBefore(buttonClone, submitButton.previousSibling);

        buttonContainer.querySelector("."+arrVal.cmd)!
         .addEventListener("click", () => buttonEdits(arrVal));

        // really should be HTMLMenuItemElement, but typescript doesn't have it
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menuitem
        const menuitemClone: any = menuitemPrototype.cloneNode();
        menuitemClone.label = arrVal.cmd;
        menuitemClone.id = arrVal.cmd + "Menu";

        document.getElementById("buttonMenu")!.appendChild(menuitemClone);

        document.getElementById(arrVal.cmd + "Menu")!
         .addEventListener("click", () => buttonEdits(arrVal));
    });



    submitButton.addEventListener("click", function() {

       // prevent button mashing
       this.disabled = true;

        // info is a parameter from top function (edit)
        info.edit = document.querySelector(info.selector)!.innerHTML;


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
        .then(async (status) => {

            await status;
            message(status.status, status.statusText);

            this.disabled = false;
        });

    });
}

interface ExecCommandObj {
    cmd: string,
    val?: any
}

function buttonEdits(arrVal: ExecCommandObj) {

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
function toggleClassOnElementSelected(className: string) {

    const eltAnchor = <HTMLElement> window.getSelection().anchorNode;

    if (eltAnchor.children) { // if selected elt is an img
        eltAnchor.children[0].classList.toggle(className);
    }
    else {

        const eltToChange = (eltAnchor.nodeType == Node.TEXT_NODE)
          ? eltAnchor.parentNode
          : eltAnchor.lastElementChild;

        (<HTMLElement> eltToChange).classList.toggle(className);
    }
}


/**
 * disables table rows where no inputs in that row were changed. Saves time on server side
 */
export function addChangedEvent() {

    multiElementAction(document.querySelectorAll("table input, table textarea, table select"), function(elt: HTMLElement) {

        elt.addEventListener("change", function() {

            let child: HTMLElement = this;

            while (child.parentNode && child.nodeName != "TR") {
                child = <HTMLElement>child.parentNode;
            }

            multiElementAction(child.querySelectorAll("input, textarea, select"), (elt: HTMLElement) =>
              elt.className += " changed");
        });
    });
}



/**
 * Shows user a message
 *
 * @param param - key to either userErrors or userSuccess (defined in the function)
 * @param timeToFade - time, in miliseconds of how long the message should last
 */
export function message(httpStatus: number, httpText: string = "") {

        const userErrors: any = {
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

        const userSuccess: any = {

            "0": { // 0 means that it's not actually an http code, but sent in response to something else
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

        const scrollToTop = window.setInterval(function() {

            if (window.scrollY == 0) {
                window.clearInterval(scrollToTop);
            }

            window.scrollTo(0, window.scrollY - (originalPosition / 50));
        }, 7);
}

document.getElementsByClassName("messages")[0].addEventListener("animationend", function(this: HTMLDivElement) {

    this.classList.remove("danger");
    this.classList.remove("success");
});

multiElementAction(document.getElementsByTagName("form"), (elt: HTMLFormElement) => {

    elt.addEventListener("submit", function() {

        const messageContainer = document.getElementsByClassName("messages")[0];
        messageContainer.classList.remove("danger");
        messageContainer.classList.remove("success");
    });
});