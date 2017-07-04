

interface IssueInfo {
    [properties: string]: any,
    num: string,
    name: string
    views: number,
    madepub: string
};

// gets data about all issues and creates a table about it
fetch("../api/issue", {
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then(async function(data) {

    const parsedData = await data.json();
    let trHTML = "", tableHTML = "";

    parsedData.forEach(function(issue: IssueInfo) {

        trHTML = "<tr>";

        for (const bit in issue) {

            if (bit == "name") {
                issue[bit] = `<a href="../issue/${issue.num}">${issue[bit]}</a>`;
            }

            trHTML += `<td>${issue[bit] || "N/A"}</td>`;
        }

        tableHTML += trHTML + "</td>";
    });

    document.getElementsByTagName("tbody")[0].innerHTML = tableHTML;
});