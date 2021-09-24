import React, { useState, useEffect, useRef } from 'react';
import './ExistingConnection.css';
import { IonCard,IonCardContent } from '@ionic/react';

import { setUsers } from '../Utils/noEncryptionUtils';
import { createSchemaMessages, setMessages } from '../Utils/encryptedSetUtils';
      
import { sqlite, existingConn } from '../App';
import { Dialog } from '@capacitor/dialog';

const ExistingConnection: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const errMess = useRef("");
    const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
    };

    useEffect( () => {
        const testExistingConns = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testExistingConns *\n"));
            try {
                // retrieve the connections
                const db = await sqlite.retrieveConnection("testNew")
                const db1 = await sqlite.retrieveConnection("testSet")

                // load setUsers in db
                var ret: any = await db.executeSet(setUsers);
                console.log('$$$ ret.changes.changes in db ' + ret.changes.changes)
                if (ret.changes.changes !== 3) {
                    errMess.current = `ExecuteSet setUsers changes != 3`;
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
                    return false;
                }
  
                // create table messages in db1
                ret = await db1.execute(createSchemaMessages);
                console.log('$$$ ret.changes.changes in db1 ' + ret.changes.changes)
                if (ret.changes.changes < 0) {
                    errMess.current = `Execute createSchemaMessages changes < 0`;
                    return false;
                }

                // load setMessages in db1
                ret = await db1.executeSet(setMessages);
                console.log('$$$ ret.changes.changes in db1 ' + ret.changes.changes)
                if (ret.changes.changes !== 3) {
                    errMess.current = `ExecuteSet setMessages changes < 0`;
                    return false;
                }
                // select all users in db
                ret = await db1.query("SELECT * FROM messages;");
                if(ret.values.length !== 3 || ret.values[0].title !== "message 1" ||
                                            ret.values[1].title !== "message 2" ||
                                            ret.values[2].title !== "message 3"
                                            ) {
                    errMess.current = `Query messages not returning 3 values`;
                    return false;
                }

                // test retrieve all connections
                var retDict: Map<string, any> = await 
                                    sqlite.retrieveAllConnections();
                console.log(`retDict ${JSON.stringify(retDict)}`)
                if(retDict.size !== 2) {
                    errMess.current = `retrieveAllConnections not returning 2 values`;
                    return false;
                }
                if(!retDict.has("testNew") || retDict.get("testNew") !== db) {
                    errMess.current = `retrieveAllConnections not returning "testNew"`;
                    return false;
                }
                if(!retDict.has("testSet") || retDict.get("testSet") !== db1) {
                    errMess.current = `retrieveAllConnections not returning "testSet"`;
                    return false;
                }
                
                // close all connections
                sqlite.closeAllConnections();

                setLog((log) => log.concat("* Ending testtestExistingConns *\n"));
                existingConn.setExistConn(true);
                return true;
            } catch (err: any) {
                errMess.current = `${err.message}`;
                return false;
            }
        }
        if(sqlite.isAvailable) {
            testExistingConns().then(async res => {
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
        <IonCard className="container-existingconnection">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
                {errMess.current.length > 0 && <p>{errMess.current}</p>}
            </IonCardContent>
        </IonCard>
  );
};

export default ExistingConnection;
