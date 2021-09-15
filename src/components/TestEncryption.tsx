import React, { useState, useEffect, useRef } from 'react';
import './NoEncryption.css';
import { IonCard,IonCardContent } from '@ionic/react';
import { createTablesNoEncryption, importTwoUsers }
                            from '../Utils/noEncryptionUtils';
      
import { sqlite } from '../App';
import { deleteDatabase } from '../Utils/deleteDBUtil'; 
import { Dialog } from '@capacitor/dialog';

const TestEncryption: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const errMess = useRef("");
    const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
      };
    useEffect( () => {
        const testDatabaseEncryption = async (): Promise<boolean>  => {
            setLog((log) => log.concat("* Starting testDatabaseEncryption *\n"));
            // ************************************************
            // Create Database No Encryption
            // ************************************************
            try {
                // initialize the connection
                let db = await sqlite
                        .createConnection("testEncryption", false, "no-encryption", 1);

                // open db testEncryption
                await db.open();

                // create tables in db
                let ret: any = await db.execute(createTablesNoEncryption);
                console.log('$$$ ret.changes.changes in db ' + ret.changes.changes)
                if (ret.changes.changes < 0) {
                    errMess.current = `Execute changes < 0`;
                    return false;
                }

                // create synchronization table 
                ret = await db.createSyncTable();
                if (ret.changes.changes < 0) {
                    errMess.current = `CreateSyncTable changes < 0`;
                    return false;
                }
        
                // set the synchronization date
                const syncDate: string = "2020-11-25T08:30:25.000Z";
                await db.setSyncDate(syncDate);

                // add two users in db
                ret = await db.execute(importTwoUsers);
                if (ret.changes.changes !== 2) {
                    errMess.current = `Execute changes != 2`;
                    return false;
                }
                // select all users in db
                ret = await db.query("SELECT * FROM users;");
                if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                            ret.values[1].name !== "Jones") {
                    errMess.current = `Query not returning 2 values`;
                    return false;
                }

                // select users where company is NULL in db
                ret = await db.query("SELECT * FROM users WHERE company IS NULL;");
                if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                            ret.values[1].name !== "Jones") {

                    errMess.current = `Query not returning 2 values`;
                    return false;
                }
                // add one user with statement and values              
                let sqlcmd: string = 
                            "INSERT INTO users (name,email,age) VALUES (?,?,?)";
                let values: Array<any>  = ["Simpson","Simpson@example.com",69];
                ret = await db.run(sqlcmd,values);
                console.log()
                if(ret.changes.lastId !== 3) {
                    errMess.current = `Run lastId != 3`;
                    return false;
                }
                // add one user with statement              
                sqlcmd = `INSERT INTO users (name,email,age) VALUES ` + 
                                        `("Brown","Brown@example.com",15)`;
                ret = await db.run(sqlcmd);
                if(ret.changes.lastId !== 4) {
                    errMess.current = `Run lastId != 4`;
                    return false;
                }

                await sqlite.closeConnection("testEncryption"); 

                // ************************************************
                // Encrypt the existing database
                // ************************************************

                // initialize the connection
                db = await sqlite
                    .createConnection("testEncryption", true, "encryption", 1);

                // open db testEncryption
                await db.open();
                // close the connection
                await sqlite.closeConnection("testEncryption"); 

                // ************************************************
                // Use the existing encrypted database
                // ************************************************
                // initialize the connection
                db = await sqlite
                .createConnection("testEncryption", true, "secret", 1);

                // open db testEncryption
                await db.open();
            
                // add one user with statement and values              
                sqlcmd = 
                        "INSERT INTO users (name,email,age) VALUES (?,?,?)";
                values = ["Jackson","Jackson@example.com",32];
                ret = await db.run(sqlcmd,values);
                console.log()
                if(ret.changes.lastId !== 5) {
                    errMess.current = `Run lastId != 5`;
                    return false;
                }

                // select all users in db
                ret = await db.query("SELECT * FROM users;");
                if(ret.values.length !== 5 || ret.values[0].name !== "Whiteley" ||
                                            ret.values[1].name !== "Jones" ||
                                            ret.values[2].name !== "Simpson" ||
                                            ret.values[3].name !== "Brown" ||
                                            ret.values[4].name !== "Jackson") {
                    errMess.current = `Query not returning 5 values`;
                    return false;
                }

            // delete it for multiple successive tests
            await deleteDatabase(db);
            
            await sqlite.closeConnection("testEncryption"); 
            return true;
        } catch (err: any) {
            errMess.current = `${err.message}`;
            return false;
        }
    }
    if(sqlite.isAvailable) {
        testDatabaseEncryption().then( async res => {
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

export default TestEncryption;
