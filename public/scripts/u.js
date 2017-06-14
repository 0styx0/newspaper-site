
function classAction(className, callback) {

    Array.from(document.getElementsByClassName(className)).forEach((elt) => {
        callback(elt);
    });
}

fetch("/api/userGroup", {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
}).then(async function(data) {


    const tableData = await data.json();
    const cookies = getCookies();
    const userLevel = (cookies.jwt) ? cookies.jwt[1].level : 0;



    if (userLevel) {

        classAction("mustBeLoggedIn", (elt) => elt.classList.remove("mustBeLoggedIn"));
    }
    else {

        classAction("mustBeLoggedIn", (elt) => elt.remove());
    }

    if (userLevel > 1) {

        classAction("mustBeLevelTwo", (elt) => elt.classList.remove("mustBeLevelTwo"));
    }
    else {

        classAction("mustBeLevelTwo", (elt) => elt.remove()); // for sorting
    }

    // prepare fragments
    let tbody = document.createElement("tbody");

    const templateContainer = document.getElementById("templates");

    let select = templateContainer.querySelector("[name=lvl\\[\\]]");
    let deleteCheckbox = templateContainer.querySelector("[name=delAcc\\[\\]]");
    let hiddenIdentifier = templateContainer.querySelector("[name=name\\[\\]]");

    for (let i = 1; i <= userLevel; i++) {
        const option = document.createElement("option");
          option.value = option.textContent = i;
        select.appendChild(option);
    }

    tableData.forEach(function(row, i) {

        const userId = row.ID;
        delete row.ID;
        const profileLink = row.PROFILE_LINK;
        delete row.PROFILE_LINK;

        let tr = document.createElement("tr");

        tbody.appendChild(tr);

        // if user is lower level than logged in user, can delete
        if (row.LEVEL < userLevel) {
            row.delete = deleteCheckbox.cloneNode(true);
            row.delete.value = userId;
        }
        else if (userLevel > 1) {
            row.delete = "N/A";
        }


        for (const cell in row) {

            const tdVal = row[cell];
            const td = document.createElement("td");

            if (cell == "NAME") {

                row[cell] = document.createElement("a");
                row[cell].href = `/u/${profileLink}`;
                row[cell].textContent = tdVal;
            }

            if (cell == "LEVEL" && tdVal < userLevel) { // can't change somebody who's the same level as you


                const hiddenClone = hiddenIdentifier.cloneNode(true);
                hiddenClone.value = profileLink;
                td.appendChild(hiddenClone);


                const selectClone = select.cloneNode(true);
                selectClone.value = tdVal;
                row[cell] = selectClone;
            }

            try { // if not a node (and so can't append), throws error, so then converted to node and success
                td.appendChild(row[cell]);
            } catch (e) {
                td.appendChild(document.createTextNode(row[cell]));
            }

            tr.appendChild(td);

        }

        tbody.appendChild(tr);
    });

    document.getElementsByTagName("table")[0].appendChild(tbody);

    addChangedEvent(); // see stormScripts.js
});




(function sortJournalists() {


    document.querySelector("select[name=sortBy]").addEventListener("change", function() {

        const filterType = this.value;
        const mapFilterToLocation = [];

        Array.from(document.getElementsByTagName("th")).forEach((elt) => {
            mapFilterToLocation.push(elt.textContent);
        });

        const idxOfCol = mapFilterToLocation.indexOf(filterType);

        const filterIndex = (idxOfCol < 0) ? 0 : idxOfCol; // since Last Name != Name, can't sort by last name unless do this

        const tbody = document.getElementsByTagName('tbody')[0];

        // inspiration/help from https://stackoverflow.com/a/16589087
        const sortedArr = Array.from(tbody.querySelectorAll('tr')).sort(function(a,b){

            const tda = a.querySelectorAll("td")[filterIndex];
            const tdb = b.querySelectorAll("td")[filterIndex];

            // if there's a select elt, get its value, else just it's text
            const tdaVal = (tda.querySelector("select")) ? tda.querySelector("select").value : tda.textContent;
            const tdbVal = (tdb.querySelector("select")) ? tdb.querySelector("select").value : tdb.textContent;

            return +tdbVal - +tdaVal || tdaVal.localeCompare(tdbVal);

        });

        tbody.append(...sortedArr);
    });
})();

