import React, { useState, useEffect} from 'react';
import { IonBackButton, IonButtons, IonHeader, IonPage, IonToolbar,
         IonTitle, IonContent } from '@ionic/react';
import { useSQLite } from 'react-sqlite-hook/dist';
import { schemaVersion1, dataVersion1, schemaVersion2,
        dataVersion2 } from '../Utils/utils-update-version';

//1234567890123456789012345678901234567890123456789012345678901234567890
const UpgradeVersionTest: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const {openDB, createSyncTable, close, execute, executeSet, run,
    query, isDBExists, deleteDB, isJsonValid, importFromJson,
    exportToJson, setSyncDate, addUpgradeStatement} = useSQLite();

    useEffect( () => {
        /**
         * Check if database already exists and delete it
         */
        async function testIsDBExists(): Promise<Boolean>  {
            setLog((log) => log.concat("* Starting testIsDBExists *\n"));
            // open the database
            let result:any = await isDBExists("test-updversion"); 
            if(result.result) {
                // from previous run version = 2
                let resOpen: any = await openDB("test-updversion", false,
                                                "no-encryption",2);  
                if(resOpen.result) {
                  let resDel: any = await deleteDB("test-updversion");
                  if(!resDel) {
                    setLog((log) => log.concat(
                        "* testIsDBExists: Delete DB Failed *\n"));
                    return false;
                  }
                } else {
                    setLog((log) => log.concat(
                        "* testIsDBExists: Open DB Failed *\n"));
                    return false;
                }
            }
            setLog((log) => log.concat("* Ending testIsDBExists *\n"));
            return true;
        }
        /**
         * Create version 1 of the database
         */
        async function testVersion1(): Promise<Boolean>  {
            setLog((log) => log.concat("* Starting testVersion1 *\n"));
            let resOpen: any = await openDB("test-updversion");  
            if(resOpen.result) {
                let result: any = await createSyncTable();
                if(result.changes.changes !== 1) {
                    setLog((log) => log.concat(
                        "* testVersion1: createSyncTable Failed *\n"));
                    return false;    
                }
                result = await execute(schemaVersion1);
                if(result.changes.changes !== 0 &&
                                result.changes.changes !== 1) {
                    setLog((log) => log.concat(
                        "* testVersion1: schemaVersion1 Failed *\n"));
                    return false;    
                }
                result = await execute(dataVersion1);
                if(result.changes.changes !== 2) {
                    setLog((log) => log.concat(
                        "* testVersion1: dataVersion1 Failed *\n"));
                    return false;    
                }
                result = await query("SELECT * FROM users;");
                if(result.values.length !== 2 ||
                            result.values[0].name !== "Whiteley" || 
                            result.values[1].name !== "Jones") {
                    setLog((log) => log.concat(
                        "* testVersion1: queryVersion1 Failed *\n"));
                    return false;    
                }
                setLog((log) => log.concat("* Ending testVersion1 *\n"));
                return true;  
            } else {
                setLog((log) => log.concat(
                    "* testVersion1: Open DB Failed *\n"));
                return false;
            }
        }
        /**
         * Upgrade database to version 2
         */
        async function testVersion2(): Promise<Boolean>  {
            setLog((log) => log.concat("* Starting testVersion2 *\n"));
            // Upgrade Statement
            console.log("* Starting testVersion2 ")
            let result: any = await addUpgradeStatement(
                "test-updversion", {fromVersion: 1, toVersion: 2,
                    statement: schemaVersion2, set: dataVersion2});     
                console.log("* testVersion2: addUpgradeStatement result " + result.result)
                if(!result.result) {
                setLog((log) => log.concat(
                    "* testVersion2: addUpgradeStatement Failed *\n"));
                return false;    
            }
            // open the database
            result = await openDB("test-updversion", false,
                                "no-encryption",2);
            if(!result.result) {
                setLog((log) => log.concat(
                    "* testVersion2: openDB Failed *\n"));
                return false;
            }
            result = await query("SELECT name,country FROM users;");
            if(result.values.length !== 2 ||
                        result.values[0].name !== "Whiteley" ||
                        result.values[0].country !== "United Kingdom" || 
                        result.values[1].name !== "Jones" ||
                        result.values[1].country !== "Australia") {
                setLog((log) => log.concat(
                    "* testVersion1: queryVersion2 Failed *\n"));
                return false;    
            } else{
                setLog((log) => log.concat("* Ending testVersion2 *\n"));
                return true;   
            }     
        }
        /**
         * Upgrade Version Test
         */

        setLog((log) => log.concat("* Starting upgradeVersionTest *\n"));            
        testIsDBExists().then(res => {
            if(res) {
                testVersion1().then(res => {
                    if(res) {
                        testVersion2().then(res => {
                            var msg: string;
                            if(res) {
                                msg = "\n* The set of tests";
                                msg += " was successful *\n"
                                setLog((log) => log.concat(msg));
                                return true;
                            } else {
                                msg = "\n* The set of tests";
                                msg += "  failed *\n"
                                setLog((log) => log.concat(msg));
                                return false;
                            }  
                        });
                    } else {
                        var msg: string = "\n* The test version1";
                        msg += "  failed *\n"
                        setLog((log) => log.concat(msg));
                        return false;
                    }
                });
            } else {
                var msg: string = "\n* The test isDBExists";
                msg += "  failed *\n"
                setLog((log) => log.concat(msg));
                return false;
            }
        });
    }, [openDB, createSyncTable, close, execute, executeSet, run, query,
        isDBExists, deleteDB, isJsonValid, importFromJson, exportToJson,
        setSyncDate, addUpgradeStatement]);   
    
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/tab2" />
              </IonButtons>
              <IonTitle>Upgrade Version Test</IonTitle>
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
    
    export default UpgradeVersionTest;
    