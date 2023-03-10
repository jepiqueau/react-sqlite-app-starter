import { useState, useEffect, useRef } from 'react';
import TestOutput from './TestOutput';
import './NoEncryption.css';
import { sqlite } from '../App';
import { SQLiteDBConnection} from 'react-sqlite-hook';
import { createTablesNoEncryption, createTablesNoEncryption1, importTwoUsers,
  dropTablesTablesNoEncryption } from '../Utils/noEncryptionUtils';
import { deleteDatabase } from '../Utils/deleteDBUtil';     
import { Dialog } from '@capacitor/dialog';

const NoEncryption: React.FC = () => {
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

  const testDatabaseNoEncryption = async (): Promise<Boolean>  => {
    setOutput((output) => ({log: output.log}));


    myLog.push("* Starting testDatabaseNoEncryption *\n");
    try {
        // test the plugin with echo
        let res: any = await sqlite.echo("Hello from echo");
        if(res.value !== "Hello from echo"){
            errMess.current = `Echo not returning "Hello from echo"`;
            setOutput(() => ({log: myLog}));
            return false;
        }
        myLog.push("> Echo successful\n");

        // create a connection for NoEncryption
        let db: SQLiteDBConnection = await sqlite.createConnection("NoEncryption");
        // check if the databases exist 
        // and delete it for multiple successive tests
        await deleteDatabase(db);         
        // open NoEncryption
        await db.open();
        myLog.push("> open 'NoEncryption' successful\n");

        // Drop tables if exists
        res = await db.execute(dropTablesTablesNoEncryption);
        if(res.changes.changes !== 0 &&
                    res.changes.changes !== 1){
            errMess.current = `Execute dropTablesTablesNoEncryption changes < 0`;
            setOutput(() => ({log: myLog}));
            return false;
        } 
        myLog.push("> Execute1 successful\n");
        
        // Create tables
        console.log(`@@@@ createTablesNoEncryption: ${createTablesNoEncryption}`);
        res = await db.execute(createTablesNoEncryption);
        if (res.changes.changes < 0) {
            errMess.current = `Execute createTablesNoEncryption changes < 0`;
            setOutput(() => ({log: myLog}));
            return false;
        }
        res = await db.execute(createTablesNoEncryption1);
        if (res.changes.changes < 0) {
            errMess.current = `Execute createTablesNoEncryption changes < 0`;
            setOutput(() => ({log: myLog}));
            return false;
        }
        myLog.push("> Execute2 successful\n");

        // Insert two users with execute method
        res = await db.execute(importTwoUsers);
        if (res.changes.changes !== 2) {
            errMess.current = `Execute importTwoUsers changes != 2`;
            setOutput(() => ({log: myLog}));
            return false;
        }
        myLog.push("> Execute3 successful\n");

        // Select all Users
        res = await db.query("SELECT * FROM users");
        if(res.values.length !== 2 ||
        res.values[0].name !== "Whiteley" ||
                    res.values[1].name !== "Jones") {
            errMess.current = `Query not returning 2 values`;
            setOutput(() => ({log: myLog}));
            return false;
        }
        myLog.push("> Select1 successful\n");

        // add one user with statement and values              
        let sqlcmd = "INSERT INTO users (name,email,age) VALUES (?,?,?)";
        let values: Array<any>  = ["Simpson","Simpson@example.com",69];
        res = await db.run(sqlcmd,values);
        if(res.changes.changes !== 1 ||
                        res.changes.lastId !== 3) {
            errMess.current = `Run lastId != 3`;
            setOutput(() => ({log: myLog}));
            return false;
        }
        myLog.push("> Run1 successful\n");

        // add one user with statement              
        sqlcmd = `INSERT INTO users (name,email,age) VALUES `+
                        `("Brown","Brown@example.com",15)`;
        res = await db.run(sqlcmd);
        if(res.changes.changes !== 1 ||
                    res.changes.lastId !== 4) {
            errMess.current = `Run lastId != 4`;
            setOutput(() => ({log: myLog}));
            return false;
        }
        myLog.push("> Run2 successful\n");

        // Select all Users
        res = await db.query("SELECT * FROM users");
        if(res.values.length !== 4) {
            errMess.current = `Query not returning 4 values`;
            setOutput(() => ({log: myLog}));
            return false;
        }
        myLog.push("> Select2 successful\n");

        // Select Users with age > 35
        sqlcmd = "SELECT name,email,age FROM users WHERE age > ?";
        values = ["35"];
        res = await db.query(sqlcmd,values);
        if(res.values.length !== 2) {
            errMess.current = `Query > 35 not returning 2 values`;
            setOutput(() => ({log: myLog}));
            return false;
        }
        myLog.push("> Select3 successful\n");

        // Close Connection NoEncryption        
        await sqlite.closeConnection("NoEncryption"); 
        myLog.push("> CloseConnection successful\n");
        myLog.push("* Ending testDatabaseNoEncryption *\n");

                
        return true;
    } catch (err: any) {
        errMess.current = `${err.message}`;
        setOutput(() => ({log: myLog}));
        return false;
    }
  }

  useEffect(() => {
    if(sqlite.isAvailable) {
      if (myRef.current === false) {
        myRef.current = true;

        testDatabaseNoEncryption().then(async res => {
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

export default NoEncryption;
