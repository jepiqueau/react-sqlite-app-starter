import React, { useState, useEffect} from 'react';
import { IonBackButton, IonButtons, IonHeader, IonPage, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { useSQLite } from 'react-sqlite-hook/dist';
import { dataToImport, partialImport1, tableTwoImports, dataTwoImports } from '../Utils/utils-import-from-json';

const JsonTests: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const {openDB, createSyncTable, close, execute, executeSet, run, query,
    isDBExists, deleteDB, isJsonValid, importFromJson, exportToJson, setSyncDate} = useSQLite();
    
  useEffect( () => {
    async function testImportFromJson(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testImportFromJson *\n"));
      // Test if "db-from-json" exists and delete it for multiple test runs
      let result:any = await isDBExists("db-from-json"); 
      if(result.result) {
          // open the DB
          let resOpen:any = await openDB("db-from-json"); 
          if(resOpen.result) {
            await deleteDB("db-from-json");
          }
      }
      // Full importFromJson
      result = await importFromJson(JSON.stringify(dataToImport));    
      if(result.changes.changes === -1 ) {
        setLog((log) => log.concat("Import Full failed\n"));
        return false;
      }
      // Partial ImportFromJson
      result = await importFromJson(JSON.stringify(partialImport1));
      if(result.changes.changes === -1 ) {
        setLog((log) => log.concat("Import Partial 1 failed\n"));
        return false;        
      }
      // create the async table
      result = await openDB("db-from-json"); 
      if(result.result) {
        result = await createSyncTable();
        if(result.changes.changes === 0 ) {
          setLog((log) => log.concat("Create Sync Table failed\n"));
          return false;        
        }
      }
      setLog((log) => log.concat("* Ending testImportFromJson *\n"));
      return true;
    }
    async function testFullExportToJson(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testExportToJson *\n"));
      // open the database
      let result:any = await openDB("db-from-json"); 
      if(result.result) {
        let result:any = await exportToJson("full");
        if (Object.keys(result.export).length === 0) {
          setLog((log) => log.concat("Return Json Object has no keys\n"));
          return false;
        } 
        const jsObj: string = JSON.stringify(result.export); 
        result = await isJsonValid(jsObj);
        if(!result.result) {
          setLog((log) => log.concat("Return Json Object not valid\n"));
          return false;
        }  
        setLog((log) => log.concat("* Ending testExportToJson *\n"));
        return true;
      } else {
        setLog((log) => log.concat("Failed to open the database\n"));
        return false;
      }
    }
    async function testTwoImports(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testTwoImports *\n"));
      // first import tables definition
      let result: any = await importFromJson(JSON.stringify(tableTwoImports));
      if(result.changes.changes === -1 ) {
        setLog((log) => log.concat("First import failed\n"));
        return false;
      }
      // second import data
      result = await importFromJson(JSON.stringify(dataTwoImports));
      if(result.changes.changes === -1 ) {
        setLog((log) => log.concat("Second import failed\n"));
        return false;
      }
      setLog((log) => log.concat("* Ending testTwoImports *\n"));
      return true;
    }

    testImportFromJson().then(res => {
      if(res) {
        testFullExportToJson().then(res => {
          if(res) {
            testTwoImports().then(res => {
              if(res) {
                setLog((log) => log.concat("\n* The set of tests was successful *\n"));
              } else {
                setLog((log) => log.concat("\n* The set of tests failed *\n"));
              }      
            });
          } else {
            setLog((log) => log.concat("*** The set of tests failed ***\n"));
          }  
        });
      } else {
        setLog((log) => log.concat("*** The set of tests failed ***\n"));
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
          <IonTitle>Json Tests</IonTitle>
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

export default JsonTests;
