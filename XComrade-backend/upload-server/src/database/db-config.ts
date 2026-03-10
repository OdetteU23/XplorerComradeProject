import path from 'path';

// Shared database file — all servers use the same XComrade.sqlite
// On Azure: set DB_PATH=/data/XComrade.sqlite (Azure Files mount)
// Locally: defaults to the backend root
const filename = process.env.DB_PATH || path.join(__dirname, '..', '..', '..', 'XComrade.sqlite');

const tables = `
-- Users table (käyttäjä)
CREATE TABLE IF NOT EXISTS käyttäjä (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    käyttäjäTunnus VARCHAR(50) UNIQUE NOT NULL,
    salasana VARCHAR(255) NOT NULL,
    etunimi VARCHAR(100) NOT NULL,
    sukunimi VARCHAR(100) NOT NULL,
    sahkoposti VARCHAR(150) UNIQUE NOT NULL,
    profile_picture_url VARCHAR(255),
    bio TEXT,
    location VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Posts table (julkaisu)
CREATE TABLE IF NOT EXISTS julkaisu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    otsikko VARCHAR(200),
    sisältö TEXT,
    kuvaus TEXT NOT NULL,
    kohde VARCHAR(200) NOT NULL,
    media_url VARCHAR(255),
    media_type VARCHAR(50),
    list_aktiviteetti TEXT DEFAULT '[]',
    Date_ajakohta DATETIME DEFAULT CURRENT_TIMESTAMP,
    luotu DATETIME DEFAULT CURRENT_TIMESTAMP,
    päivitetty DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES käyttäjä(id) ON DELETE CASCADE
);

-- Likes table (tykkäykset)
CREATE TABLE IF NOT EXISTS tykkäykset (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    julkaisuId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (julkaisuId) REFERENCES julkaisu(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES käyttäjä(id) ON DELETE CASCADE,
    UNIQUE(julkaisuId, userId)
);

-- Comments table (kommentti)
CREATE TABLE IF NOT EXISTS kommentti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    julkaisuId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    teksti_kenttä TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (julkaisuId) REFERENCES julkaisu(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES käyttäjä(id) ON DELETE CASCADE
);

-- Follow table (seuranta)
CREATE TABLE IF NOT EXISTS seuranta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seuraajaId INTEGER NOT NULL,
    seurattavaId INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seuraajaId) REFERENCES käyttäjä(id) ON DELETE CASCADE,
    FOREIGN KEY (seurattavaId) REFERENCES käyttäjä(id) ON DELETE CASCADE,
    UNIQUE(seuraajaId, seurattavaId)
);

-- Travel plans table (matkaAikeet)
CREATE TABLE IF NOT EXISTS matkaAikeet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    kohde VARCHAR(200) NOT NULL,
    suunniteltu_alku_pvm DATE NOT NULL,
    suunniteltu_loppu_pvm DATE NOT NULL,
    aktiviteetit TEXT DEFAULT '[]',
    budjetti TEXT DEFAULT '[]',
    kuvaus TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES käyttäjä(id) ON DELETE CASCADE
);

-- Buddy requests table (friendRequest)
CREATE TABLE IF NOT EXISTS friendRequest (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matkaAikeetId INTEGER NOT NULL,
    requesterId INTEGER NOT NULL,
    ownerId INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matkaAikeetId) REFERENCES matkaAikeet(id) ON DELETE CASCADE,
    FOREIGN KEY (requesterId) REFERENCES käyttäjä(id) ON DELETE CASCADE,
    FOREIGN KEY (ownerId) REFERENCES käyttäjä(id) ON DELETE CASCADE
);

-- Trip participants table (tripParticipants)
CREATE TABLE IF NOT EXISTS tripParticipants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matkaAikeetId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) DEFAULT 'buddy',
    FOREIGN KEY (matkaAikeetId) REFERENCES matkaAikeet(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES käyttäjä(id) ON DELETE CASCADE,
    UNIQUE(matkaAikeetId, userId)
);

-- Chat messages table (chatMessages)
CREATE TABLE IF NOT EXISTS chatMessages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL,
    receiverId INTEGER NOT NULL,
    message TEXT NOT NULL,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES käyttäjä(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES käyttäjä(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    notificationType VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    relatedId INTEGER,
    isRead BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES käyttäjä(id) ON DELETE CASCADE
);

-- Media images table
CREATE TABLE IF NOT EXISTS media_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    julkaisuId INTEGER NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (julkaisuId) REFERENCES julkaisu(id) ON DELETE CASCADE
);

-- File storage table (persists upload data in DB so images survive branch switches)
CREATE TABLE IF NOT EXISTS file_storage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename VARCHAR(255) UNIQUE NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_data BLOB NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

const checkData = `SELECT COUNT(*) AS count FROM käyttäjä`;

const exampleData = `
INSERT INTO käyttäjä (käyttäjäTunnus, salasana, etunimi, sukunimi, sahkoposti, bio, location) VALUES
('traveler1', '$2a$10$example', 'John', 'Doe', 'john@example.com', 'Love exploring new places', 'Helsinki, Finland'),
('wanderlust', '$2a$10$example', 'Jane', 'Smith', 'jane@example.com', 'Adventure seeker', 'Stockholm, Sweden');
`;

export {filename, tables, checkData, exampleData};
