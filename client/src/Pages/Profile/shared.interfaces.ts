interface Article {
    url: string;
    dateCreated: string; // date string
    tags: string[];
    views: number;
    issue: number;
    id: string;
    canEdit: boolean;
}

interface PublicUserInfo {
    views: number;
    level: number;
    fullName: string;
    profileLink: string;
    canEdit: boolean;
}

interface ModifiableUserInfo {
    email: string;
    twoFactor: boolean;
    notificationStatus: boolean;
    id: string;
}

export {
    Article,
    PublicUserInfo,
    ModifiableUserInfo
};