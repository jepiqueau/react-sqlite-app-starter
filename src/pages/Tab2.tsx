import React from 'react';
import { IonContent, IonHeader, IonCard, IonPage, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel } from '@ionic/react';
import { SQLiteService } from '../services/SQLiteService';
import { concatAll } from 'rxjs/operators';
import { Observable, concat} from 'rxjs';
import './Tab2.css';

class Tab2 extends React.Component {
  sqliteService:SQLiteService ;

  constructor(props:any) {
    super(props);
    this.sqliteService = new SQLiteService();

  }
  /*******************************
   * Component Lifecycle Methods *
   *******************************/

  async componentDidMount() {
    console.log('in componentDidMount')
    
    // Initialize the CapacitorSQLite plugin
    await this.sqliteService.initializePlugin();
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
      if(this.sqliteService.platform === "ios" || this.sqliteService.platform === "android") {
        this.sqliteService.deleteDB("test-sqlite") 
        .subscribe(result => {
          console.log("delete database test-sqlite ",result.result);
        });
        this.sqliteService.deleteDB("test-encrypted") 
        .subscribe(result => {
          console.log("delete database test-encrypted ",result.result);
        }); 
      }
      this.sqliteService.getEcho("Hello from JEEP")
      .subscribe(echo => console.log("*** echo ",echo));
      // Create a Database with No-Encryption
      const noEncryption:boolean = await this.testNoEncryption();
      if(!noEncryption ) {     
        const testEl = document.querySelector('.sql-failure1');
        if(testEl) testEl.classList.remove('display');
      } else {
        console.log("***** End testDatabase *****")
        const testEl = document.querySelector('.sql-success1');
        if(testEl) testEl.classList.remove('display');
      }
      // Encrypt the Non Encrypted Database
      const encryption: boolean = await this.testEncryptionDatabase();
      if(!encryption) {
        const testEl = document.querySelector('.sql-failure2');
        if(testEl) testEl.classList.remove('display');
      } else {
        const testEl = document.querySelector('.sql-success2');
        if(testEl) testEl.classList.remove('display');
      }
      // Create a Database Encrypted
      const encrypted: boolean = await this.testEncryptedDatabase();
      if(!encrypted) {
        const testEl = document.querySelector('.sql-failure3');
        if(testEl) testEl.classList.remove('display');
      } else {
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

      // Manage All Tests Success/Failure
      if(!noEncryption || !encryption || !encrypted || !wrongSecret || !changeSecret || !newSecret) {     
        const testEl = document.querySelector('.sql-allfailure');
        if(testEl) testEl.classList.remove('display');
      } else {
        const testEl = document.querySelector('.sql-allsuccess');
        if(testEl) testEl.classList.remove('display');
      }

    } else {
      if(this.sqliteService.platform === "web") {
        console.log('CapacitorSQLite Plugin: Not available for Web Platform');
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
    return new Promise((resolve,reject) => {
      // open the database
      this.sqliteService.openDB("test-sqlite") 
      .subscribe(result => {
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
              age INTEGER
          );
          CREATE TABLE IF NOT EXISTS messages (
              id INTEGER PRIMARY KEY NOT NULL,
              title TEXT NOT NULL,
              body TEXT NOT NULL
          );
          PRAGMA user_version = 1;
          COMMIT TRANSACTION;
          `;
          this.sqliteService.execute(sqlcmd)
          .subscribe(result => {
            if(result.changes === 0 || result.changes === 1) {
              const testEl = document.querySelector('.execute1');
              if(testEl) testEl.classList.remove('display'); 
              let UsersObservables: Observable<any>[]=[];
              let MessagesObservables: Observable<any>[]=[];
              let AllObservables: Observable<any>[]=[]; 

              // Insert some Users
              let sqlcmd: string = `
              BEGIN TRANSACTION;
              DELETE FROM users;
              INSERT INTO users (name,email,age) VALUES ("Whiteley","Whiteley.com",30);
              INSERT INTO users (name,email,age) VALUES ("Jones","Jones.com",44);
              COMMIT TRANSACTION;
              `;
              UsersObservables.push(this.sqliteService.execute(sqlcmd));
              // Select all Users
              sqlcmd = "SELECT * FROM users";
              UsersObservables.push(this.sqliteService.query(sqlcmd));
              // add one user with statement and values              
              sqlcmd = "INSERT INTO users (name,email,age) VALUES (?,?,?)";
              let values: Array<any>  = ["Simpson","Simpson@example.com",69];
              UsersObservables.push(this.sqliteService.run(sqlcmd,values));
              // add one user with statement              
              sqlcmd = `INSERT INTO users (name,email,age) VALUES ("Brown","Brown@example.com",15)`;
              UsersObservables.push(this.sqliteService.run(sqlcmd));
              // Select all Users
              sqlcmd = "SELECT * FROM users";
              UsersObservables.push(this.sqliteService.query(sqlcmd));
              // Select Users with age > 35
              sqlcmd = "SELECT name,email,age FROM users WHERE age > ?";
              values = ["35"];
              UsersObservables.push(this.sqliteService.query(sqlcmd,values));
              // Insert some Messages
              sqlcmd = `
              BEGIN TRANSACTION;
              DELETE FROM messages;
              INSERT INTO messages (title,body) VALUES ("test post 1","content test post 1");
              INSERT INTO messages (title,body) VALUES ("test post 2","content test post 2");
              COMMIT TRANSACTION;
              `;
              MessagesObservables.push(this.sqliteService.execute(sqlcmd));
              // Select all Messages
              sqlcmd = "SELECT * FROM messages";
              MessagesObservables.push(this.sqliteService.query(sqlcmd));
              // Close the Database
              MessagesObservables.push(this.sqliteService.close("test-sqlite"));

              // Create one Observable to subscribe
              let resultOb: Array<any> = [];
              let results: Array<boolean> = [];
               
              const usersOb = concat(UsersObservables);
              const usersObs = usersOb.pipe(concatAll());
              const messagesOb = concat(MessagesObservables);
              const messagesObs = messagesOb.pipe(concatAll());
              AllObservables.push(usersObs);
              AllObservables.push(messagesObs);
              const allOb = concat(AllObservables);
              const allObs = allOb.pipe(concatAll());
              allObs.subscribe((result: any) => {
                resultOb = [...resultOb, result];
                },
                (e:any) => {
                  console.log('onError: %s', e);
                  resolve(false);
                },
                () => {
                  resultOb.forEach((element:any,index:number) => {
                    let res: boolean = false;
                    if(index === 0 && element.changes === 1) {
                      res = true;
                      const testEl = document.querySelector('.execute2');
                      if(testEl) testEl.classList.remove('display'); 
                    }
                    if(index === 1 && element.values.length === 2 &&
                       element.values[0].name === "Whiteley" && element.values[1].name === "Jones") {
                      const testEl = document.querySelector('.query1');
                      if(testEl) testEl.classList.remove('display'); 
                      res = true;       
                    }
                    if(index === 2 && element.changes === 1) {
                      res = true;
                      const testEl = document.querySelector('.run1');
                      if(testEl) testEl.classList.remove('display');        
                    }
                    if(index === 3 && element.changes === 1) {
                      res = true;
                      const testEl = document.querySelector('.run2');
                      if(testEl) testEl.classList.remove('display');        
                    }
                    if(index === 4 && element.values.length === 4) {
                      const testEl = document.querySelector('.query3');
                      if(testEl) testEl.classList.remove('display'); 
                      res = true;                           
                    }
                    if(index === 5 && element.values.length === 2) {
                      const testEl = document.querySelector('.query4');
                      if(testEl) testEl.classList.remove('display'); 
                      res = true;                           
                    }
                    if(index === 6 && element.changes === 1) {
                      res = true;
                      const testEl = document.querySelector('.execute3');
                      if(testEl) testEl.classList.remove('display'); 
                    }
                    if(index === 7 && element.values.length === 2 &&
                        element.values[0].title === "test post 1" && element.values[1].title === "test post 2") {
                      const testEl = document.querySelector('.query2');
                      if(testEl) testEl.classList.remove('display'); 
                      res = true;       
                    }
                    if(index === 8 && element.result) {
                      const testEl = document.querySelector('.close');
                      if(testEl) testEl.classList.remove('display'); 
                      res = true;                           
                    }
                    results = [...results,res];
                    if(index === resultOb.length -1) {
                      if(results.indexOf(false) === -1) {
                        resolve(true);       
                      } else {
                        resolve(false);
                      }
                    }
                  });

                }
              );

            } else {
              resolve(false);
            }
          });
        } else {
          console.log("*** Error: Database test-sqlite not opened");
          resolve(false);
        }
      });   
    });
  }

  /**
   * Test an encrypted database
   */
  async testEncryptedDatabase(): Promise<boolean> {
    return new Promise((resolve,reject) => {
      // open the database
      this.sqliteService.openDB("test-encrypted",true,"secret") 
      .subscribe(result => {
        if(result.result) {
          console.log("*** Database test-encrypted Opened");
          let ContactsObservables: Observable<any>[]=[];
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
          ContactsObservables.push(this.sqliteService.execute(sqlcmd));
          // Insert some Contacts
          sqlcmd = `
          BEGIN TRANSACTION;
          DELETE FROM contacts;
          INSERT INTO contacts (name,email) VALUES ("Whiteley","Whiteley.com");
          INSERT INTO contacts (name,email) VALUES ("Jones","Jones.com");
          COMMIT TRANSACTION;
          `;
          ContactsObservables.push(this.sqliteService.execute(sqlcmd));
          // Select all Contacts
          sqlcmd = "SELECT * FROM contacts";
          ContactsObservables.push(this.sqliteService.query(sqlcmd));
          // Close the Database
          ContactsObservables.push(this.sqliteService.close("test-encrypted"));

          // Create one Observable to subscribe
          let resultOb: Array<any> = [];
          let results: Array<boolean> = [];
            
          const contactsOb = concat(ContactsObservables);
          const contactsObs = contactsOb.pipe(concatAll());
          contactsObs.subscribe((result: any) => {
            resultOb = [...resultOb, result];
            },
            (e:any) => {
              console.log('onError: %s', e);
              resolve(false);
            },
            () => {
              resultOb.forEach((element:any,index:number) => {
                let res: boolean = false;
                if(index === 0 && (element.changes === 0 || element.changes === 1)) {
                  res = true;
                }
                if(index === 1 && element.changes >= 1) {
                  res = true;
                }
                if(index === 2 && element.values.length === 2 &&
                  element.values[0].name === "Whiteley" && element.values[1].name === "Jones") {
                  res = true;
                }
                if(index === 3 && element.result) {
                  res = true;                           
                }

                results = [...results,res];
                if(index === resultOb.length -1) {
                  if(results.indexOf(false) === -1) {
                    resolve(true);       
                  } else {
                    resolve(false);
                  }
                }
              });
            }
          );
        }else {
          console.log("*** Error: Database test-encrypted not opened");
          resolve(false);
        }
      });
    });
  }

  /**
   * Try opening an encrypted database with wrong secret
   */
  async testWrongSecret(): Promise<boolean> {
    return new Promise((resolve,reject) => {
      // open the database
      this.sqliteService.openDB("test-encrypted",true,"wrongsecret") 
      .subscribe(result => {
        if(!result.result) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * Change the secret of an encrypted database
   */
  async testChangePassword(): Promise<boolean> {
    return new Promise((resolve,reject) => {
      // open the database
      this.sqliteService.openDB("test-encrypted",true,"newsecret") 
      .subscribe(result => {
        if(result.result) {
          console.log("*** Database test-encrypted Opened");
          let ContactsObservables: Observable<any>[]=[];
          let sqlcmd: string = "SELECT * FROM contacts";
          ContactsObservables.push(this.sqliteService.query(sqlcmd));
          // Close the Database
          ContactsObservables.push(this.sqliteService.close("test-encrypted"));

          // Create one Observable to subscribe
          let resultOb: Array<any> = [];
          let results: Array<boolean> = [];
            
          const contactsOb = concat(ContactsObservables);
          const contactsObs = contactsOb.pipe(concatAll());
          contactsObs.subscribe((result: any) => {
            resultOb = [...resultOb, result];
            },
            (e:any) => {
              console.log('onError: %s', e);
              resolve(false);
            },
            () => {
              resultOb.forEach((element:any,index:number) => {
                let res: boolean = false;
                if(index === 0 && element.values.length === 2 &&
                  element.values[0].name === "Whiteley" && element.values[1].name === "Jones") {
                  res = true;
                }
                if(index === 1 && element.result) {
                  res = true;                           
                }

                results = [...results,res];
                if(index === resultOb.length -1) {
                  if(results.indexOf(false) === -1) {
                    resolve(true);       
                  } else {
                    resolve(false);
                  }
                }
              });
            }
          );
        } else {
          console.log("*** Error: Database test-encrypted not opened");
          resolve(false);
        }
      });
    });
  }

  /**
   * Open an encrypted database after having change the secret
   */
  async testDatabaseNewPassword(): Promise<boolean> {
    return new Promise((resolve,reject) => {
      // open the database
      this.sqliteService.openDB("test-encrypted",true,"secret") 
      .subscribe(result => {
        if(result.result) {
          console.log("*** Database test-encrypted Opened");
          let ContactsObservables: Observable<any>[]=[];
          let sqlcmd: string = "SELECT * FROM contacts";
          ContactsObservables.push(this.sqliteService.query(sqlcmd));
          // Close the Database
          ContactsObservables.push(this.sqliteService.close("test-encrypted"));

          // Create one Observable to subscribe
          let resultOb: Array<any> = [];
          let results: Array<boolean> = [];
            
          const contactsOb = concat(ContactsObservables);
          const contactsObs = contactsOb.pipe(concatAll());
          contactsObs.subscribe((result: any) => {
            resultOb = [...resultOb, result];
            },
            (e:any) => {
              console.log('onError: %s', e);
              resolve(false);
            },
            () => {
              resultOb.forEach((element:any,index:number) => {
                let res: boolean = false;
                if(index === 0 && element.values.length === 2 &&
                  element.values[0].name === "Whiteley" && element.values[1].name === "Jones") {
                  res = true;
                }
                if(index === 1 && element.result) {
                  res = true;                           
                }

                results = [...results,res];
                if(index === resultOb.length -1) {
                  if(results.indexOf(false) === -1) {
                    resolve(true);       
                  } else {
                    resolve(false);
                  }
                }
              });
            }
          );
        } else {
          console.log("*** Error: Database test-encrypted not opened");
          resolve(false);
        }
      });
    });
  }

  /**
   * Encrypt a Non-Encrypted Database
   */
  async testEncryptionDatabase(): Promise<boolean> {
    return new Promise((resolve,reject) => {
      // open the database
      this.sqliteService.openDB("test-sqlite",true,"encryption") 
      .subscribe(result => {
        if(result.result) {
          let Observables: Observable<any>[]=[];

          // Select all Users
          let sqlcmd:string = "SELECT * FROM users";
          Observables.push(this.sqliteService.query(sqlcmd));
          // Select all Messages
          sqlcmd = "SELECT * FROM messages";
          Observables.push(this.sqliteService.query(sqlcmd));
          // Close the Database
          Observables.push(this.sqliteService.close("test-sqlite"));
          const Ob = concat(Observables);
          const Obs = Ob.pipe(concatAll());
          let resultOb: Array<any> = [];
          let results: Array<boolean> = [];

          Obs.subscribe((result: any) => {
            resultOb = [...resultOb, result];
            },
            (e:any) => {
              console.log('onError: %s', e);
              resolve(false);
            },
            () => {
              resultOb.forEach((element:any,index:number) => {
                let res: boolean = false;
                if(index === 0 && element.values.length === 4 &&
                   element.values[0].name === "Whiteley" && element.values[1].name === "Jones" &&
                   element.values[2].name === "Simpson" && element.values[3].name === "Brown") {
                  res = true;       
                }
                if(index === 1 && element.values.length === 2 &&
                  element.values[0].title === "test post 1" && element.values[1].title === "test post 2") {
                  res = true;       
                }
                if(index === 2 && element.result) {
                  res = true;                           
                }
                results = [...results,res];
                if(index === resultOb.length -1) {
                  if(results.indexOf(false) === -1) {
                    resolve(true);       
                  } else {
                    resolve(false);
                  }
                }
              });
            }
          );
        } else {
          console.log("*** Error: Database test-sqlite not opened");
          resolve(false);
        }
      });
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
              SQLite Plugin not available for Web Platform
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
              Query Users age > 30 successful
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