import React, { useState, useEffect } from 'react';
import './Test2dbs.css';
import { IonCard,IonCardContent } from '@ionic/react';

import { createTablesNoEncryption, importTwoUsers } from '../Utils/noEncryptionUtils';
import { createSchemaContacts, setContacts } from '../Utils/encryptedSetUtils';
import { deleteDatabase } from '../Utils/deleteDBUtil';     
      
import { sqlite, existingConn } from '../App';

const Test2dbs: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);

    useEffect( () => {
        const testtwodbs = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testTwoDBS *\n"));

            // initialize the connection
            const db = await sqlite
                .createConnection("testNew", false, "no-encryption", 1);
            const db1 = await sqlite
                .createConnection("testSet", true, "secret", 1);

            // check if the databases exist 
            // and delete it for multiple successive tests
            let ret: any = await deleteDatabase(db);
            ret = await deleteDatabase(db1);

            // open db testNew
            ret = await db.open();
            if (!ret.result) {
                return false;
            }

            // create tables in db
            ret = await db.execute(createTablesNoEncryption);
            if (ret.changes.changes < 0) {
                return false;
            }

            // create synchronization table 
            ret = await db.createSyncTable();
                if (ret.changes.changes < 0) {
            return false;
            }

            // set the synchronization date
            const syncDate: string = "2020-11-25T08:30:25.000Z";
                ret = await db.setSyncDate(syncDate);
            if(!ret.result) return false;


            // add two users in db
            ret = await db.execute(importTwoUsers);
            if (ret.changes.changes !== 2) {
                return false;
            }
            // select all users in db
            ret = await db.query("SELECT * FROM users;");
            if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                ret.values[1].name !== "Jones") {
            return false;
            }

            // open db testSet
            ret = await db1.open();
            if (!ret.result) {
                return false;
            }
            // create tables in db1
            ret = await db1.execute(createSchemaContacts);
            if (ret.changes.changes < 0) {
                return false;
            }
            // load setContacts in db1
            ret = await db1.executeSet(setContacts);
            if (ret.changes.changes !== 5) {
                return false;
            }

            // select users where company is NULL in db
            ret = await db.query("SELECT * FROM users WHERE company IS NULL;");
            if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                ret.values[1].name !== "Jones") {
                return false;
            }
            // add one user with statement and values              
            let sqlcmd: string = 
                "INSERT INTO users (name,email,age) VALUES (?,?,?)";
            let values: Array<any>  = ["Simpson","Simpson@example.com",69];
            ret = await db.run(sqlcmd,values);
            if(ret.changes.lastId !== 3) {
                return false;
            }
            // add one user with statement              
            sqlcmd = `INSERT INTO users (name,email,age) VALUES ` + 
                            `("Brown","Brown@example.com",15)`;
            ret = await db.run(sqlcmd);
            if(ret.changes.lastId !== 4) {
                return false;
            }
            setLog((log) => log.concat("* Ending testTwoDBS *\n"));
            existingConn.setExistConn(true);
            return true;
        }
        if(sqlite.isAvailable) {
            testtwodbs().then(res => {
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
        <IonCard className="container-test2dbs">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
            </IonCardContent>
        </IonCard>
  );
};

export default Test2dbs;
