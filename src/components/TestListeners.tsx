import React, { useState, useEffect, useRef } from 'react';
import './TestListeners.css';
import { IonCard,IonCardContent } from '@ionic/react';
import { createSchema112, firstTeachers, partialImport112 } from '../Utils/importJsonUtils';
    
import { sqlite, isJsonListeners } from '../App';
import { SQLiteDBConnection } from 'react-sqlite-hook';
import { deleteDatabase } from '../Utils/deleteDBUtil';
import { Dialog } from '@capacitor/dialog';

const TestListeners: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const errMess = useRef("");
    const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
    };

    /**
     * useEffect
     */

     useEffect( () => {
        /**
         * testListeners
         */
        const testJsonListeners = async (): Promise<boolean>  => {
            setLog((log) => log.concat("* Starting testListeners *\n"));
            isJsonListeners.setJsonListeners(true);
            try {
                // test the plugin with echo
                let res: any = await sqlite.echo("Hello from echo");
                if(res.value !== "Hello from echo") {
                    errMess.current = `Echo not returning "Hello from echo"`;
                    return false;
                }
                setLog((log) => log.concat("> Echo successful\n"));

                // initialize the connection
                let db: SQLiteDBConnection;
                if((await sqlite.isConnection("testListeners")).result) {
                    db = await sqlite.retrieveConnection("testListeners");
                } else {
                    db = await sqlite
                    .createConnection("testListeners", false, "no-encryption", 1);
                }
                setLog((log) => log.concat("> CreateConnection successful\n"));

                // check if the databases exist 
                // and delete it for multiple successive tests
                await deleteDatabase(db);

                // open db testNew
                await db.open();

                // create tables in db
                let ret: any = await db.execute(createSchema112,false);
                if (ret.changes.changes < 0) {
                    errMess.current = `Execute 1: createSchema failed"`;
                    return false;
                }

                // create synchronization table 
                ret = await db.createSyncTable();
                console.log('$$$ createSyncTable ret.changes.changes in db ' + ret.changes.changes)
                
                // set the synchronization date
                const syncDate: string = "2020-11-25T08:30:25.000Z";
                await db.setSyncDate(syncDate);
                setLog((log) => log.concat("> CreateSchema successful\n"));

                // add first teachers in db
                ret = await db.execute(firstTeachers, false);
                if (ret.changes.changes !== 20) {
                    errMess.current = `Execute 2: teachers failed"`;
                    return false;
                }
                // select all teachers in db
                ret = await db.query("SELECT * FROM teachers;");
                if(ret.values.length !== 20) {
                    errMess.current = `Query 1: teachers failed"`;
                    return false;
                }
                // update age with statement and values              
                let sqlcmd: string =
                            "UPDATE teachers SET age = ?, office = ? WHERE id = ?;";
                let values: Array<any>  = [41,"ABC",1];
                ret = await db.run(sqlcmd, values, false);
                console.log(`xxxx changes ${ret.changes.changes}`);
                values = [23,"AEF",2];
                ret = await db.run(sqlcmd, values, false);
                console.log(`xxxx changes ${ret.changes.changes}`);
                // select teachers where age > 40 in db
                sqlcmd = "SELECT name,email,age FROM teachers WHERE age > ?";
                ret = await db.query(sqlcmd,[40]);
                if(ret.values.length !== 1 || ret.values[0].name !== "Name1" ) {
                    errMess.current = `Query 2: teachers failed"`;
                    return false;
                }
                setLog((log) => log.concat("> Create Data successful\n"));

                // close the connection
                await sqlite.closeConnection("testListeners"); 

                // test Json object validity
                res = await sqlite.isJsonValid(JSON.stringify(partialImport112));
                if(!res.result) { 
                    errMess.current = `isJsonValid is returning false `;
                    return false;
                }
                setLog((log) => log.concat("> isJsonValid successful\n"));

                // test import from Json Object
                res = await sqlite.importFromJson(JSON.stringify(partialImport112)); 
                console.log(`full import result ${res.changes.changes}`);
                if(res.changes.changes === -1 ) {
                    errMess.current = `importFromJson changes < 0 `;
                    return false;
                }
                setLog((log) => log.concat("> importFromJson successful\n"));

                // create the connection to the database
                db = await sqlite.createConnection("testListeners", false,
                                                   "no-encryption", 1);
                if(db === null) {
                    errMess.current = `CreateConnection 'testListeners' after 'partial' failed`;
                    return false;
                }
                // open db "testListeners"
                await db.open();

                // select teachers with "office" is null
                sqlcmd = "SELECT * FROM teachers where office IS NULL;";
                let result: any = await db.query(sqlcmd);
                console.log(`result.values.length ${result.values.length}`)
                console.log(`result.values ${JSON.stringify(result)}`)
                if(result.values.length !== 31) {
                    errMess.current = "Query 3: Teachers failed";
                    return false;
                }
                setLog((log) => log.concat("> Office is Null successful\n"));

                // export full json
                let jsonObj: any = await db.exportToJson('full');
                
                console.log(`After Export full ${JSON.stringify(jsonObj.export)}`);    
                // test Json object validity
                result = await sqlite.isJsonValid(JSON.stringify(jsonObj.export));
                if(!result.result) {
                    errMess.current = "IsJsonValid export 'full' failed";
                    return false;
                }

                if( jsonObj.export.database !== "testListeners" || jsonObj.export.version !== 1 
                    || jsonObj.export.mode !== "full" || jsonObj.export.tables.length !== 2) {
                        errMess.current = "Export Json failed";
                        return false;
                }
                setLog((log) => log.concat("> Export 'full' successful\n"));

                // Import exported json object
                jsonObj.export.database = "testListenersImported";
                result = await sqlite
                        .importFromJson(JSON.stringify(jsonObj.export));
                console.log(`full import result ${JSON.stringify(result)}`);
                if(result.changes.changes === -1 ) {
                    errMess.current = "ImportFromJson 'full' failed";
                    return false;
                }
                // create the connection to the database
                db = await sqlite.createConnection("testListenersImported",
                                                   false, "no-encryption", 1);
                if(db === null) {
                    errMess.current = "CreateConnection 'testListenersImported' after 'full' failed";
                    return false;
                }
                // open db "testListenersImported"
                await db.open();

                // select all teachers in db
                ret = await db.query("SELECT * FROM teachers;");
                if(ret.values.length !== 40) {
                    errMess.current = "Query 4: Teachers failed";
                    return false;
                }
                // select all classes in db
                ret = await db.query("SELECT * FROM classes;");
                if(ret.values.length !== 12) {
                    errMess.current = "Query 5: Classes failed";
                    return false;
                }
                setLog((log) => log.concat("> Import 'full' successful\n"));

                // Check Connections Consistency
                ret= await sqlite.checkConnectionsConsistency();
                console.log(`$$$ checkConnectionsConsistency ${ret.result}`)
                if(!ret.result) {
                    console.log("You must redefined your connections")
                }
                setLog((log) => log.concat("> checkConnectionsConsistency successful\n"));

                result = await sqlite.isConnection("testListeners");
                if(result.result) {
                    // close the connection testListeners
                    await sqlite.closeConnection("testListeners"); 
                }    

                result = await sqlite.isConnection("testListenersImported");
                if(result.result) {
                    // close the connection testListenersImported
                    await sqlite.closeConnection("testListenersImported");      
                }    
                setLog((log) => log.concat("> closeConnection successful\n"));
                setLog((log) => log.concat("* Ending testFullImportFromJson *\n"));
                return true;
            } catch (err: any) {
                console.log(`in catch err ${err.message}`)
                errMess.current = `${err.message}`;
                return false;
            }
        }    
        if(sqlite.isAvailable) { 
            testJsonListeners().then(async res => {
                isJsonListeners.setJsonListeners(false);
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
        <IonCard className="container-test-listeners">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
                {errMess.current.length > 0 && <p>{errMess.current}</p>}
            </IonCardContent>
        </IonCard>
  );
};

export default TestListeners;
