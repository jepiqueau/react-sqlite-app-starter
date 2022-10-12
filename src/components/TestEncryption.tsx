import React, { useState, useEffect, useRef } from 'react';
import './TestEncryption.css';
import TestOutput from './TestOutput';
import { createTablesNoEncryption, importTwoUsers }
                            from '../Utils/noEncryptionUtils';
      
import { sqlite } from '../App';
import { deleteDatabase } from '../Utils/deleteDBUtil'; 
import { Dialog } from '@capacitor/dialog';

const TestEncryption: React.FC = () => {
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
    useEffect( () => {
        const testDatabaseEncryption = async (): Promise<boolean>  => {
            setOutput((output: { log: any; }) => ({log: output.log}));

            myLog.push("* Starting testDatabaseEncryption *\n");
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
                    errMess.current = `Execute changes != 2`;
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

                // select users where company is NULL in db
                ret = await db.query("SELECT * FROM users WHERE company IS NULL;");
                if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                            ret.values[1].name !== "Jones") {

                    errMess.current = `Query not returning 2 values`;
                    setOutput(() => ({log: myLog}));
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
                    setOutput(() => ({log: myLog}));
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
                    setOutput(() => ({log: myLog}));
                    return false;
                }

            // delete it for multiple successive tests
            await deleteDatabase(db);
            
            await sqlite.closeConnection("testEncryption"); 
            myLog.push("* Ending testDatabaseEncryption *\n");
            return true;
        } catch (err: any) {
            errMess.current = `${err.message}`;
            setOutput(() => ({log: myLog}));
            return false;
        }
    }
    if(sqlite.isAvailable) {
        if (myRef.current === false) {
            myRef.current = true;
            testDatabaseEncryption().then( async res => {
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

export default TestEncryption;
