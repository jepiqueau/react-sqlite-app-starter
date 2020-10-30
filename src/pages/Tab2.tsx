import React, { useState, useEffect} from 'react';
import { Capacitor } from '@capacitor/core';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel } from '@ionic/react';
import './Tab2.css';
import { useSQLite } from 'react-sqlite-hook/dist';
import { createTablesNoEncryption, importTwoUsers, importThreeMessages,
  dropTablesTablesNoEncryption } from '../Utils/utils-db-no-encryption';
import { createTablesExecuteSet, dropTablesTablesExecuteSet, setArrayUsers, setArrayMessages } from '../Utils/utils-db-execute-set';
const Tab2: React.FC = () => {

  const [log, setLog] = useState<string[]>([]);
  const [start, setStart] = useState(0);
  const platform = Capacitor.getPlatform();

  const startTest = () => {
    setStart(prev => prev + 1); 
  }

  const {openDB, createSyncTable, close, execute, executeSet, run, query,
    isDBExists, deleteDB, isJsonValid, importFromJson, exportToJson, setSyncDate} = useSQLite();
    
  useEffect( () => {
    async function testDatabaseNoEncryption(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testDatabaseNoEncryption *\n"));
      let result: any = await openDB("test-sqlite"); 
      if(result.result) {
        setLog((log) => log.concat(" Database 'test-sqlite' Opened\n"));
        // Drop tables if exists
        result = await execute(dropTablesTablesNoEncryption);
        if(result.changes.changes !== 0 && result.changes.changes !== 1) {
          setLog((log) => log.concat(" Execute1 failed\n"));
          return false;
        }
        // Create tables
        result = await execute(createTablesNoEncryption);
        if(result.changes.changes !== 0 && result.changes.changes !== 1) {
          setLog((log) => log.concat(" Execute2 failed\n"));
          return false;
        }
        // Insert two users with execute method
        result = await execute(importTwoUsers);
        if(result.changes.changes !== 2) {
          setLog((log) => log.concat(" Execute3 failed\n"));
          return false;
        }
        // Select all Users
        result = await query("SELECT * FROM users");
        if(result.values.length !== 2 ||
        result.values[0].name !== "Whiteley" || result.values[1].name !== "Jones") {
          setLog((log) => log.concat(" Select1 failed\n"));
          return false;
        }
        // add one user with statement and values              
        let sqlcmd = "INSERT INTO users (name,email,age) VALUES (?,?,?)";
        let values: Array<any>  = ["Simpson","Simpson@example.com",69];
        result = await run(sqlcmd,values);
        if(result.changes.changes !== 1 ||result.changes.lastId !== 3) {
          setLog((log) => log.concat(" Run1 failed\n"));
          return false;
        }
        // add one user with statement              
        sqlcmd = `INSERT INTO users (name,email,age) VALUES ("Brown","Brown@example.com",15)`;
        result = await run(sqlcmd);
        if(result.changes.changes !== 1 || result.changes.lastId !== 4) {
          setLog((log) => log.concat(" Run2 failed\n"));
          return false;
        }
        // Select all Users
        result = await query("SELECT * FROM users");
        if(result.values.length !== 4) {
          setLog((log) => log.concat(" Select2 failed\n"));
          return false;
        }
        // Select Users with age > 35
        sqlcmd = "SELECT name,email,age FROM users WHERE age > ?";
        values = ["35"];
        result = await query(sqlcmd,values);
        if(result.values.length !== 2) {
          setLog((log) => log.concat(" Select with filter on age failed\n"));
          return false;
        }
        // Import three messages
        result = await execute(importThreeMessages);
        if(result.changes.changes !== 3) {
          setLog((log) => log.concat(" Insert messages failed\n"));
          return false;
        }
        // Select all Messages
        result = await query("SELECT * FROM messages");
        if(result.values.length !== 3 ||
            result.values[0].title !== "test post 1" || result.values[1].title !== "test post 2" 
            || result.values[2].title !== "test post 3") {
          setLog((log) => log.concat(" Select messages failed\n"));
          return false;    
        }
        // Close the Database
        result = await close("test-sqlite")
        if(!result.result) {
          setLog((log) => log.concat(" Failed to close the database\n"));
          return false;    
        }       
        setLog((log) => log.concat("* Ending testDatabaseNoEncryption *\n"));     
        return true;
      } else {
        setLog((log) => log.concat(" Failed to open the database\n"));
        return false;    
      }

    }
    async function testDatabaseExecuteSet(): Promise<Boolean>  {
      setLog((log:any) => log.concat("* Starting testDatabaseExecuteSet *\n"));
      let result: any = await openDB("test-executeset"); 
      if(result.result) {
        setLog((log) => log.concat(" Database 'test-executeset' Opened\n"));
        // Drop tables if exists
        result = await execute(dropTablesTablesExecuteSet);
        if(result.changes.changes !== 0 && result.changes.changes !== 1) {
          setLog((log) => log.concat(" Execute1 failed\n"));
          return false;
        }
        // Create tables
        result = await execute(createTablesExecuteSet);
        if(result.changes.changes !== 0 && result.changes.changes !== 1) {
          setLog((log) => log.concat(" Execute2 failed\n"));
          return false;
        }
        // executeSet an Array of Users
        result = await executeSet(setArrayUsers);
        if(result.changes.changes !== 5) {
          setLog((log) => log.concat(" ExecuteSet1 failed\n"));
          return false;          
        }
        // executeSet an Array of Messages
        result = await executeSet(setArrayMessages);
        if(result.changes.changes !== 3) {
          setLog((log) => log.concat(" ExecuteSet2 failed\n"));
          return false;          
        }
        // Select all Users
        result = await query("SELECT * FROM users;");
        if(result.values.length !== 4) {
          setLog((log) => log.concat(" Query1 failed\n"));
          return false;          
        }
        // Select all Messages
        let result1: any = await query("SELECT * FROM messages;");
        if(result1.values.length !== 3) {
          setLog((log) => log.concat(" Query2 failed\n"));
          return false;          
        }
        // Delete user with id = 1
        result = await run("DELETE FROM users WHERE id = 1;");
        if(result.changes.changes !== 3) {
          setLog((log) => log.concat(" Delete users failed\n"));
          return false;          
        }
        // Select all users 
        result = await query("SELECT * FROM users;");
        if(result.values.length !== 3) {
          setLog((log) => log.concat(" Query3 failed\n"));
          return false;          
        }
        // Select all messages
        result1 = await query("SELECT * FROM messages;");
        if(result1.values.length !== 1) {
          setLog((log) => log.concat(" Query4 failed\n"));
          return false;          
        }
        setLog((log:any) => log.concat("* Ending testDatabaseExecuteSet *\n"));
        return true;
      } else {
        setLog((log) => log.concat(" Failed to open the database\n"));
        return false;  
      }
    }
    if(start > 0) {
      testDatabaseNoEncryption().then(res => {
        if(res) {
          testDatabaseExecuteSet().then(res => {
            if(res) {
              setLog((log) => log.concat("\n* The set of tests was successful *\n"));
            } else {
              setLog((log) => log.concat("\n* The set of tests failed *\n"));
            }  
          });
        } else {
          setLog((log) => log.concat("\n* The set of tests failed *\n"));
        }
      });


    }
  }, [openDB, createSyncTable, close, execute, executeSet, run, query, isDBExists, deleteDB,
    isJsonValid, importFromJson, exportToJson, setSyncDate, start]);   

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab Two</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 2</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <IonItem>
            <IonButton onClick={startTest} expand="block">SQLite No Encryption Tests</IonButton>
          </IonItem>
          {(platform === 'ios' || platform === 'android') &&
            <IonItem routerLink="/tab2/encrypted">
              <IonButton expand="block">SQLite Encrypted Tests</IonButton>
            </IonItem>
          }
          {(platform === 'ios' || platform === 'android') &&
            <IonItem routerLink="/tab2/encryption">
            <IonButton expand="block">SQLite Encryption Tests</IonButton>
            </IonItem>
          }
          <IonItem routerLink="/tab2/jsontest">
            <IonButton expand="block">SQLite Json Tests</IonButton>
          </IonItem>
          <IonItem routerLink="/tab2/upgradeversion">
            <IonButton expand="block">SQLite Upgrade Version Test</IonButton>
          </IonItem>
          <IonItem routerLink="/tab2/issue49">
            <IonButton expand="block">SQLite Test issue49</IonButton>
          </IonItem>
        </IonList>
        <pre>
          <p>{log}</p>
        </pre>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
