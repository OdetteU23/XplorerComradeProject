const filename = 'XComrade.sqlite';

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
    user_id INTEGER NOT NULL,
    kuvaus TEXT NOT NULL,
    kohde VARCHAR(200) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES käyttäjä(id) ON DELETE CASCADE
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

-- Comments table (kommentit)
CREATE TABLE IF NOT EXISTS kommentit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    julkaisuId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    teksti_kenttä TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    user_id INTEGER NOT NULL,
    kohde VARCHAR(200) NOT NULL,
    aloitusPvm DATE NOT NULL,
    lopetusPvm DATE NOT NULL,
    kuvaus TEXT,
    budjetti DECIMAL(10, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES käyttäjä(id) ON DELETE CASCADE
);

-- Buddy requests table
CREATE TABLE IF NOT EXISTS buddy_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matkasuunnitelmaId INTEGER NOT NULL,
    requesterId INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matkasuunnitelmaId) REFERENCES matkaAikeet(id) ON DELETE CASCADE,
    FOREIGN KEY (requesterId) REFERENCES käyttäjä(id) ON DELETE CASCADE
);

-- Trip participants table
CREATE TABLE IF NOT EXISTS trip_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matkasuunnitelmaId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matkasuunnitelmaId) REFERENCES matkaAikeet(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES käyttäjä(id) ON DELETE CASCADE,
    UNIQUE(matkasuunnitelmaId, userId)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL,
    receiverId INTEGER NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES käyttäjä(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES käyttäjä(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    relatedId INTEGER,
    read_status BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
`;

const checkData = `SELECT COUNT(*) AS count FROM käyttäjä`;

const exampleData = `
INSERT INTO käyttäjä (käyttäjäTunnus, salasana, etunimi, sukunimi, sahkoposti, bio, location) VALUES
('traveler1', '$2a$10$example', 'John', 'Doe', 'john@example.com', 'Love exploring new places', 'Helsinki, Finland'),
('wanderlust', '$2a$10$example', 'Jane', 'Smith', 'jane@example.com', 'Adventure seeker', 'Stockholm, Sweden');
`;

export {filename, tables, checkData, exampleData};
