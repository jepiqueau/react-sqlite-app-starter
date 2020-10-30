import React, { useState, useEffect} from 'react';
import { IonBackButton, IonButtons, IonHeader, IonPage, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { useSQLite } from 'react-sqlite-hook/dist';
import { createTablesIssue49, dropTablesTablesIssue49, importTwoUsers } from '../Utils/utils-issue49';

const Issue49Tests: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const {openDB, createSyncTable, close, execute, executeSet, run, query,
      isDBExists, deleteDB, isJsonValid, importFromJson, exportToJson, setSyncDate} = useSQLite();
      
    useEffect( () => {
        /**
         * Test issue49 
         */
        async function testIssue49(): Promise<Boolean>  {
            setLog((log) => log.concat("* Starting testIssue49 *\n"));
            let result: any = await openDB("test-issue49"); 
            if(result.result) {
                setLog((log) => log.concat(" Database 'test-issue49' Opened\n"));
                // Drop tables if exists
                result = await execute(dropTablesTablesIssue49);
                if(result.changes.changes !== 0 && result.changes.changes !== 1) {
                    setLog((log) => log.concat(" Execute1 failed\n"));
                    return false;
                }
                // Create tables
                result = await execute(createTablesIssue49);
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
                setLog((log:any) => log.concat("* Ending testIssue49 *\n"));
                return true;
            } else {
                setLog((log) => log.concat(" Failed to open the database\n"));
                return false;          
            }
        }
        testIssue49().then(res => {
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
            <IonTitle>Issue49 Tests</IonTitle>
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

export default Issue49Tests;
