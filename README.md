# Ionic/React SQLite App Starter

Ionic/React application demonstrating the use of the `@capacitor-community/sqlite` plugin and can be use as an application starter.


The `@capacitor-community/sqlite` test is accessible in the Tab2 of the Application by clicking on several SQLite test button :

 - SQLite No Encryption Tests
 - SQLite Encrypted Tests     (iOS && Android only)
 - SQLite Encryption Tests    (iOS && Android only)
 - SQLite Json Tests

The application uses now a React Hook `react-sqlite-hook` to access the `@capacitor-community/sqlite` API. 

- [react-sqlite-hook](https://github.com/jepiqueau/react-sqlite-hook)


## Getting Started

To start building your App using this Starter App, clone this repo to a new directory:

```bash
git clone https://github.com/jepiqueau/react-sqlite-app-starter.git 
cd react-sqlite-app-starter
git remote rm origin
```

 - then install it

```bash
npm install
```

 - then go through the building process

```bash
npm run build
npx cap sync
npx cap sync @capacitor-community/electron
npm run build
npx cap copy
npx cap copy @capacitor-community/electron
npx cap copy web
```

the capacitor config parameters are:

```
"appId": "com.example.app.capacitor"
"appName": "react-sqlite-app-starter"
```

### Building Web Code

The ```@capacitor-community/sqlite``` is not implemented for Web Browsers.
if you run

```bash
npx cap serve
```
you will get the following messages:
```
SQLite Plugin not available for Web Platform
```

### Building Electron Project

```bash
npx cap open @capacitor-community/electron
```

### Building Native Project

#### IOS

```bash
npx cap open ios
```
Once Xcode launches, you can build your finally app binary through the standard Xcode workflow.

#### Android

```bash
npx cap open android
```
Once Android Studio launches, you can build your app through the standard Android Studio workflow.

#### Resulting Output

it is different for each test but at the end of each test it should ended with

```
* The set of test was successful *
```
or
```
* The set of tests failed *
```

Output example for `SQLite No Encryption Tests`

```
* Starting testDatabaseNoEncryption *
  Database 'test-sqlite' Opened
* Ending testDatabaseNoEncryption *
* Starting testDatabaseExecuteSet *
  Database 'test-executeset' Opened
* Ending testDatabaseExecuteSet *

* The set of test was successful *
```

At the end of the tests if you run all of them, five databases would have been created only one is encrypted, 

```
db-from-jsonSQLite.db
test-executesetSQLite.db
test-sqliteSQLite.db
twoimportsSQLite.db
test-encryptionSQLite.db
```
test-encryptedSQLite.db is encrypted with secret: `sqlite secret`

### Changing the 'secret' and 'new secret'

#### IOS

In Xcode, before building your app, 
 - Go to the ```Pods/Development Pods/CapacitorCommunitySqlite``` folder, 
 - Modify the ```secret``` and ```newsecret```strings in the GlobalSQLite.swift file.

#### Android

In Android Studio, before building your app,
 - Go to the ```capacitor-community-sqlite/java/com.getcapacitor.community.database.sqlite/cdssUtils```folder,
 - Modify the ```secret``` and ```newsecret```strings in the GlobalSQLite.java file.


## Starting an App from Scratch

The process described below follows the instructions provided in the [Capacitor Documentation](https://capacitor.ionicframework.com/docs/getting-started/with-ionic/)

### New Ionic/React Project

```bash
ionic start mySQLiteApp tabs --type=react --capacitor
cd ./mySQLiteApp
``` 

### Initialize Capacitor

```bash
npx cap init mySQLiteApp com.example.app
```

Your App information [appName] [appId] can be whathever you would like. 
Here we choose for the example [mySQLiteApp] [com.example.app]

### Install capacitor-sqlite plugin

```bash
npm install --save @capacitor-community/sqlite@latest
npm install --save-dev react-sqlite@latest
```
### Modify the capacitor.config.json file

Open the capacitor.config.json file in your favorite editor and modify the ```webdir``` parameter as follows:

```json
"webDir": "build",
```

### Using the Hook 

```js
import React, { useState, useEffect} from 'react';
...
import { useSQLite } from 'react-sqlite-hook/dist';
import './Foo.css';

const Foo: React.FC = () => {

  const {openDB, createSyncTable, close, execute, executeSet, run, query,
    isDBExists, deleteDB, isJsonValid, importFromJson, exportToJson, setSyncDate} = useSQLite();
    
  useEffect( () => {
    async function testFoo() {
      let result: any = await openDB("test-foo"); 
      if(result.result) {
        // create table
        const createTablesNoEncryption: string =  `
          BEGIN TRANSACTION;
          CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY NOT NULL,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          company TEXT,
          size FLOAT,
          age INTEGER,
          last_modified INTEGER DEFAULT (strftime('%s', 'now')),
          );
          CREATE INDEX IF NOT EXISTS users_index_name ON users (name);
          CREATE INDEX IF NOT EXISTS users_index_last_modified ON users (last_modified);
          CREATE TRIGGER IF NOT EXISTS users_trigger_last_modified 
          AFTER UPDATE ON users
          FOR EACH ROW WHEN NEW.last_modified <= OLD.last_modified  
          BEGIN  
            UPDATE users SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;   
          END;      
          PRAGMA user_version = 1;
          COMMIT TRANSACTION;
        `;
        result = await execute(createTablesNoEncryption);
        if(result.changes.changes !== 0 && result.changes.changes !== 1) {
          return;
        }
        // Insert two users with execute method
        const importTwoUsers: string = `
          BEGIN TRANSACTION;
          DELETE FROM users;
          INSERT INTO users (name,email,age) VALUES ("Whiteley","Whiteley.com",30);
          INSERT INTO users (name,email,age) VALUES ("Jones","Jones.com",44);
          COMMIT TRANSACTION;
        `;        
        result = await execute(importTwoUsers);
        if(result.changes.changes !== 2) {
          return;
        }
        // Select all Users
        result = await query("SELECT * FROM users");
        if(result.values.length !== 2 ||
        result.values[0].name !== "Whiteley" || result.values[1].name !== "Jones") {
          return;
        }

        ...

      }
    }
    testFoo();

  }, [openDB, createSyncTable, close, execute, executeSet, run, query, isDBExists, deleteDB,
    isJsonValid, importFromJson, exportToJson, setSyncDate]);   

  return (

  ...

  );
};

export default Foo;
```

### Build your App

```bash
npm run build
```

### Add Platforms

```bash
npx cap add ios
npx cap add android
```

### Building and Syncing your App with Capacitor

```bash
npm run build
npx cap copy
npx cap copy web
```

### Open IDE to Build, Run and Deploy

#### IOS

```bash
npx cap open ios
```
Once Xcode launches, you can build your finally app binary through the standard Xcode workflow.

#### Android

```bash
npx cap open android
```

Once Android launches,

 - Edit the MainActivity.java and add the following import:

```java
import com.getcapacitor.community.database.sqlite.CapacitorSQLite;
```

 - Add the CapacitorSQLite declaration in the this.init method

```java
add(CapacitorSQLite.class);
```

 - you can then build your app through the standard Android Studio workflow.

#### Electron

In your application folder add the @capacitor-community/electron

```bash
npm i @capacitor-community/electron
npx cap add @capacitor-community/electron
```

In the Electron folder of your application

```bash
npm install --save sqlite3
npm install --save-dev @types/sqlite3
npm install --save-dev electron-rebuild
```

Modify the Electron package.json file by adding a script "postinstall"

```json
  "scripts": {
    "build": "tsc",
    "electron:start": "npm run build && electron ./",
    "electron:pack": "npm run build && electron-builder build --dir",
    "electron:build-windows": "npm run build && electron-builder build --windows",
    "electron:build-mac": "npm run build && electron-builder build --mac",
    "postinstall": "electron-rebuild -f -w sqlite3"
  },
```

Execute the postinstall script

```bash
npm run postinstall
```
Go back in the main folder of your application
and then build the application

```bash
 npx cap sync @capacitor-community/electron
 npm run build
 npx cap copy @capacitor-community/electron
 npx cap open @capacitor-community/electron
```

The datastores created are under **User/Databases/YOUR_APP_NAME/**


### When capacitor-sqlite is updated

Follow this process:

```bash
npm install --save capacitor-sqlite@latest
npx cap sync
npx cap sync @capacitor-community/electron
npm run build
npx cap copy
npx cap copy @capacitor-community/electron
npx cap copy web
npx cap open ios
npx cap open android
npx cap open @capacitor-community/electron
```

