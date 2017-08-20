interface Article {
    url: string;
    created: Date;
    tags: {
        all: string
    };
    views: number;
    issue: number;
    id: string;
}

interface PublicUserInfo {
    views: number;
    level: number;
    fullName: string;
    profileLink: string;
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