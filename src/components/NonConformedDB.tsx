import React, { useState, useEffect, useRef } from 'react';
import './NonConformedDB.css';
import TestOutput from './TestOutput';
import { sqlite } from '../App';
import { Dialog } from '@capacitor/dialog';
import { SQLiteDBConnection } from 'react-sqlite-hook';

const NonConformedDB: React.FC = () => {
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
    const testNonConformedDB = async (): Promise<Boolean>  => {
        setOutput((output: { log: any; }) => ({log: output.log}));

        myLog.push("* Starting testNonConformedDB *\n");
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
                        errMess.current = `GetVersion: version failed`;
                        setOutput(() => ({log: myLog}));
                        return false;
                    }
                    const isDbOpen = await db.isDBOpen();
                    if(!isDbOpen.result) {
                        errMess.current = `IsDBOpen: database not opened`;
                        setOutput(() => ({log: myLog}));
                        return false;
                    }
                    // check if the table "contacts" exists
                    const isTable = await db.isTable("contacts")
                    if(!isTable.result) {
                        errMess.current = `Table 'contacts' does not exist in ${databasePath}`;
                        setOutput(() => ({log: myLog}));
                        return false;
                    }
                    // select all contacts in db
                    const retCts = await db.query("SELECT * FROM contacts;");
                    if(retCts !== undefined && retCts.values !== undefined) {
                        if(retCts.values.length !== 4 || 
                                retCts.values[0].name !== "Simpson" ||
                                retCts.values[1].name !== "Jones" ||
                                retCts.values[2].name !== "Whiteley" ||
                                retCts.values[3].name !== "Brown") {
                            errMess.current = `Query Contacts failed`;
                            setOutput(() => ({log: myLog}));
                            return false;
                        }
                        await sqlite.closeNCConnection(databasePath);     
                    } else {
                        errMess.current = `result of Query Contacts undefined"`;
                        setOutput(() => ({log: myLog}));
                        return false;
                    }
                } else {
                    errMess.current = `databasePath undefined"`;
                    setOutput(() => ({log: myLog}));
                    return false;
                }
            } else {
               console.log(`Not available on ${platform} platform`);
            }                    
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
                testNonConformedDB().then(async res => {
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
      );};

export default NonConformedDB;
