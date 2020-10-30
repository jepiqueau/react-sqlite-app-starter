export const createTablesIssue49: string =  `
    BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        company VARCHAR(255),
        size FLOAT,
        age INTEGER
    );
    CREATE INDEX IF NOT EXISTS users_index_name ON users (name);
    PRAGMA user_version = 1;
    COMMIT TRANSACTION;
`;
export const dropTablesTablesIssue49: string = `
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS users;
    PRAGMA foreign_keys = ON;
`;
export const importTwoUsers: string = `
    BEGIN TRANSACTION;
    DELETE FROM users;
    INSERT INTO users (name,email,size,age) VALUES ("Whiteley","Whiteley.com",183.52,30);
    INSERT INTO users (name,email,size,age) VALUES ("Jones","Jones.com",195.32,44);
    COMMIT TRANSACTION;
`;
