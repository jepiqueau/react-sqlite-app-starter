import React, { useState, useEffect, useRef } from 'react';
import './CopyFromAssets.css';
import TestOutput from './TestOutput';
   
import { sqlite } from '../App';
import { SQLiteDBConnection } from 'react-sqlite-hook';
import { Dialog } from '@capacitor/dialog';
    
const CopyFromAssets: React.FC = () => {
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
    const testDatabaseCopyFromAssets = async (): Promise<Boolean>  => {
        setOutput((output: { log: any; }) => ({log: output.log}));

        myLog.push("* Starting testDatabaseCopyFromAssets *\n");
        try {

            await sqlite.copyFromAssets();
            myLog.push("> copyFromAssets successful\n");

            // create a connection for myDB
            let db: SQLiteDBConnection = await sqlite.createConnection("myDB");
            myLog.push("> createConnection " +
                                        " 'myDb' successful\n");
            await db.open();
            myLog.push("> open 'myDb' successful\n");
            // Select all Users
            let res: any = await db.query("SELECT * FROM users");
            console.log(`@@@ res.values.length ${res.values.length}`)
            if(res.values.length !== 7 ||
                res.values[0].name !== "Whiteley" ||
                res.values[1].name !== "Jones" ||
                res.values[2].name !== "Simpson" ||
                res.values[3].name !== "Brown" ||
                res.values[4].name !== "Jackson" ||
                res.values[5].name !== "Kennedy" ||
                res.values[6].name !== "Bush") {
                    errMess.current = `Query not returning 7 values`;
                    return false;
                }

                myLog.push("> query 'myDb' successful\n");

        
            // Close Connection MyDB        
            await sqlite.closeConnection("myDB"); 
            myLog.push("> closeConnection 'myDb' successful\n");

            // create a connection for dbForCopy
            db = await sqlite.createConnection("dbForCopy");
            myLog.push("> createConnection " +
                                        " 'dbForCopy' successful\n");
            await db.open();
            myLog.push("> open 'dbForCopy' successful\n");
            // Select all Users
            res = await db.query("SELECT * FROM areas");
            console.log(`@@@ res.values.length ${res.values.length}`)
            if(res.values.length !== 3 ||
                res.values[0].name !== "Access road" ||
                res.values[1].name !== "Accessway" ||
                res.values[2].name !== "Air handling system"){
                errMess.current = `Query Users not returning 3 values`;
                setOutput(() => ({log: myLog}));
                return false;
            }

            myLog.push("> query 'dbForCopy' successful\n");
            // Close Connection dbForCopy       
            await sqlite.closeConnection("dbForCopy"); 
            myLog.push("> closeConnection 'dbForCopy' successful\n");
                    
            myLog.push("* Ending testDatabaseCopyFromAssets *\n");

            return true;
        } catch (err: any) {
            errMess.current = `${err.message}`;
            setOutput(() => ({log: myLog}));
            return false;
        }
    }

    useEffect( () => {
        if(sqlite.isAvailable) {
            if (myRef.current === false) {
                myRef.current = true;
                testDatabaseCopyFromAssets().then(async res => {
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

export default CopyFromAssets;
