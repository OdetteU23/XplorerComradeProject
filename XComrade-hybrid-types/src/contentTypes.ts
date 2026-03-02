type userDB = {
    id: number;
    käyttäjäTunnus: string;
    etunimi: string;
    sukunimi: string;
    sahkoposti: string;
    registeredAt: string;
    salasana: string; 
    user_level_id?: number;
    profile_picture_url?: string;
    bio?: string;
    location?: string;
};

// Public user profile 
type userProfile = Omit<userDB, 'salasana'>;

type registeringInfo = Pick<userDB, 'käyttäjäTunnus' | 'etunimi' | 
    'sukunimi' | 'sahkoposti' | 'salasana' | 'profile_picture_url' | 
    'bio' | 'location'>;

type loginInfo = Pick<userDB, 'käyttäjäTunnus' | 'salasana'>;

type logoutInfo = {
    käyttäjäTunnus: () => void;
};

type julkaisu = {
    id: number;
    userId : userProfile['id'];
    otsikko?: string;
    sisältö?: string;
    Date_ajakohta: Date;
    kuvaus: string;
    kohde: string;
    media_url?: string;
    media_type?: string;        // e.g. 'image/jpeg', 'video/mp4'
    list_aktiviteetti: string[];
    luotu?: string;
    päivitetty?: string;
};

type tykkäykset = {
    id: number;
    julkaisuId: julkaisu['id'];
    userId: userProfile['id'];
};

type kommentti = {
    id: number;
    teksti_kenttä: string;
    julkaisuId: julkaisu['id'];
    userId: userProfile['id'];
    createdAt: Date;
};
type seuranta = {
    id: number;
    seuraajaId: userProfile['id'];
    seurattavaId: userProfile['id'];
};

type matkaAikeet = {
    id: number;
    userId: userProfile['id'];
    kohde: string;
    suunniteltu_alku_pvm: Date;
    suunniteltu_loppu_pvm: Date;
    aktiviteetit: string[]; 
    budjetti?: string[];
    kuvaus?: string;
};
type notifications = {
    id: number;
    userId: userProfile['id'];
    message: string;
    isRead: boolean;
    createdAt: Date;
    notificationType: 'like' | 'comment' | 'follow' | 'message' | 'buddy_request';
    relatedId?: number; // ID of the related entity (julkaisu, kommentti, etc.)???
};
type media_images = {
    id: number;
    julkaisuId: julkaisu['id'];
    image_url: string;
};

type chatMessages = {
    id: number;
    senderId: userProfile['id'];
    receiverId: userProfile['id'];
    message: string;
    sentAt: Date;
};

// Travel buddy request ---> when someone wants to join your trip
type friendRequest = {
    id: number;
    matkaAikeetId: matkaAikeet['id'];
    requesterId: userProfile['id']; // Person requesting to join
    ownerId: userProfile['id']; // Trip owner
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
};

// Trip participants ---> confirmed travel buddies
type tripParticipants = {
    id: number;
    matkaAikeetId: matkaAikeet['id'];
    userId: userProfile['id'];
    joinedAt: Date;
    role: 'owner' | 'buddy';
};

type julkaisuWithRelations = julkaisu & {
    user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
    tykkäykset: tykkäykset[];
    kommentit: (kommentti & { user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'profile_picture_url'> })[];
    media_images: media_images[];
};

// User search result — profile + stats
type UserSearchResult = userProfile & {
    postsCount: number;
    followersCount: number;
    followingCount: number;
};

// Full user profile with stats and follow status (for profile pages)
type UserProfileWithStats = userProfile & {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing?: boolean; // present when viewer is authenticated
};

// Paginated response wrapper
type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};


export type { 
    userProfile, logoutInfo, userDB, julkaisu, seuranta, matkaAikeet, kommentti, 
    tykkäykset, registeringInfo, loginInfo, julkaisuWithRelations, 
    notifications, media_images, chatMessages, friendRequest, tripParticipants,
    UserSearchResult, UserProfileWithStats, PaginatedResponse
};