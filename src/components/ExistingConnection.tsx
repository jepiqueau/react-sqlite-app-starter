import React, { useState, useEffect } from 'react';
import './ExistingConnection.css';
import { IonCard,IonCardContent } from '@ionic/react';

import { setUsers } from '../Utils/noEncryptionUtils';
import { createSchemaMessages, setMessages } from '../Utils/encryptedSetUtils';
      
import { sqlite, existingConn } from '../App';

const ExistingConnection: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);

    useEffect( () => {
        const testExistingConns = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testExistingConns *\n"));
            // retrieve the connections
            const db = await sqlite.retrieveConnection("testNew")
            const db1 = await sqlite.retrieveConnection("testSet")

            // load setUsers in db
            var ret: any = await db.executeSet(setUsers);
            console.log('$$$ ret.changes.changes in db ' + ret.changes.changes)
            if (ret.changes.changes !== 3) {
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
            return false;
            }
  
            // create table messages in db1
            ret = await db1.execute(createSchemaMessages);
            console.log('$$$ ret.changes.changes in db1 ' + ret.changes.changes)
            if (ret.changes.changes < 0) {
            return false;
            }

            // load setMessages in db1
            ret = await db1.executeSet(setMessages);
            console.log('$$$ ret.changes.changes in db1 ' + ret.changes.changes)
            if (ret.changes.changes !== 3) {
            return false;
            }
            // select all users in db
            ret = await db1.query("SELECT * FROM messages;");
            if(ret.values.length !== 3 || ret.values[0].title !== "message 1" ||
                                        ret.values[1].title !== "message 2" ||
                                        ret.values[2].title !== "message 3"
                                        ) {
            return false;
            }

            // test retrieve all connections
            var retDict: Map<string, any> = await 
                                sqlite.retrieveAllConnections();
            if(retDict.size !== 2) return false;
            if(!retDict.has("testNew") || retDict.get("testNew") !== db) {
                return false;
            }
            if(!retDict.has("testSet") || retDict.get("testSet") !== db1) {
                return false;
            }
            // close all connections
            ret = await sqlite.closeAllConnections();

            setLog((log) => log.concat("* Ending testtestExistingConns *\n"));
            existingConn.setExistConn(true);
            return true;
        }
        if(sqlite.isAvailable) {
            testExistingConns().then(res => {
                if(res) {    
                    setLog((log) => log
                        .concat("\n* The set of tests was successful *\n"));
                } else {
                    setLog((log) => log
                        .concat("\n* The set of tests failed *\n"));
                }
            });
        } else {
            sqlite.getPlatform().then((ret: { platform: string; })  =>  {
                setLog((log) => log.concat("\n* Not available for " + 
                                    ret.platform + " platform *\n"));
            });         
        }
     }, []);   

    return (
        <IonCard className="container-existingconnection">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
            </IonCardContent>
        </IonCard>
  );
};

export default ExistingConnection;
