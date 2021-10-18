import React, { useState, useEffect, useRef } from 'react';
import './MigrateDB.css';
import { IonCard,IonCardContent } from '@ionic/react';
import { sqlite } from '../App';
import { Dialog } from '@capacitor/dialog';

const MigrateDB: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const errMess = useRef("");
    const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
    };

    useEffect( () => {
        const testMigrateDB = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testMigrateDB *\n"));
            try {
                const platform = (await sqlite.getPlatform()).platform;
                // test if the cordova databases where not at the "default" directory
                // here we assume that they were stored at "Files/Databases"
                // and there are at least two databases "testcopy.db" and "testfromfile.db"
                // in that directory, that we want to migrate
                let directory: string =  "Files/Databases";
                let cordDbList: string[] = ["testcopy.db","testfromfile.db"];
                if(platform === "ios") directory = "Applications/Files/Databases"
                if(platform === "android" ) directory = "files/databases";  
                if(platform === 'ios' || platform === 'android') {
                    // get the database list from folder
                    const dbList = await sqlite.getMigratableDbList(directory);
                    console.log(`dbList ${JSON.stringify(dbList)}`)
                    if(dbList.values && dbList.values.length !== 4) {
                        return Promise.reject(new Error("GetMigratableDbList failed"));
                    }
                    if(dbList.values && !dbList.values.includes(cordDbList[0])) {
                        return Promise.reject(new Error(`GetMigratableDbList no ${cordDbList[0]} in folder`));
                    }
                    if(dbList.values && !dbList.values.includes(cordDbList[1])) {
                        return Promise.reject(new Error(`GetMigratableDbList no ${cordDbList[1]} in folder`));
                    }
                    // if database exist add suffix and move them to the right folder
                    await sqlite.addSQLiteSuffix(directory, cordDbList);

                    // check if database "testcopy" exists
                    let result = await sqlite.isDatabase(cordDbList[0]);
                    if(!result.result) {
                        return Promise.reject(new Error(`Database ${cordDbList[0]} does not exist`));
                    }
                    // check if database "testfromfile" exists
                    result = await sqlite.isDatabase(cordDbList[1]);
                    if(!result.result) {
                        return Promise.reject(new Error(`Database ${cordDbList[1]} does not exist`));
                    }
                    // ************************************************
                    // Query the databases
                    // ************************************************

                    // create the connection to the database cordDbList[0]
                    const db = await sqlite
                                        .createConnection(cordDbList[0], false,
                                                        "no-encryption", 1);
                    if(db === null) return Promise.reject(new Error(`CreateConnection ${cordDbList[0]} failed`));

                    // open db testcopy
                    await db.open();
                    // check if the table "users" exists
                    result = await db.isTable("users");
                    if(!result.result) {
                        return Promise.reject(new Error(`Table 'users' does not exist in ${cordDbList[0]}`));
                    }

                    // check if the table "messages" exists
                    result = await db.isTable("messages");
                    if(!result.result) {
                        return Promise.reject(new Error(`Table 'messages' does not exist in ${cordDbList[0]}`));
                    }

                    // check if the table "images" exists
                    result = await db.isTable("images");
                    if(!result.result) {
                        return Promise.reject(new Error(`Table 'images' does not exist in ${cordDbList[0]}`));
                    }                    // 
                    // select all users in db
                    const users  = (await db.query("SELECT * FROM users;")).values;
                    let mUsers: any;
                    if(users) mUsers = users
                    if(mUsers.length !== 7) {
                        return Promise.reject(new Error(`Query Users failed in ${cordDbList[0]}`));
                    }
                    if(mUsers[0].name !== "Whiteley"
                            || mUsers[1].name !== "Jones"
                            || mUsers[2].name !== "Simpson"
                            || mUsers[3].name !== "Brown"
                            || mUsers[4].name !== "Jackson"
                            || mUsers[5].name !== "Kennedy"
                            || mUsers[6].name !== "Bush") {
                        return Promise.reject(new Error(`Query Users failed in ${cordDbList[0]}`));
                    }
                    // create the connection to the database cordDbList[1]
                    const db1 = await sqlite
                                        .createConnection(cordDbList[1], false,
                                                        "no-encryption", 1);
                    if(db1 === null) return Promise.reject(new Error(`CreateConnection ${cordDbList[1]} failed`));

                    // open db testcopy
                    await db1.open();
                    // check if the table "users" exists
                    result = await db1.isTable("users");
                    if(!result.result) {
                        return Promise.reject(new Error(`Table 'users' does not exist in ${cordDbList[1]}`));
                    }
                    // select all users in db1
                    const users1  = (await db1.query("SELECT * FROM users;")).values;
                    let mUsers1: any;
                    if(users1) mUsers1 = users1
                    if(mUsers1.length !== 7) {
                        return Promise.reject(new Error(`Query Users failed in ${cordDbList[1]}`));
                    }
                    if(mUsers1[0].name !== "Whiteley"
                            || mUsers1[1].name !== "Jones"
                            || mUsers1[2].name !== "Simpson"
                            || mUsers1[3].name !== "Brown"
                            || mUsers1[4].name !== "Jackson"
                            || mUsers1[5].name !== "Kennedy"
                            || mUsers1[6].name !== "Bush") {
                        return Promise.reject(new Error(`Query Users failed in ${cordDbList[1]}`));
                    }

                    // delete old databases
                    await sqlite.deleteOldDatabases(directory, cordDbList);
                    const oldDbList = (await sqlite.getMigratableDbList(directory)).values;
                    if(oldDbList && oldDbList.length !== 2) {
                    return Promise.reject(new Error("GetMigratableDbList failed after deleteOldDatabases"));
                    }
                    // close the connection "testcopy"
                    await sqlite.closeConnection(cordDbList[0]); 
                    // close the connection "testfromfile"
                    await sqlite.closeConnection(cordDbList[1]); 

                } else {
                   console.log(`Not available on ${platform} platform`);
                }                    
                return true;
            } catch (err: any) {
                errMess.current = `${err.message}`;
                return false;
            }
        }
        if(sqlite.isAvailable) {
            testMigrateDB().then(async res => {
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
         
      }, [errMess]);   
    
      
  return (
        <IonCard className="container-migratedb">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
                {errMess.current.length > 0 && <p>{errMess.current}</p>}
            </IonCardContent>
        </IonCard>
  );
};

export default MigrateDB;
