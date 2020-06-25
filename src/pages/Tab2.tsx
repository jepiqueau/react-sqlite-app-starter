import React from 'react';
import { IonContent, IonHeader, IonCard, IonPage, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel } from '@ionic/react';
import { SQLiteService } from '../services/SQLiteService';
import './Tab2.css';

class Tab2 extends React.Component {
  sqliteService:SQLiteService ;
  platform: string;

  constructor(props:any) {
    super(props);
    this.sqliteService = new SQLiteService();
    this.platform = "";
  }
  /*******************************
   * Component Lifecycle Methods *
   *******************************/

  async componentDidMount() {
    console.log('in componentDidMount')
    
    // Initialize the CapacitorSQLite plugin
    await this.sqliteService.initializePlugin();
    this.platform = this.sqliteService.platform.charAt(0).toUpperCase() + 
    this.sqliteService.platform.slice(1);

  }
  async componentDidUpdate() {
    console.log('in componentDidUpdate')
  }
  componentWillUnmount() {
    console.log('in componentWillUnmount')
  }

    /*******************************
   * Component Methods           *
   *******************************/

  async runTests(): Promise<void> {
    console.log("****** entering run tests")
    // In case of multiple test runs
    this.resetDOM()
    // Start Running the Set of Tests
    const cardSQLite = document.querySelector('.card-sqlite');
    if(cardSQLite && cardSQLite.classList.contains("hidden")) cardSQLite.classList.remove('hidden');
    console.log('this.sqliteService.isService ',this.sqliteService.isService)
    if(this.sqliteService.isService) {
      // delete databases to enable test restart
      // as after the first pass the database is encrypted
      const initTest: boolean = await this.testInitialization();
      let noEncryption:boolean = true;
      let executeSet:boolean = false;
      let allEncrypted: boolean = true;

      if(initTest) {
        // Create a Database with No-Encryption
        let testEl:any;
        noEncryption = await this.testNoEncryption();
        if(!noEncryption ) {     
          testEl = document.querySelector('.sql-failure1');
          if(testEl) testEl.classList.remove('display');
        } else {
          console.log("***** End testDatabase *****")
          testEl = document.querySelector('.sql-success1');
          if(testEl) testEl.classList.remove('display');
        }
        // Create a database and test executeSet
        executeSet = await this.testExecuteSet();
        if(!executeSet) {
          testEl = document.querySelector('.sql-failure7');
          if(testEl) testEl.classList.remove('display');
        } else {
          console.log("***** End test ExecuteSet *****")
          testEl = document.querySelector('.sql-success7');
          if(testEl) testEl.classList.remove('display');
        }       
        //
        if(noEncryption && executeSet 
              && this.sqliteService.platform !== "electron") {
          // Encrypt the Non Encrypted Database
          const encryption: boolean = await this.testEncryptionDatabase();
          if(!encryption) {
            const testEl = document.querySelector('.sql-failure2');
            if(testEl) testEl.classList.remove('display');
          } else {
            console.log("***** End test EncryptionDatabase *****")
            const testEl = document.querySelector('.sql-success2');
            if(testEl) testEl.classList.remove('display');
          }
          // Create a Database Encrypted
          const encrypted: boolean = await this.testEncryptedDatabase();
          if(!encrypted) {
            const testEl = document.querySelector('.sql-failure3');
            if(testEl) testEl.classList.remove('display');
          } else {
            console.log("***** End test Encrypted Database *****")
            const testEl = document.querySelector('.sql-success3');
            if(testEl) testEl.classList.remove('display');
          }
          // Try opening an Encrypted Database with wrong secet
          const wrongSecret: boolean = await this.testWrongSecret();
          if (!wrongSecret) {
            const testEl = document.querySelector('.sql-failure4');
            if(testEl) testEl.classList.remove('display');
          } else {
            const testEl = document.querySelector('.sql-success4');
            if(testEl) testEl.classList.remove('display');
          } 
          // Giving a New Secret to an Encrypted  Database 
          const changeSecret: boolean = await this.testChangePassword();
          if(!changeSecret) {
            const testEl = document.querySelector('.sql-failure5');
            if(testEl) testEl.classList.remove('display');
          } else {
            const testEl = document.querySelector('.sql-success5');
            if(testEl) testEl.classList.remove('display');
          }
          // Open the Encrypted Database with the new secret
          const newSecret: boolean = await this.testDatabaseNewPassword();
          if(!newSecret) {
            const testEl = document.querySelector('.sql-failure6');
            if(testEl) testEl.classList.remove('display');
          } else {
            const testEl = document.querySelector('.sql-success6');
            if(testEl) testEl.classList.remove('display');
          }
          if(!encryption || !encrypted || !wrongSecret || !changeSecret || !newSecret) { 
            allEncrypted = false;
          }
        }
      }
        // Manage All Tests Success/Failure
        if(!noEncryption || !executeSet || !allEncrypted) {     
          const testEl = document.querySelector('.sql-allfailure');
          if(testEl) testEl.classList.remove('display');
        } else {
          const testEl = document.querySelector('.sql-allsuccess');
          if(testEl) testEl.classList.remove('display');
        }

    } else {
      if(this.sqliteService.platform === "web") {
        const testEl = document.querySelector('.web');
        if(testEl) testEl.classList.remove('display');
      } else {
        console.log('CapacitorSQLite Plugin: Initialization Failed');
        const testEl = document.querySelector('.sql-allfailure');
        if(testEl) testEl.classList.remove('display');
      }
    }
  }
/**
 * Test Initialization
 */
  async testInitialization(): Promise<boolean> {
    return new Promise(async (resolve) => {
      if(this.sqliteService.platform === "ios" || this.sqliteService.platform === "android" 
          || this.sqliteService.platform === "electron") {
        await this.deleteADatabase("test-sqlite");
        await this.deleteADatabase("test-encrypted");
        const echo = await this.sqliteService.getEcho("Hello from JEEP");
        console.log("*** echo ",echo);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
/**
 * Delete a database
 */
async deleteADatabase(dbName: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      this.sqliteService.isDBExists(dbName) 
      let result:any = await this.sqliteService.isDBExists(dbName);
      if(result.result) {
          let resOpen: any = await this.sqliteService.openDB(dbName,true,"secret");
          if(resOpen.result) {
            let resDel: any = await this.sqliteService.deleteDB(dbName)
            if(!resDel.result) {
              console.log("Error in deleting the database " + dbName);
              resolve(false);
            } else {
              console.log("Database " + dbName + " has been deleted");
              resolve(true);
            }
          }
      } else {
        resolve(true);
      }
    });
  }
  /**
   * Reset the DOM
   */
  async resetDOM(): Promise<void> {
    const cardSQLite = document.querySelector('.card-sqlite');
    if(cardSQLite) {
      if (!cardSQLite.classList.contains("hidden")) cardSQLite.classList.add('hidden');
      for (let i:number=0;i< cardSQLite.childElementCount;i++) {
        if(!cardSQLite.children[i].classList.contains('display')) cardSQLite.children[i].classList.add('display');
      }
    }
  }

  /**
   * Test a non-encrypted database
   */
  async testNoEncryption(): Promise<boolean> {
    return new Promise(async (resolve,reject) => {
      // open the database
      let result: any = await this.sqliteService.openDB("test-sqlite"); 
      if(result.result) {
        console.log("*** Database test-sqlite Opened");
        const testEl = document.querySelector('.openDB');
        if(testEl) testEl.classList.remove('display');

        // create tables
        const sqlcmd: string = `
        BEGIN TRANSACTION;
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY NOT NULL,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          company TEXT,
          size FLOAT,
          age INTEGER
        );
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY NOT NULL,
          userid INTEGER,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          FOREIGN KEY (userid) REFERENCES users(id) ON DELETE SET DEFAULT
        );
        PRAGMA user_version = 1;
        COMMIT TRANSACTION;
        `;
        result = await this.sqliteService.execute(sqlcmd);
        if(result.changes.changes === 0 || result.changes.changes === 1) {
          let testEl = document.querySelector('.execute1');
          if(testEl) testEl.classList.remove('display'); 

          // Insert some Users
          let sqlcmd: string = `
          BEGIN TRANSACTION;
          DELETE FROM users;
          INSERT INTO users (name,email,age) VALUES ("Whiteley","Whiteley.com",30);
          INSERT INTO users (name,email,age) VALUES ("Jones","Jones.com",44);
          COMMIT TRANSACTION;
          `;
          result = await this.sqliteService.execute(sqlcmd);
          const retEx2 = result.changes.changes === 2 ? true : false;
          testEl = document.querySelector('.execute2');
          if(retEx2 && testEl) testEl.classList.remove('display'); 
          // Select all Users
          sqlcmd = "SELECT * FROM users";
          result = await this.sqliteService.query(sqlcmd);
          const retQuery1 = result.values.length === 2 &&
          result.values[0].name === "Whiteley" && result.values[1].name === "Jones" ? true : false;
          testEl = document.querySelector('.query1');
          if(retQuery1 && testEl) testEl.classList.remove('display'); 
          // add one user with statement and values              
          sqlcmd = "INSERT INTO users (name,email,age) VALUES (?,?,?)";
          let values: Array<any>  = ["Simpson","Simpson@example.com",69];
          result = await this.sqliteService.run(sqlcmd,values);
          const retRun1 = result.changes.changes === 1 &&
                          result.changes.lastId === 3 ? true : false;
          testEl = document.querySelector('.run1');
          if(retRun1 && testEl) testEl.classList.remove('display'); 
          // add one user with statement              
          sqlcmd = `INSERT INTO users (name,email,age) VALUES ("Brown","Brown@example.com",15)`;
          result = await this.sqliteService.run(sqlcmd);
          const retRun2 = result.changes.changes === 1 &&
                          result.changes.lastId === 4 ? true : false;
          testEl = document.querySelector('.run2');
          if(retRun2 && testEl) testEl.classList.remove('display'); 

          // Select all Users
          sqlcmd = "SELECT * FROM users";
          result = await this.sqliteService.query(sqlcmd);
          const retQuery3 = result.values.length === 4 ? true : false;
          testEl = document.querySelector('.query3');
          if(retQuery3 && testEl) testEl.classList.remove('display'); 

          // Select Users with age > 35
          sqlcmd = "SELECT name,email,age FROM users WHERE age > ?";
          values = ["35"];
          result = await this.sqliteService.query(sqlcmd,values);
          const retQuery4 = result.values.length === 2 ? true : false;
          testEl = document.querySelector('.query4');
          if(retQuery4 && testEl) testEl.classList.remove('display'); 

          // Insert some Messages
          sqlcmd = `
          BEGIN TRANSACTION;
          DELETE FROM messages;
          INSERT INTO messages (userid,title,body) VALUES (1,"test post 1","content test post 1");
          INSERT INTO messages (userid,title,body) VALUES (2,"test post 2","content test post 2");
          INSERT INTO messages (userid,title,body) VALUES (1,"test post 3","content test post 3");
          COMMIT TRANSACTION;
          `;
          result = await this.sqliteService.execute(sqlcmd);
          const retEx3 = result.changes.changes === 3 ? true : false;
          testEl = document.querySelector('.execute3');
          if(retEx3 && testEl) testEl.classList.remove('display'); 
          // Select all Messages
          sqlcmd = "SELECT * FROM messages";
          result = await this.sqliteService.query(sqlcmd);
          const retQuery2 = result.values.length === 3 &&
              result.values[0].title === "test post 1" && result.values[1].title === "test post 2" 
              && result.values[2].title === "test post 3" ? true : false;
          testEl = document.querySelector('.query2');
          if(retQuery2 && testEl) testEl.classList.remove('display'); 
          // Close the Database
          result = await this.sqliteService.close("test-sqlite")
          const retClose = result.result ? true : false;
          testEl = document.querySelector('.close');
          if(retClose && testEl) testEl.classList.remove('display');
          let ret = false;
          if(retEx2 && retQuery1 && retRun1 && retRun2 && retQuery3 && retQuery4 &&
            retEx3 && retQuery2  && retClose) ret = true;
          resolve(ret);

        } else {
          resolve(false);
        }
      } else {
        console.log("*** Error: Database test-sqlite not opened");
        resolve(false);
      }
    });   
  }
  /**
   * Test executeSet command
   */
  async testExecuteSet(): Promise<boolean> {
    return new Promise(async (resolve) => {
      // open the database
      let result:any = await this.sqliteService.openDB("test-executeset"); 
      if(result.result) {

        result = await this.sqliteService.createSyncTable();
        console.log("after createSyncTable ",result)
        console.log('****** create db ******');
        // create tables
        let sqlcmd: string = `
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
        result = await this.sqliteService.execute(sqlcmd);
        if(result.changes.changes === -1) resolve(false);
        let set: Array<any>  = [
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
        result = await this.sqliteService.executeSet(set);
        if(result.changes.changes !== 5) resolve(false);
        set = [
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
        result = await this.sqliteService.executeSet(set);
        if(result.changes.changes !== 3) resolve(false);
        sqlcmd = "SELECT * FROM users;";
        result = await this.sqliteService.query(sqlcmd);
        if(result.values.length !== 4) resolve(false);
        sqlcmd = "SELECT * FROM messages;";
        let result1: any = await this.sqliteService.query(sqlcmd);
        if(result1.values.length !== 3) resolve(false);
        // Delete user with id = 1
        sqlcmd = "DELETE FROM users WHERE id = 1;";
        result = await this.sqliteService.run(sqlcmd);
        if(result.changes.changes !== 3) resolve(false);
        sqlcmd = "SELECT * FROM users;";
        result = await this.sqliteService.query(sqlcmd);

        if(result.values.length !== 3) resolve(false);
        sqlcmd = "SELECT * FROM messages;";
        result1 = await this.sqliteService.query(sqlcmd);
        if(result1.values.length !== 1) resolve(false);
        resolve(true);
      } else {
        resolve(false);
      } 
    });
  }
  /**
  * Test an encrypted database
  */
  async testEncryptedDatabase(): Promise<boolean> {
    return new Promise(async (resolve) => {
      // open the database
      let result:any = await this.sqliteService.openDB("test-encrypted",true,"secret"); 
      if(result.result) {
        console.log("*** Database test-encrypted Opened");
        // Create Tables if not exist
        let sqlcmd: string = `
        BEGIN TRANSACTION;
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY NOT NULL,
            email TEXT UNIQUE NOT NULL,
            name TEXT
        );
        PRAGMA user_version = 1;
        COMMIT TRANSACTION;
        `;
        result = await this.sqliteService.execute(sqlcmd);
        const retEx1 = result.changes.changes === 0 || result.changes.changes === 1 ? true : false;
        if(retEx1) {
          // Insert some Contacts
          sqlcmd = `
          BEGIN TRANSACTION;
          DELETE FROM contacts;
          INSERT INTO contacts (name,email) VALUES ("Whiteley","Whiteley.com");
          INSERT INTO contacts (name,email) VALUES ("Jones","Jones.com");
          COMMIT TRANSACTION;
          `;
          result = await this.sqliteService.execute(sqlcmd);
          const retEx2 = result.changes.changes === 2 ? true : false;

          // Select all Contacts
          sqlcmd = "SELECT * FROM contacts";
          result = await this.sqliteService.query(sqlcmd);
          const retQuery1 = result.values.length === 2 && result.values[0].name === "Whiteley" 
            && result.values[1].name === "Jones" ? true : false;

          // Close the Database
          result = await this.sqliteService.close("test-encrypted");
          const retClose = result.result;
          if(retEx2 && retQuery1 && retClose) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      } else {
          console.log("*** Error: Database test-encrypted not opened");
          resolve(false);
      }
    });
  }
  /**
  * Try opening an encrypted database with wrong secret
  */
  async testWrongSecret(): Promise<boolean> {
    return new Promise(async (resolve) => {
      // open the database
      const result: any = await this.sqliteService.openDB("test-encrypted",true,"wrongsecret"); 
      if(!result.result) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
  /**
  * Change the secret of an encrypted database
  */

  async testChangePassword(): Promise<boolean> {
    return new Promise(async (resolve,) => {
      // open the database
      let result:any = await this.sqliteService.openDB("test-encrypted",true,"newsecret"); 
      if(result.result) {
        console.log("*** Database test-encrypted Opened");
        let sqlcmd: string = "SELECT * FROM contacts";
        result = await this.sqliteService.query(sqlcmd);
        const retQuery1 = result.values.length === 2 && result.values[0].name === "Whiteley" 
        && result.values[1].name === "Jones" ? true : false;

        // Close the Database
        result = await this.sqliteService.close("test-encrypted");
        const retClose = result.result;
        if(retQuery1 && retClose) {
          resolve(true);
        } else {
          resolve(false);
        }

      } else {
        console.log("*** Error: Database test-encrypted not opened");
        resolve(false);
      }
    });
  }
  /**
  * Open an encrypted database after having change the secret
  */

  async testDatabaseNewPassword(): Promise<boolean> {
    return new Promise(async (resolve) => {
      // open the database
      let result:any = await this.sqliteService.openDB("test-encrypted",true,"secret"); 
      if(result.result) {
        console.log("*** Database test-encrypted Opened");
        let sqlcmd: string = "SELECT * FROM contacts";
        result = await this.sqliteService.query(sqlcmd);
        const retQuery1 = result.values.length === 2 && result.values[0].name === "Whiteley" 
        && result.values[1].name === "Jones" ? true : false;

        // Close the Database
        result = await this.sqliteService.close("test-encrypted");
        const retClose = result.result;
        if(retQuery1 && retClose) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        console.log("*** Error: Database test-encrypted not opened");
        resolve(false);
      }
    });
  }

  /**
  * Encrypt a Non-Encrypted Database
  */
  async testEncryptionDatabase(): Promise<boolean> {
    return new Promise(async(resolve) => {
      // open the database
      let result:any = await this.sqliteService.openDB("test-sqlite",true,"encryption"); 
      if(result.result) {

        // Select all Users
        let sqlcmd:string = "SELECT * FROM users";
        result = await this.sqliteService.query(sqlcmd);
        const retQuery1 = result.values.length === 4 &&
            result.values[0].name === "Whiteley" && result.values[1].name === "Jones" &&
            result.values[2].name === "Simpson" && result.values[3].name === "Brown"
            ? true : false;

        // Select all Messages
        sqlcmd = "SELECT * FROM messages";
        result = await this.sqliteService.query(sqlcmd);
        const retQuery2 = result.values.length === 3 &&
            result.values[0].title === "test post 1" && result.values[1].title === "test post 2"
            && result.values[2].title === "test post 3" ? true : false;
        
        // Close the Database
        result = await this.sqliteService.close("test-encrypted");
        const retClose = result.result;
        if(retQuery1 && retQuery2 && retClose) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        console.log("*** Error: Database test-sqlite not opened");
        resolve(false);
      }
    });
  }

  /**
   * Render
   */
  render() {   

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Tab Two</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem routerLink="/tab2/details">
              <IonLabel>
                <h2>Go to detail</h2>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonButton onClick={this.runTests.bind(this)} expand="block">SQLite Test</IonButton>
            </IonItem>
          </IonList>
          <IonCard class="card-sqlite hidden">
            <p className="web display">
              SQLite Plugin not available for this Platform
            </p>
            <p className="openDB display">
              Open Database successful
            </p>
            <p className="execute1 display">
              Execute Creation Tables successful
            </p>
            <p className="execute2 display">
              Execute Insert Users successful
            </p>
            <p className="execute3 display">
              Execute Insert Messages successful
            </p>
            <p className="query1 display">
              Query Two Users successful
            </p>
            <p className="query2 display">
              Query Two Messages successful
            </p>
            <p className="run1 display">
              Create One User with sqlcmd and values successful
            </p>
            <p className="run2 display">
              Create One User with sqlcmd successful
            </p>
            <p className="query3 display">
              Query Four Users successful
            </p>
            <p className="query4 display">
              Query Users age above 30 successful
            </p>
            <p className="close display">
              Closing the database was successful
            </p>
            <p className="sql-success1 display">
              The test database was successful
            </p>
            <p className="sql-failure1 display">
              The test database failed
            </p>
            <p className="sql-success7 display">
              The test executeSet was successful
            </p>
            <p className="sql-failure7 display">
              The test executeSet failed
            </p>
            <p className="sql-success2 display">
              The test to encrypt the database was successful
            </p>
            <p className="sql-failure2 display">
              The test to encrypt the database failed
            </p>
            <p className="sql-success3 display">
              The test encrypted database was successful
            </p>
            <p className="sql-failure3 display">
              The test encrypted database failed
            </p>
            <p className="sql-success4 display">
              The test wrong password was successful
            </p>
            <p className="sql-failure4 display">
              The test wrong password failed
            </p>
            <p className="sql-success5 display">
              The test new password was successful
            </p>
            <p className="sql-failure5 display">
              The test new password failed
            </p>
            <p className="sql-success6 display">
              The test new password database was successful
            </p>
            <p className="sql-failure6 display">
              The test new password database failed
            </p>
            <p className="sql-allsuccess display">
              The set of tests was successful
            </p>
            <p className="sql-allfailure display">
              The set of tests failed
            </p>          
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }
};

export default Tab2;