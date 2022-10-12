import React, { useState, useEffect, useRef } from 'react';
import './TestIssue184.css';
import TestOutput from './TestOutput';
      
import { sqlite } from '../App';
import { SQLiteDBConnection} from 'react-sqlite-hook';
import { Dialog } from '@capacitor/dialog';

const TestIssue184: React.FC = () => {
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
    const testDatabaseIssue184 = async (): Promise<Boolean>  => {
        setOutput((output: { log: any; }) => ({log: output.log}));

        myLog.push("* Starting testDatabaseIssue184 *\n");
            try {
            // create a connection for TestIssue184
            let db: SQLiteDBConnection = await sqlite.createConnection("steward");
            // open NoEncryption
            await db.open();
            myLog.push("> open 'steward' successful\n");
            myLog.push("executing create statements on next line\n");
            let res = await db.execute(`
                DROP TABLE IF EXISTS chores;
                DROP TABLE IF EXISTS items;

                CREATE TABLE IF NOT EXISTS chores (
                id INTEGER PRIMARY KEY,
                name TEXT,
                next_due DATE,
                completed BOOLEAN,
                repeats BOOLEAN,
                frequency INT
                );
    
                CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY,
                name TEXT,
                image TEXT,
                next_buy DATE,
                buy_from TEXT,
                supplied BOOLEAN
                );
                `);
            if(res.changes && res.changes.changes !== 0 &&
                res.changes.changes !== 1){
                errMess.current = `Execute create tables changes < 0`;
                setOutput(() => ({log: myLog}));
                return false;
            } 
            myLog.push(" executed create statements\n");

            myLog.push(" executing insert on next line\n");

            res = await db.execute(
                "INSERT INTO chores (name,next_due,completed,repeats,frequency) VALUES ('Clean room 2', '2021-12-11', false, false, 1);"
            );
            if (res.changes && res.changes.changes !== 1) {
                errMess.current = `Execute Insert changes != 1`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            myLog.push(" executed insert\n");

            // Select all chores
            myLog.push(" selecting from table\n");
            const resVal = await db.query("SELECT * FROM chores;");
            if(resVal.values && resVal.values.length !== 1) {
                errMess.current = `Query not returning 1 values`;
                setOutput(() => ({log: myLog}));
                return false;
            }
            myLog.push(" Select all from chores \n");


            // Close Connection steward        
            await sqlite.closeConnection("steward"); 
                    
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
                testDatabaseIssue184().then(async res => {
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

export default TestIssue184;
