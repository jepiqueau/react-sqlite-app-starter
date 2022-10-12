import React, { useState, useEffect, useRef } from 'react';
import './ExistingConnection.css';
import TestOutput from './TestOutput';

import { setUsers } from '../Utils/noEncryptionUtils';
import { createSchemaMessages, setMessages } from '../Utils/encryptedSetUtils';
      
import { sqlite, existingConn } from '../App';
import { Dialog } from '@capacitor/dialog';

const ExistingConnection: React.FC = () => {
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
    const testExistingConns = async (): Promise<Boolean>  => {
        setOutput((output: { log: any; }) => ({log: output.log}));

        myLog.push("* Starting testExistingConns *\n");
        try {
            // retrieve the connections
            const db = await sqlite.retrieveConnection("testNew")
            const db1 = await sqlite.retrieveConnection("testSet")

            // load setUsers in db
            var ret: any = await db.executeSet(setUsers);
            console.log('$$$ ret.changes.changes in db ' + ret.changes.changes)
            if (ret.changes.changes !== 3) {
                errMess.current = `ExecuteSet setUsers changes != 3`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            // select all users in db
            ret = await db.query("SELECT * FROM users;");
            if(ret.values.length !== 7 || ret.values[0].name !== "Whiteley" ||
                                        ret.values[1].name !== "Jones" ||
                                        ret.values[2].name !== "Simpson" ||
                                        ret.values[3].name !== "Brown" ||
                                        ret.values[4].name !== "Jackson" ||
                                        ret.values[5].name !== "Kennedy" ||
                                        ret.values[6].name !== "Bush"
                                        ) {
                errMess.current = `Query users not returning 7 values`;
                setOutput(() => ({log: myLog}));
                return false;
            }

            // create table messages in db1
            ret = await db1.execute(createSchemaMessages);
            console.log('$$$ ret.changes.changes in db1 ' + ret.changes.changes)
            if (ret.changes.changes < 0) {
                errMess.current = `Execute createSchemaMessages changes < 0`;
                setOutput(() => ({log: myLog}));
                return false;
            }

            // load setMessages in db1
            ret = await db1.executeSet(setMessages);
            console.log('$$$ ret.changes.changes in db1 ' + ret.changes.changes)
            if (ret.changes.changes !== 3) {
                errMess.current = `ExecuteSet setMessages changes < 0`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            // select all users in db
            ret = await db1.query("SELECT * FROM messages;");
            if(ret.values.length !== 3 || ret.values[0].title !== "message 1" ||
                                        ret.values[1].title !== "message 2" ||
                                        ret.values[2].title !== "message 3"
                                        ) {
                errMess.current = `Query messages not returning 3 values`;
                setOutput(() => ({log: myLog}));
                return false;
            }

            // test retrieve all connections
            var retDict: Map<string, any> = await 
                                sqlite.retrieveAllConnections();
            if(!retDict.has("RW_testNew") || retDict.get("RW_testNew") !== db) {
                errMess.current = `retrieveAllConnections not returning "testNew"`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            if(!retDict.has("RW_testSet") || retDict.get("RW_testSet") !== db1) {
                errMess.current = `retrieveAllConnections not returning "testSet"`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            
            // close all connections
            sqlite.closeAllConnections();

            myLog.push("* Ending testExistingConns *\n");
            existingConn.setExistConn(false);
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
                testExistingConns().then(async res => {
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

export default ExistingConnection;
