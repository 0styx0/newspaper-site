"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
;
// gets data about all issues and creates a table about it
fetch("../api/issue", {
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then(function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedData = yield data.json();
        let trHTML = "", tableHTML = "";
        parsedData.forEach(function (issue) {
            trHTML = "<tr>";
            for (const bit in issue) {
                if (bit == "name") {
                    issue[bit] = `<a href="/issue/${issue.num}">${issue[bit]}</a>`;
                }
                trHTML += `<td>${issue[bit] || "N/A"}</td>`;
            }
            tableHTML += trHTML + "</td>";
        });
        document.getElementsByTagName("tbody")[0].innerHTML = tableHTML;
    });
});
//# sourceMappingURL=issue.js.map