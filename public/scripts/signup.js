

(async function() {
    const userLevel = (await getCookies()).level;

    if (userLevel >= 1) {

        Array.from(document.getElementsByClassName("mustBeLoggedIn")).forEach(elt => elt.style.display = "block");

        let levels = "";

        for (let i = 1; i <= userLevel; i++) {

            levels += `<option value="${i}">${i}</option>`;
        }

        document.getElementsByName("lvl")[0].innerHTML = levels;
    }
}());