import React, { useState, useEffect } from 'react';
import './TestUpgradeVersion.css';
import { IonCard,IonCardContent } from '@ionic/react';
import { createSchemaVersion1, twoUsers, createSchemaVersion2,
    setArrayVersion2, userMessages } from '../Utils/upgradeVersionUtils';

import { SQLiteDBConnection } from 'react-sqlite-hook/dist';
      
import { sqlite } from '../App';
import { deleteDatabase } from '../Utils/deleteDBUtil';     
const TestUpgradeVersion: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);

    useEffect( () => {
        const databaseUpgradeVersion = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testDatabaseUpgradeVersion *\n"));
            // ************************************************
            // Create Database Version 1
            // ************************************************
            setLog((log) => log.concat("* Starting Create Version 1 *\n"));

            // initialize the connection for Database Version 1
            let db: SQLiteDBConnection = await sqlite
                        .createConnection("test-updversion", false,
                                        "no-encryption", 1);
            // check if the databases exist 
            // and delete it for multiple successive tests
            let ret: any = await deleteDatabase(db);

            // open db test-updversion
            ret = await db.open();
            if (!ret.result) {
            return false;
            }

            // create tables in db
            ret = await db.execute(createSchemaVersion1);
            if (ret.changes.changes < 0) {
            return false;
            }

            // add two users in db
            ret = await db.execute(twoUsers);
            if (ret.changes.changes !== 2) {
            return false;
            }
            // select all users in db
            ret = await db.query("SELECT * FROM users;");
            if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                        ret.values[1].name !== "Jones") {
            return false;
            }
            // select users where company is NULL in db
            ret = await db.query("SELECT * FROM users WHERE company IS NULL;");
            if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                        ret.values[1].name !== "Jones") {
            return false;
            }
            // select users where size is NULL in db
            ret = await db.query("SELECT * FROM users WHERE size IS NULL;");
            if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                        ret.values[1].name !== "Jones") {
            return false;
            }
            // close db test-updversion
            ret = await db.close();
            if (!ret.result) {
            return false;
            }
            // close connection to test-updversion
            ret = await sqlite.closeConnection("test-updversion"); 
            if(!ret.result) {
            return false; 
            }
            setLog((log) => log.concat("* Ending Database Version 1 *\n"));
        
            // ************************************************
            // Create Database Version 2
            // ************************************************

            // set the upgrade statement

            ret = await sqlite
                    .addUpgradeStatement("test-updversion",
                                        {fromVersion: 1, toVersion: 2,
                                         statement: createSchemaVersion2,
                                         set: setArrayVersion2 });     
            if(!ret.result) {
                console.log("*** Error: addUpgradeStatement failed");
            return false;
            }

            // initialize the connection for Database Version 2
            db = await sqlite
                        .createConnection("test-updversion", false,
                        "no-encryption", 2);
            // open db test-updversion
            ret = await db.open();
            if (!ret.result) {
            return false;
            }
            // select all user's country in db
            ret = await db.query("SELECT country FROM users;");
            if(ret.values.length !== 2 ||
                ret.values[0].country !== "United Kingdom" ||
                ret.values[1].country !== "Australia") {
            return false;
            }
            // select all messages for user 1
            ret = await db.query(userMessages,["1"]);
            if(ret.values.length !== 2 || 
            ret.values[0].name !== "Whiteley" ||
            ret.values[0].title !== "test message 1" ||
            ret.values[1].name !== "Whiteley" ||
            ret.values[1].title !== "test message 3") {
            return false;
            }
            // select all messages for user 2
            ret = await db.query(userMessages,["2"]);
            if(ret.values.length !== 1 || 
            ret.values[0].name !== "Jones" ||
            ret.values[0].title !== "test message 2") {
            return false;   
            }
            // close connection to test-updversion
            ret = await sqlite.closeConnection("test-updversion"); 
            if(!ret.result) {
            return false; 
            } else {
            return true;
            }
        }
        if(sqlite.isAvailable) {
            databaseUpgradeVersion().then(res => {
                if(res) {    
                    setLog((log) => log
                        .concat("\n* The set of tests was successful *\n"));
                } else {
                    setLog((log) => log
                        .concat("\n* The set of tests failed *\n"));
                }
            });
        } else {
            sqlite.getPlatform().then((ret: { platform: string; })  =>  {
                setLog((log) => log.concat("\n* Not available for " + 
                                    ret.platform + " platform *\n"));
            });         
        }
         
    }, []);   
    
      
        return (
            <IonCard className="container-encryption">
                <IonCardContent>
                    <pre>
                        <p>{log}</p>
                    </pre>
                </IonCardContent>
            </IonCard>
        );
    };
    
    export default TestUpgradeVersion;
    