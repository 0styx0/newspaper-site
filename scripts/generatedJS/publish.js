import { message } from './stormScripts';
const ckeditor = window.CKEDITOR;
ckeditor.replace("txtArea"); // makes the editor with which the user can put his/her article into
// makes sure article starts with headings 1 and 4 and in passing removes unneeded whitespace
document.getElementById("autoformat").addEventListener("click", function () {
    const article = ckeditor.instances.txtArea.getData();
    let formattedArticle = article.replace(/([\s\n]|<br \/>|&nbsp;)+(?=(<h1>)|(<p>))/i, "");
    if (!/^<h1>([\s\S]+)<\/h1>[\s\S]*<h4>.+/.test(article)) {
        formattedArticle = formattedArticle.replace(/<(\w+)>([\s\S]+?)<\/\1>/, "<h1>$2</h1>");
        if (!/^<h1>([\s\S]+)<\/h1>[\s\S]*<h4>.+/.test(formattedArticle)) {
            formattedArticle = formattedArticle.replace(/<\/h1>[\s\S]*?<(\w+)>([\s\S]+?)<\/\1>/i, "<h4>$2</h4>");
        }
    }
    ckeditor.instances.txtArea.setData(formattedArticle.replace(/&nbsp;/g, ""));
    message(0, "formatted");
});
// if user hasn't correcty formatted article, don't let submit
document.getElementsByName("create")[0].addEventListener("click", function (event) {
    const article = ckeditor.instances.txtArea.getData();
    document.getElementsByName("txtArea")[0].value = article;
    if (!/^<h1>([\s\S]+)<\/h1>[\s\S]*<h4>([\s\S]+)<\/h4>[\s\S]*<p>.+/.test(article)) {
        alert("The first thing in your article must be a heading 1 (the title), and under it must be a heading 4 (the authors).\n\n" +
            "If there are problems with formatting, try the 'autoformat' button");
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
    }
    if (!window.confirm("Are you sure you want to upload the articles?")) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
});
//# sourceMappingURL=publish.js.map