import React, { useState, useEffect} from 'react';
import { IonBackButton, IonButtons, IonHeader, IonPage, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { useSQLite } from 'react-sqlite-hook/dist';
import { createTablesEncrypted, createDataEncrypted } from '../Utils/utils-db-encrypted';

const EncryptedTests: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const {openDB, createSyncTable, close, execute, executeSet, run, query,
    isDBExists, deleteDB, isJsonValid, importFromJson, exportToJson, setSyncDate} = useSQLite();
    
  useEffect( () => {
    /**
     * Test an encrypted database
     */
    async function testEncrypted(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testEncrypted *\n"));
      // open the database
      let result:any = await openDB("test-encrypted",true,"secret"); 
      if(result.result) {
        setLog((log) => log.concat(" Database 'test-encrypted' Opened\n"));
        // create tables
        result = await execute(createTablesEncrypted);
        if (result.changes.changes !== 0 && result.changes.changes !== 1) {
          setLog((log) => log.concat(" createTablesEncrypted failed\n"));
          return false;
        }
        // Insert some Contacts
        result = await execute(createDataEncrypted);
        if(result.changes.changes !== 2) {
          setLog((log) => log.concat(" createDataEncrypted failed\n"));
          return false; 
        }
        // Select all Contacts
        result = await query("SELECT * FROM contacts;");
        if(result.values.length !== 2 || result.values[0].name !== "Whiteley" 
            || result.values[1].name !== "Jones") {
          setLog((log) => log.concat(" Select Contacts failed\n"));
          return false;   
        }
        // Close the Database
        result = await close("test-encrypted");
        if(!result.result) {
          setLog((log) => log.concat(" Close database 'test-encrypted' failed\n"));
          return false;   
        }
        setLog((log) => log.concat("* Ending testEncrypted *\n"));
        return true;
      } else {
        setLog((log) => log.concat(" Failed to open the database\n"));
        return false;    
      }
    }
    /**
     * Try opening an encrypted database with wrong secret
     */
    async function testWrongSecret(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testWrongSecret *\n"));
      const result: any = await openDB("test-encrypted",true,"wrongsecret"); 
      if(result.result) {
        setLog((log) => log.concat("* testWrongSecret failed *\n"));
        return false;
      }
      setLog((log) => log.concat("* Ending testWrongSecret *\n"));
      return true;
    }
    /**
     * Change the secret of an encrypted database
     */
    async function testChangePassword(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testChangePassword *\n"));
      // open the database
      let result:any = await openDB("test-encrypted",true,"newsecret"); 
      if(result.result) {
        // select all Contacts
        result = await query("SELECT * FROM contacts;");
        if( result.values.length !== 2 || result.values[0].name !== "Whiteley" 
            || result.values[1].name !== "Jones") {
          setLog((log) => log.concat(" Select Contacts failed\n"));
          return false;   
        }
        // Close the Database
        result = await close("test-encrypted");
        if(!result.result) {
          setLog((log) => log.concat(" Close database 'test-encrypted' failed\n"));
          return false;   
        }
        setLog((log) => log.concat("* Ending testChangePassword *\n"));
        return true;
      } else {
        setLog((log) => log.concat(" Failed to open the database\n"));
        return false;    
      }
    }
    /**
     * Open an encrypted database after having change the secret
     */
    async function testDatabaseNewPassword(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testDatabaseNewPassword *\n"));
      // open the database
      let result:any = await openDB("test-encrypted",true,"secret"); 
      if(result.result) {
        result = await deleteDB("test-encrypted");
        if(result.result) {         
          setLog((log) => log.concat("* Ending testDatabaseNewPassword *\n"));
          return true;
        } else {
          setLog((log) => log.concat(" Failed to delete the database\n"));
          return false;           
        }
      } else {
        setLog((log) => log.concat(" Failed to open the database\n"));
        return false;    
      }
    }
    testEncrypted().then(res => {
      if(res) {
        testWrongSecret().then(res => {
          if(res) {
            testChangePassword().then(res => {
              if(res) {
                testDatabaseNewPassword().then(res => {
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
          } else {
            setLog((log) => log.concat("\n* The set of tests failed *\n"));
          }
        });
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
          <IonTitle>Encrypted Tests</IonTitle>
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

export default EncryptedTests;
