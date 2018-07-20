export default {
    id: `one`,
    article: `<h1>Title</h1><h4>Author</h4><p>Content</p>`,
    canEdit: 1,
    tags: [`hi`, `farewell`],
    comments: [
        {
            id: `comment1`,
            content: `snarky comment`,
            dateCreated: '1999-12-24',
            canDelete: 1,
            author: {
                fullName: 'Cristian',
                profileLink: 'et'
            }
        },
        {
            id: `comment2`,
            content: `snarky comment 2`,
            dateCreated: '1949-01-14',
            canDelete: 0,
            author: {
                fullName: 'Becky',
                profileLink: 'Glib'
            }
        }
    ]
};
