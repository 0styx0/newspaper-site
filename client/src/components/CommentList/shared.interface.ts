
// also shared with Pages/Story
interface Comment {
    id: string;
    canDelete: boolean;
    content: string;
    dateCreated: string;
    author: {
        fullName: string;
        profileLink: string;
        id: string;
    };
}

export {
    Comment
};