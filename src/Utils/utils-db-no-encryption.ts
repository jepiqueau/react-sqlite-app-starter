export const createTablesNoEncryption: string =  `
    BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    company TEXT,
    size FLOAT,
    age INTEGER,
    last_modified INTEGER DEFAULT (strftime('%s', 'now'))
    );
    CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY NOT NULL,
    userid INTEGER,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    last_modified INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE SET DEFAULT
    );
    CREATE INDEX IF NOT EXISTS users_index_name ON users (name);
    CREATE INDEX IF NOT EXISTS users_index_last_modified ON users (last_modified);
    CREATE INDEX IF NOT EXISTS messages_index_last_modified ON messages (last_modified);
    CREATE TRIGGER IF NOT EXISTS users_trigger_last_modified 
    AFTER UPDATE ON users
    FOR EACH ROW WHEN NEW.last_modified <= OLD.last_modified  
    BEGIN  
        UPDATE users SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;   
    END;      
    CREATE TRIGGER IF NOT EXISTS messages_trigger_last_modified AFTER UPDATE ON messages
    FOR EACH ROW WHEN NEW.last_modified <= OLD.last_modified  
    BEGIN  
        UPDATE messages SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;   
    END;      
    PRAGMA user_version = 1;
    COMMIT TRANSACTION;
`;
export const importTwoUsers: string = `
    BEGIN TRANSACTION;
    DELETE FROM users;
    INSERT INTO users (name,email,age) VALUES ("Whiteley","Whiteley.com",30);
    INSERT INTO users (name,email,age) VALUES ("Jones","Jones.com",44);
    COMMIT TRANSACTION;
`;
export const importThreeMessages: string = `
    BEGIN TRANSACTION;
    DELETE FROM messages;
    INSERT INTO messages (userid,title,body) VALUES (1,"test post 1","content test post 1");
    INSERT INTO messages (userid,title,body) VALUES (2,"test post 2","content test post 2");
    INSERT INTO messages (userid,title,body) VALUES (1,"test post 3","content test post 3");
    COMMIT TRANSACTION;
`;
export const dropTablesTablesNoEncryption: string = `
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS messages;
    PRAGMA foreign_keys = ON;
`;

