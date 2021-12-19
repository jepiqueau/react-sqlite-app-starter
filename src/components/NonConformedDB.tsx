import React, { useState, useEffect, useRef } from 'react';
import './NonConformedDB.css';
import { IonCard,IonCardContent } from '@ionic/react';
import { sqlite } from '../App';
import { Dialog } from '@capacitor/dialog';
import { SQLiteDBConnection } from 'react-sqlite-hook';

const NonConformedDB: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const errMess = useRef("");
    const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
    };

    useEffect( () => {
        const testNonConformedDB = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testNonConformedDB *\n"));
            try {
                const platform = (await sqlite.getPlatform()).platform;
                // Assuming non-conformed "testncbd.db" in the "directory" folder
                let directory: string =  "files/databases";
                if(platform === "ios") directory = "Applications/Files/Databases"
                if(platform === "android" ) directory = "files/databases";  
                if(platform === 'ios' || platform === 'android') {
                    const databasePath = (await sqlite.getNCDatabasePath(directory,"testncdb.db")).path;
                    if(databasePath !== undefined) {
                        const isNCDbExists = (await sqlite.isNCDatabase(databasePath)).result;
                        const ret = await sqlite.checkConnectionsConsistency();
                        const isConn = (await sqlite.isNCConnection(databasePath)).result;
                        let db: SQLiteDBConnection
                        if (ret.result && isConn && isNCDbExists) {
                          db = await sqlite.retrieveNCConnection(databasePath);
                        } else {
                          db = await sqlite.createNCConnection(databasePath, 1);
                        }
                        // open db testncdb.db
                        await db.open();
                        // get the database version
                        let retVer = await db.getVersion();
                        if (retVer.version !== 1) {
                            return Promise.reject(new Error("GetVersion: version failed"));
                        }
                        const isDbOpen = await db.isDBOpen();
                        if(!isDbOpen.result) {
                            return Promise.reject(new Error("IsDBOpen: database not opened"));
                        }
                        // check if the table "contacts" exists
                        const isTable = await db.isTable("contacts")
                        if(!isTable.result) {
                            return Promise.reject(new Error(`Table 'contacts' does not exist in ${databasePath}`));
                        }
                        // select all contacts in db
                        const retCts = await db.query("SELECT * FROM contacts;");
                        if(retCts !== undefined && retCts.values !== undefined) {
                            if(retCts.values.length !== 4 || 
                                    retCts.values[0].name !== "Simpson" ||
                                    retCts.values[1].name !== "Jones" ||
                                    retCts.values[2].name !== "Whiteley" ||
                                    retCts.values[3].name !== "Brown") {
                                return Promise.reject(new Error("Query Contacts failed"));
                            }
                            await sqlite.closeNCConnection(databasePath);     
                        } else {
                            return Promise.reject(new Error("result of Query Contacts undefined"));
                        }
                    } else {
                        return Promise.reject(new Error("databasePath undefined"));
                    }
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
            testNonConformedDB().then(async res => {
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
        <IonCard className="container-nonconformedb">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
                {errMess.current.length > 0 && <p>{errMess.current}</p>}
            </IonCardContent>
        </IonCard>
  );
};

export default NonConformedDB;
