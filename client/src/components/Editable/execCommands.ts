const commands = [{
    cmd: 'bold',
    basic: true
}, {
    cmd: 'italic',
    basic: true
}, {
    cmd: 'underline',
    basic: true
}, {
    cmd: 'heading',
    val: '1-6'
}, {
    cmd: 'fontSize',
    val: '1-7'
}, {
    cmd: 'insertOrderedList'
}, {
    cmd: 'insertUnorderedList'
}, {
    cmd: 'justifyFull'
}, {
    cmd: 'justifyLeft'
}, {
    cmd: 'justifyRight'
}, {
    cmd: 'justifyCenter'
}, {
    cmd: 'strikeThrough',
    basic: true
}, {
    cmd: 'subscript'
}, {
    cmd: 'superscript'
}, {
    cmd: 'insertImage',
    val: 'https://dummyimage.com/160x90'
}, {
    cmd: 'createLink',
    val: 'www.example.com',
    basic: true
}, {
    cmd: 'unlink'
}, {
    cmd: 'hideFromPreview',
    val: 'Hide element from main page'
}];

export default commands;