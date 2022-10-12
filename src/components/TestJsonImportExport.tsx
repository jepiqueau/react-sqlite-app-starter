import React, { useState, useEffect, useCallback, useRef } from 'react';
import './TestJsonImportExport.css';
import TestOutput from './TestOutput';
import { dataToImport, partialImport1 } from '../Utils/importJsonUtils';
    
import { sqlite } from '../App';
import { SQLiteDBConnection } from 'react-sqlite-hook';
import { deleteDatabase } from '../Utils/deleteDBUtil';
import { Dialog } from '@capacitor/dialog';

const TestJsonImportExport: React.FC = () => {
    const myRef = useRef(false);
    const myLog = useRef(new Array());
    const errMess = useRef("");
    const [output, setOutput] = useState({log: myLog.current});
      const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
    };
    /**
     * testFullImportFromJson
     */
    const testFullImportFromJson = useCallback(async (): Promise<boolean>  => {
        setOutput((output: { log: any; }) => ({log: output.log}));

        myLog.current.push("* Starting TestFullImportFromJson *\n");
        try {
            // test the plugin with echo
            let res: any = await sqlite.echo("Hello from echo");
            if(res.value !== "Hello from echo") {
                errMess.current = `Echo not returning "Hello from echo"`;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> Echo successful\n");
            // test Json object validity
            res = await sqlite.isJsonValid(JSON.stringify(dataToImport));
            if(!res.result) { 
                errMess.current = `isJsonValid is returning false `;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> isJsonValid successful\n");

            // test import from Json Object
            res = await sqlite.importFromJson(JSON.stringify(dataToImport)); 
            console.log(`full import result ${res.changes.changes}`);
            if(res.changes.changes === -1 ) {
                errMess.current = `importFromJson changes < 0 `;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> importFromJson successful\n");

            // create a connection for "db-from-json"
            let db: SQLiteDBConnection = await sqlite.createConnection("db-from-json", false, "no-encryption", 1);
            myLog.current.push("> createConnection " +
                                    " 'db-from-json' successful\n");
            // open db "db-from-json"
            await db.open();
            myLog.current.push("> open " +
                                    " 'db-from-json' successful\n");
            // create synchronization table 
            res = await db.createSyncTable();
            if (res.changes.changes < 0) {
                errMess.current = `createSyncTable changes < 0 `;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> createSyncTable " +
                                    " 'db-from-json' successful\n");
            // get the synchronization date
            res = await db.getSyncDate();
            if(res.syncDate === 0) {
                errMess.current = `getSyncDate return 0 `;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            console.log("$$ syncDate " + res.syncDate);
            myLog.current.push("> getSyncDate " +
                                    " 'db-from-json' successful\n");
            // select all users in db
            res = await db.query("SELECT * FROM users;");
            if(res.values.length !== 4 || 
                        res.values[0].name !== "Whiteley" ||
                        res.values[1].name !== "Jones" ||
                        res.values[2].name !== "Simpson" ||
                        res.values[3].name !== "Brown"  ) {
                errMess.current = `Query users not returning 4 values`;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            // close the connection
            await sqlite.closeConnection("db-from-json"); 
            myLog.current.push("> closeConnection successful\n");
            myLog.current.push("* Ending testFullImportFromJson *\n");
            return true;
        } catch (err: any) {
            errMess.current = `${err.message}`;
            setOutput(() => ({log: myLog.current}));
            return false;
        }
    },[myLog]);
    /**
     * testPartialImportFromJson
     */
    const testPartialImportFromJson = useCallback(async (): Promise<boolean>  => {
        myLog.current.push("* Starting testPartialImportFromJson *\n");
        try {
            // test Json object validity
            let res: any = await sqlite.isJsonValid(JSON.stringify(partialImport1));
            if(!res.result){ 
                errMess.current = `isJsonValid Partial is returning false `;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> isJsonValid successful\n");
            // partial import
            res = await sqlite.importFromJson(JSON.stringify(partialImport1));
            if(res.changes.changes === -1 ) {
                errMess.current = `importFromJson Partial changes < 0 `;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> importFromJson successful\n");
            // create a connection for "db-from-json"
            let db: SQLiteDBConnection = await sqlite.createConnection("db-from-json", false, "no-encryption", 1);
            myLog.current.push("> createConnection " +
                                        " 'db-from-json' successful\n");
            // open db "db-from-json"
            await db.open();
            myLog.current.push("> open " +
                                    " 'db-from-json' successful\n");
            // select all users in db
            res = await db.query("SELECT * FROM users;");
            if(res.values.length !== 6 || 
                        res.values[0].name !== "Whiteley" ||
                        res.values[1].name !== "Jones" ||
                        res.values[2].name !== "Simpson" ||
                        res.values[3].name !== "Brown" ||
                        res.values[4].name !== "Addington" ||
                        res.values[5].name !== "Bannister" ) {
                errMess.current = `Query users not returning 6 values`;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> query " +
                                    " 'users' successful\n");

            // select all messages in db
            res = await db.query("SELECT * FROM messages;");
            if(res.values.length !== 4|| 
                        res.values[0].title !== "test post 1" ||
                        res.values[1].title !== "test post 2" ||
                        res.values[2].title !== "test post 3" ||
                        res.values[3].title !== "test post 4" ) {
                errMess.current = `Query messages not returning 4 values`;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> query " +
                                        " 'messages' successful\n");

            // select all images in db
            res = await db.query("SELECT * FROM images;");
            if(res.values.length !== 2 || 
                        res.values[0].name !== "feather" ||
                        res.values[1].name !== "meowth" ) {
                errMess.current = `Query images not returning 2 values`;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> query " +
                                    " 'images' successful\n");
            // close the connection
            await sqlite.closeConnection("db-from-json"); 
            myLog.current.push("> closeConnection successful\n");
            myLog.current.push("* Ending testPartialImportFromJson *\n");
            return true;
        } catch (err: any) {
            errMess.current = `${err.message}`;
            setOutput(() => ({log: myLog.current}));
            return false;
        }
    },[myLog]);
    /**
     * testImportFromJson
     */
    const testImportFromJson = useCallback(async (): Promise<boolean>  => {
        myLog.current.push("** Starting testImportFromJson **\n");
        let ret: boolean = false;  
        ret = await testFullImportFromJson();
        if(!ret) {
            myLog.current.push("* testFullImportFromJson  failed*\n");
            setOutput(() => ({log: myLog.current}));
            return false;
        }      
        ret = await testPartialImportFromJson();
        if(!ret) {
            myLog.current.push("* testPartialImportFromJson  failed*\n");
            setOutput(() => ({log: myLog.current}));
            return false;
        }      
        myLog.current.push("** Ending testImportFromJson **\n\n");
        return true;
    },[myLog, testFullImportFromJson, testPartialImportFromJson]);
    /**
     * testFullExportToJson
     */
    const testFullExportToJson = useCallback(async (db: SQLiteDBConnection): Promise<boolean>  => {
        myLog.current.push("* Starting testFullExportToJson *\n");
        try {
            // export to json full
            let jsonObj: any = await db.exportToJson('full');
            // test Json object validity
            let res: any = await sqlite.isJsonValid(JSON.stringify(jsonObj.export));
            if(!res.result) {
                myLog.current.push(`> isJsonValid ${res.message}\n`);
                errMess.current = `isJsonValid Full returns false`;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> Export Full Json Object is valid\n");    
            myLog.current.push("* Ending testFullExportToJson \n");
            return true;
        } catch (err: any) {
            errMess.current = `${err.message}`;
            setOutput(() => ({log: myLog.current}));
            return false;
        }
    },[myLog]);
    /**
     * testPartialExportToJson
     */
    const testPartialExportToJson = useCallback(async (db: SQLiteDBConnection): Promise<boolean>  => {
        myLog.current.push("* Starting testPartialExportToJson *\n");
        try {
            // Set the synchronization date
            await db.setSyncDate("2020-05-20T18:40:00.000Z");
            myLog.current.push("> setSyncDate successful\n");    
            // export to json partial
            let jsonObj: any = await db.exportToJson('partial');
            // test Json object validity
            let res: any = await sqlite.isJsonValid(JSON.stringify(jsonObj.export));
            if(!res.result) {
                myLog.current.push(`> isJsonValid ${res.message}\n`);
                errMess.current = `isJsonValid Partial returns false`;
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> Export Json Object is valid\n");    
            if(jsonObj.export.tables.length !== 3 || jsonObj.export.tables[0].name !== 'users'
                    || jsonObj.export.tables[1].name !== 'messages' || jsonObj.export.tables[2].name !== 'images' 
                    || jsonObj.export.tables[0].values.length !== 4 || jsonObj.export.tables[1].values.length !== 3
                    || jsonObj.export.tables[2].values.length !== 1) {
                errMess.current = "Export Partial tables.length != 3";
                setOutput(() => ({log: myLog.current}));
                return false;
            }
            myLog.current.push("> Export  Partial Json Object successful\n");    
            myLog.current.push("* Ending testPartialExportToJson \n");
            return true;
        } catch (err: any) {
            errMess.current = `${err.message}`;
            setOutput(() => ({log: myLog.current}));
            return false;
        }
    },[myLog]);
    /**
     * testExportToJson
     */
    const testExportToJson = useCallback(async (): Promise<boolean>  => {
        myLog.current.push("** Starting testExportToJson **\n");
        let db: SQLiteDBConnection
        try {
            // create a connection for "db-from-json"
            db = await sqlite.createConnection("db-from-json", false, "no-encryption", 1);
            myLog.current.push("> createConnection " +
                                        " 'db-from-json' successful\n");
            // open db "db-from-json"
            await db.open();
            myLog.current.push("> open " +
                                " 'db-from-json' successful\n");
        } catch (err: any) {
            errMess.current = `${err.message}`;
            setOutput(() => ({log: myLog.current}));
            return false;
        }
                
        let res: boolean = await testFullExportToJson(db);
        if(!res) {
            myLog.current.push("* testFullExportToJson  failed*\n");
            setOutput(() => ({log: myLog.current}));
            return false;
        }      
        res = await testPartialExportToJson(db);
        if(!res) {
            myLog.current.push("* testPartialExportToJson  failed*\n");
            setOutput(() => ({log: myLog.current}));
            return false;
        }      
        try {
            // Delete "db-from-json" for multiple successive tests
            // delete it for multiple successive tests
            await deleteDatabase(db);
            myLog.current.push("* deleteDatabase failed*\n");
            // close the connection
            sqlite.closeConnection("db-from-json"); 

            myLog.current.push("** Ending testExportToJson **\n");

            return true;
        } catch (err: any) {
            errMess.current = `${err.message}`;
            setOutput(() => ({log: myLog.current}));
            return false;
        }
    },[myLog, testFullExportToJson, testPartialExportToJson]);
    /**
     * useEffect
     */

    useEffect( () => {

        
        if(sqlite.isAvailable) {
            if (myRef.current === false) {
                myRef.current = true;
                testImportFromJson().then(async res => {
                    if(res) {
                        testExportToJson().then(async res => {
                            if(res) {    
                                myLog.current.push("\n* The set of tests was successful *\n");
                            } else {
                                myLog.current.push("\n* The set of tests failed *\n");
                                await showAlert(errMess.current);
                            }
                            setOutput(() => ({log: myLog.current}));
                                        });
                    } else {
                        myLog.current.push("\n* The set of tests failed *\n");
                        await showAlert(errMess.current);
                    }
                });
            }
        } else {
            sqlite.getPlatform().then(async (ret: { platform: string; })  =>  {
                myLog.current.push("\n* Not available for " + 
                                ret.platform + " platform *\n");
                await showAlert(errMess.current);
                setOutput(() => ({log: myLog.current}));
            });         
            }
         
      }, [errMess, myLog, testExportToJson, testImportFromJson]);   

      return (
        <TestOutput dataLog={output.log} errMess={errMess.current}></TestOutput> 
      );
    };

export default TestJsonImportExport;
