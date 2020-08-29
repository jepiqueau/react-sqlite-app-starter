export const createTablesExecuteSet: string =  `
    BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        FirstName TEXT,
        company TEXT,
        size REAL,
        age INTEGER,
        MobileNumber TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY NOT NULL,
        userid INTEGER,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS users_index_name ON users (name);
    CREATE INDEX IF NOT EXISTS users_index_email ON users (email);
    CREATE INDEX IF NOT EXISTS messages_index_name ON messages (userid);
    DELETE FROM users;
    DELETE FROM messages;
    PRAGMA user_version = 1;
    PRAGMA foreign_keys = ON;
    COMMIT TRANSACTION;
`;
export const dropTablesTablesExecuteSet: string = `
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS messages;
    PRAGMA foreign_keys = ON;
`;
export const setArrayUsers: Array<any> = [
    { statement:"INSERT INTO users (name,FirstName,email,age,MobileNumber) VALUES (?,?,?,?,?);",
      values:["Simpson","Tom","Simpson@example.com",69,"4405060708"]
    },
    { statement:"INSERT INTO users (name,FirstName,email,age,MobileNumber) VALUES (?,?,?,?,?);",
      values:["Jones","David","Jones@example.com",42,"4404030201"]
    },
    { statement:"INSERT INTO users (name,FirstName,email,age,MobileNumber) VALUES (?,?,?,?,?);",
      values:["Whiteley","Dave","Whiteley@example.com",45,"4405162732"]
    },
    { statement:"INSERT INTO users (name,FirstName,email,age,MobileNumber) VALUES (?,?,?,?,?);",
      values:["Brown","John","Brown@example.com",35,"4405243853"]
    },
    { statement:"UPDATE users SET age = ? , MobileNumber = ? WHERE id = ?;",
      values:[51,"4404030202",2]
    }
];
export const setArrayMessages: Array<any> = [
    { statement:"INSERT INTO messages (userid,title,body) VALUES (?,?,?);",
      values:[1,"test message 1","content test message 1"]
    },
    { statement:"INSERT INTO messages (userid,title,body) VALUES (?,?,?);",
      values:[2,"test message 2","content test message 2"]
    },
    { statement:"INSERT INTO messages (userid,title,body) VALUES (?,?,?);",
      values:[1,"test message 3","content test message 3"]
    }
  ]

