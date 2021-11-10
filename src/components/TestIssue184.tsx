import React, { useState, useEffect, useRef } from 'react';
import './TestIssue184.css';
import { IonCard,IonCardContent } from '@ionic/react';
      
import { sqlite } from '../App';
import { SQLiteDBConnection} from 'react-sqlite-hook';
import { Dialog } from '@capacitor/dialog';

const TestIssue184: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const errMess = useRef("");
    const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
    };

    useEffect( () => {
        const testDatabaseIssue184 = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testDatabaseIssue184 *\n"));
            try {
                // create a connection for TestIssue184
                let db: SQLiteDBConnection = await sqlite.createConnection("steward");
                // open NoEncryption
                await db.open();
                setLog((log) => log.concat("> open 'steward' successful\n"));
                setLog((log) => log.concat("executing create statements on next line\n"));
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
                    return false;
                } 
                setLog((log) => log.concat(" executed create statements\n"));

                setLog((log) => log.concat(" executing insert on next line\n"));

                res = await db.execute(
                    "INSERT INTO chores (name,next_due,completed,repeats,frequency) VALUES ('Clean room 2', '2021-12-11', false, false, 1);"
                );
                if (res.changes && res.changes.changes !== 1) {
                    errMess.current = `Execute Insert changes != 1`;
                    return false;
                }
                setLog((log) => log.concat(" executed insert\n"));

                // Select all chores
                setLog((log) => log.concat(" selecting from table\n"));
                const resVal = await db.query("SELECT * FROM chores;");
                if(resVal.values && resVal.values.length !== 1) {
                    errMess.current = `Query not returning 1 values`;
                    return false;
                }
                setLog((log) => log.concat(" Select all from chores \n"));


                // Close Connection steward        
                await sqlite.closeConnection("steward"); 
                        
                return true;
            } catch (err: any) {
                errMess.current = `${err.message}`;
                return false;
            }
        }
        if(sqlite.isAvailable) {
            testDatabaseIssue184().then(async res => {
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
        <IonCard className="container-testissue184">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
                {errMess.current.length > 0 && <p>{errMess.current}</p>}
            </IonCardContent>
        </IonCard>
  );
};

export default TestIssue184;
