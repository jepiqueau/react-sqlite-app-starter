import React, { useState, useEffect, useRef } from 'react';
import './Test2dbs.css';
import TestOutput from './TestOutput';

import { createTablesNoEncryption, importTwoUsers } from '../Utils/noEncryptionUtils';
import { createSchemaContacts, setContacts } from '../Utils/encryptedSetUtils';
import { deleteDatabase } from '../Utils/deleteDBUtil';     
      
import { sqlite, existingConn } from '../App';
import { Dialog } from '@capacitor/dialog';

const Test2dbs: React.FC = () => {
    const myRef = useRef(false);
    const myLog: string[] = [];
    const errMess = useRef("");
    const [output, setOutput] = useState({log: myLog});
    const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
    };
    const testtwodbs = async (): Promise<Boolean>  => {
        setOutput((output: { log: any; }) => ({log: output.log}));

        myLog.push("* Starting testTwoDBS *\n");
        try {
            const platform = (await sqlite.getPlatform()).platform;
            // initialize the connection
            const db = await sqlite
                .createConnection("testNew", false, "no-encryption", 1);
            const db1 = await sqlite
                .createConnection("testSet", true, "secret", 1);

            // check if the databases exist 
            // and delete it for multiple successive tests
            await deleteDatabase(db);
            await deleteDatabase(db1);

            // open db testNew
            await db.open();
            myLog.push("> open 'testNew' successful\n");

            // create tables in db
            let ret: any = await db.execute(createTablesNoEncryption);
            if (ret.changes.changes < 0) {
                errMess.current = `Execute changes < 0`;
                setOutput(() => ({log: myLog}));
                return false;
            }

            // create synchronization table 
            ret = await db.createSyncTable();
            if (ret.changes.changes < 0) {
                errMess.current = `CreateSyncTable changes < 0`;
                setOutput(() => ({log: myLog}));
                return false;
            }

            // set the synchronization date
            const syncDate: string = "2020-11-25T08:30:25.000Z";
            await db.setSyncDate(syncDate);

            // add two users in db
            ret = await db.execute(importTwoUsers);
            if (ret.changes.changes !== 2) {
                errMess.current = `Execute importTwoUsers changes != 2`;
                setOutput(() => ({log: myLog}));
                return false;
            }

            // select all users in db
            ret = await db.query("SELECT * FROM users;");

            if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                ret.values[1].name !== "Jones") {
                errMess.current = `Query not returning 2 values`;
                setOutput(() => ({log: myLog}));
                return false;
            }

            // open db testSet
            await db1.open();
            myLog.push("> open 'testSet' successful\n");
            // create tables in db1
            ret = await db1.execute(createSchemaContacts);
            if (ret.changes.changes < 0) {
                errMess.current = `Execute createSchemaContacts changes < 0`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            // load setContacts in db1
            ret = await db1.executeSet(setContacts);
            if (ret.changes.changes !== 5) {
                errMess.current = `ExecuteSet setContacts changes != 5`;
                setOutput(() => ({log: myLog}));
                return false;
            }

            // select users where company is NULL in db
            ret = await db.query("SELECT * FROM users WHERE company IS NULL;");
            if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                ret.values[1].name !== "Jones") {
                errMess.current = `Query Company is NULL not returning 2 values`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            // add one user with statement and values              
            let sqlcmd: string = 
                "INSERT INTO users (name,email,age) VALUES (?,?,?)";
            let values: Array<any>  = ["Simpson","Simpson@example.com",69];
            ret = await db.run(sqlcmd,values);
            if(ret.changes.lastId !== 3) {
                errMess.current = `Run lastId != 3`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            // add one user with statement              
            sqlcmd = `INSERT INTO users (name,email,age) VALUES ` + 
                            `("Brown","Brown@example.com",15)`;
            ret = await db.run(sqlcmd);
            if(ret.changes.lastId !== 4) {
                errMess.current = `Run lastId != 4`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            if (platform === "web") {
                await sqlite.saveToStore("testNew");
                await sqlite.saveToStore("testSet");
            }
            myLog.push("* Ending testTwoDBS *\n");
            existingConn.setExistConn(true);
            return true;
        } catch (err:any) {
            errMess.current = `${err.message}`;
            return false;
        }
    }

    useEffect(() => {
        if(sqlite.isAvailable) {
          if (myRef.current === false) {
            myRef.current = true;
    
            testtwodbs().then(async res => {
                if(res) {    
                    myLog.push("\n* The set of tests was successful *\n");
                } else {
                    myLog.push("\n* The set of tests failed *\n");
                    await showAlert(errMess.current);
                }
                setOutput(() => ({log: myLog}));
              
            });
          }
        } else {
            sqlite.getPlatform().then(async (ret: { platform: string; })  =>  {
                myLog.push("\n* Not available for " + 
                                ret.platform + " platform *\n");
                await showAlert(errMess.current);
                setOutput(() => ({log: myLog}));
            });         
        }
    
      });
     
      return (
        <TestOutput dataLog={output.log} errMess={errMess.current}></TestOutput> 
      );
    };
    
export default Test2dbs;
