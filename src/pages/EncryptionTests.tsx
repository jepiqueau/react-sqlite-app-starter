import React, { useState, useEffect} from 'react';
//import { Capacitor } from '@capacitor/core';
import { IonBackButton, IonButtons, IonHeader, IonPage, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { useSQLite } from 'react-sqlite-hook/dist';
import { createTablesNoEncryption, importTwoUsers, importThreeMessages } from '../Utils/utils-db-no-encryption';
  
const EncryptionTests: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
/*  const platform = Capacitor.getPlatform();

  let onPermissionsRequest = undefined;
  if(platform === "android") {
    onPermissionsRequest = (permissionsGranted: number ) => {
      console.log(`onPermissionsRequest permissionsGranted : ${permissionsGranted}`);
    }
  };
*/
  const {openDB, createSyncTable, close, execute, executeSet, run, query,
    isDBExists, deleteDB, isJsonValid, importFromJson, exportToJson,
    setSyncDate} = useSQLite(/*{onPermissionsRequest}*/);
    
  useEffect( () => {
    /**
     * Test the encryption of an existing database
     */
    async function testEncryption(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testDatabaseEncryption *\n"));
      // Test if "test-encryption" exists and delete it for multiple test runs
      let result:any = await isDBExists("test-encryption"); 
      if(result.result) {
        // Delete the database if it exists              
        result = await openDB("test-encryption",true,"secret"); 
        if(result.result) {
          await deleteDB("test-encryption");
        }
      }
      // create a new database 
      result = await openDB("test-encryption"); 
      if(result.result) {
        setLog((log) => log.concat(" Database 'test-encryption' Opened\n"));
        // Create tables
        result = await execute(createTablesNoEncryption);
        if(result.changes.changes !== 0 && result.changes.changes !== 1) {
          setLog((log) => log.concat(" Execute1 failed\n"));
          return false;
        }
        // Insert two users with execute method
        result = await execute(importTwoUsers);
        if(result.changes.changes !== 2) {
          setLog((log) => log.concat(" Execute2 failed\n"));
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
        result = await close("test-encryption");
        if(!result.result) {
            setLog((log) => log.concat(" Close database 'test-encryption' failed\n"));
            return false;   
        }
    
        // do the encryption when opening the database
        result = await openDB("test-encryption",true,"encryption"); 
        if(result.result) {
          // Select all Users
          result = await query("SELECT * FROM users");
          if(result.values.length !== 3 ||
              result.values[0].name !== "Whiteley" || result.values[1].name !== "Jones"
                  || result.values[2].name !== "Simpson") {
              setLog((log) => log.concat(" Select Users failed\n"));
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
          result = await close("test-encryption");
          if(!result.result) {
              setLog((log) => log.concat(" Close database 'test-encryption' failed\n"));
              return false;   
          }
          setLog((log) => log.concat("* Ending testDatabaseEncryption *\n"));
          return true;
        } else {
          setLog((log) => log.concat(" Failed to encrypt the database\n"));
          return false;    
        }
      } else {
          setLog((log) => log.concat(" Failed to open the database\n"));
          return false;    
      }    
    }
    testEncryption().then(res => {
        if(res) {
            setLog((log) => log.concat("\n* The set of tests was successful *\n"));
        } else {
          setLog((log) => log.concat("\n* The set of tests failed *\n"));
        }  
    });
}, [openDB, createSyncTable, close, execute, executeSet, run, query, isDBExists, deleteDB,
    isJsonValid, importFromJson, exportToJson, setSyncDate]);   

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab2" />
          </IonButtons>
          <IonTitle>Encryption Tests</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <pre>
          <p>{log}</p>
        </pre>
      </IonContent>
    </IonPage>
  );
};

export default EncryptionTests;
