import React, { useState, useEffect, useRef } from 'react';
import './TestUpgradeVersion.css';
import TestOutput from './TestOutput';
import { userMessages } from '../Utils/upgradeVersionUtils';
import { versionUpgrades } from '../Utils/upgrade-database-version';

import { SQLiteDBConnection, VersionUpgrade } from 'react-sqlite-hook';
      
import { sqlite } from '../App';
import { deleteDatabase } from '../Utils/deleteDBUtil';     
import { Dialog } from '@capacitor/dialog';

const TestUpgradeVersion: React.FC = () => {
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
    const databaseUpgradeVersion = async (): Promise<Boolean>  => {
        myLog.push("* Starting testDatabaseUpgradeVersion *\n");
        // ************************************************
        // Create Database Version 1 & Version 2
        // ************************************************
        myLog.push("* Starting Create Version 1 *\n");
        try {
            // initialize the connection for Database Version 1
            let db: SQLiteDBConnection = await sqlite
                        .createConnection("test-updversion", false,
                                        "no-encryption", 1);
            // check if the databases exist 
            // and delete it for multiple successive tests
            await deleteDatabase(db);

            // close connection to test-updversion
            await sqlite.closeConnection('test-updversion');

            for (const upgrade of versionUpgrades) {
                const vUpg: VersionUpgrade = {} as VersionUpgrade;
                vUpg.toVersion = upgrade.toVersion;
                vUpg.statements = upgrade.statements;
                await sqlite.addUpgradeStatement(
                    'test-updversion',
                    vUpg
                  );
            }
            db = await sqlite.createConnection("test-updversion", false,
                                               "no-encryption", 2);

            // open db test-updversion
            await db.open();

            // select all users in db
            let ret: any = await db.query("SELECT * FROM users;");
            if(ret.values.length !== 2 || ret.values[0].name !== "Whiteley" ||
                                        ret.values[1].name !== "Jones") {
                errMess.current = `Query users not returning 2 values`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            // select all user's country in db
            ret = await db.query("SELECT country FROM users;");
            if(ret.values.length !== 2 ||
                ret.values[0].country !== "United Kingdom" ||
                ret.values[1].country !== "Australia") {
                errMess.current = `Query country not returning 2 values`;
                setOutput(() => ({log: myLog}));
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
                setOutput(() => ({log: myLog}));
                return false;
            }
            // select all messages for user 2
            ret = await db.query(userMessages,["2"]);
            if(ret.values.length !== 1 || 
            ret.values[0].name !== "Jones" ||
            ret.values[0].title !== "test message 2") {
                errMess.current = `Query userMessages ["2"] not returning 1 values`;
                setOutput(() => ({log: myLog}));
                return false;   
            }
            // close db test-updversion
            await db.close();
            // close connection to test-updversion
            await sqlite.closeConnection("test-updversion"); 
            myLog.push("* Ending Database Version 1&2 *\n");
    
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
                databaseUpgradeVersion().then(async res => {
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

export default TestUpgradeVersion;
    