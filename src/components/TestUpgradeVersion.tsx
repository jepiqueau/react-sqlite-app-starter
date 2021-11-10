import React, { useState, useEffect, useRef } from 'react';
import './TestUpgradeVersion.css';
import { IonCard,IonCardContent } from '@ionic/react';
import { createSchemaVersion1, twoUsers, createSchemaVersion2,
    setArrayVersion2, userMessages } from '../Utils/upgradeVersionUtils';

import { SQLiteDBConnection } from 'react-sqlite-hook';
      
import { sqlite } from '../App';
import { deleteDatabase } from '../Utils/deleteDBUtil';     
import { Dialog } from '@capacitor/dialog';

const TestUpgradeVersion: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const errMess = useRef("");
    const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
    };

    useEffect( () => {
        const databaseUpgradeVersion = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testDatabaseUpgradeVersion *\n"));
            // ************************************************
            // Create Database Version 1
            // ************************************************
            setLog((log) => log.concat("* Starting Create Version 1 *\n"));
            try {
                // initialize the connection for Database Version 1
                let db: SQLiteDBConnection = await sqlite
                            .createConnection("test-updversion", false,
                                            "no-encryption", 1);
                // check if the databases exist 
                // and delete it for multiple successive tests
                await deleteDatabase(db);

                // open db test-updversion
                await db.open();

                // create tables in db
                let ret: any = await db.execute(createSchemaVersion1);
                if (ret.changes.changes < 0) {
                    errMess.current = `Execute createSchemaVersion1 changes < 0`;
                    return false;
                }

                // add two users in db
                ret = await db.execute(twoUsers);
                if (ret.changes.changes !== 2) {
                    errMess.current = `Execute twoUsers changes != 2`;
                    return false;
                }
                // select all users in db
                ret = await db.query("SELECT * FROM users;");
                if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                            ret.values[1].name !== "Jones") {
                    errMess.current = `Query users not returning 2 values`;
                    return false;
                }
                // select users where company is NULL in db
                ret = await db.query("SELECT * FROM users WHERE company IS NULL;");
                if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                            ret.values[1].name !== "Jones") {
                    errMess.current = `Query users where company is NULL not returning 2 values`;
                    return false;
                }
                // select users where size is NULL in db
                ret = await db.query("SELECT * FROM users WHERE size IS NULL;");
                if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                            ret.values[1].name !== "Jones") {
                    errMess.current = `Query users where size is NULL not returning 2 values`;
                    return false;
                }
                // close db test-updversion
                await db.close();
                // close connection to test-updversion
                await sqlite.closeConnection("test-updversion"); 
                setLog((log) => log.concat("* Ending Database Version 1 *\n"));
        
                // ************************************************
                // Create Database Version 2
                // ************************************************

                // set the upgrade statement

                await sqlite
                    .addUpgradeStatement("test-updversion",
                                        {fromVersion: 1, toVersion: 2,
                                         statement: createSchemaVersion2,
                                         set: setArrayVersion2 });     

                // initialize the connection for Database Version 2
                db = await sqlite
                            .createConnection("test-updversion", false,
                            "no-encryption", 2);
                // open db test-updversion
                await db.open();
                // select all user's country in db
                ret = await db.query("SELECT country FROM users;");
                if(ret.values.length !== 2 ||
                    ret.values[0].country !== "United Kingdom" ||
                    ret.values[1].country !== "Australia") {
                    errMess.current = `Query country not returning 2 values`;
                    return false;
                }
                // select all messages for user 1
                ret = await db.query(userMessages,["1"]);
                if(ret.values.length !== 2 || 
                ret.values[0].name !== "Whiteley" ||
                ret.values[0].title !== "test message 1" ||
                ret.values[1].name !== "Whiteley" ||
                ret.values[1].title !== "test message 3") {
                    errMess.current = `Query userMessages not returning 2 values`;
                    return false;
                }
                // select all messages for user 2
                ret = await db.query(userMessages,["2"]);
                if(ret.values.length !== 1 || 
                ret.values[0].name !== "Jones" ||
                ret.values[0].title !== "test message 2") {
                    errMess.current = `Query userMessages ["2"] not returning 1 values`;
                    return false;   
                }
                // close connection to test-updversion
                await sqlite.closeConnection("test-updversion"); 
                return true;
            } catch (err: any) {
                errMess.current = `${err.message}`;
                return false;
            }
         }
        if(sqlite.isAvailable) {
            databaseUpgradeVersion().then(async res => {
                if(res) {    
                    setLog((log) => log
                        .concat("\n* The set of tests was successful *\n"));
                } else {
                    setLog((log) => log
                        .concat("\n* The set of tests failed *\n"));
                        await showAlert(errMess.current);
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
                    {errMess.current.length > 0 && <p>{errMess.current}</p>}
                </IonCardContent>
            </IonCard>
        );
    };
    
    export default TestUpgradeVersion;
    