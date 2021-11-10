import React, { useState, useEffect, useRef } from 'react';
import './CopyFromAssets.css';
import { IonCard,IonCardContent } from '@ionic/react';
   
import { sqlite } from '../App';
import { SQLiteDBConnection } from 'react-sqlite-hook';
import { Dialog } from '@capacitor/dialog';
    
const CopyFromAssets: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const errMess = useRef("");
    const showAlert = async (message: string) => {
        await Dialog.alert({
          title: 'Error Dialog',
          message: message,
        });
    };

    useEffect( () => {
        const testDatabaseCopyFromAssets = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testDatabaseCopyFromAssets *\n"));
            try {
    
                await sqlite.copyFromAssets();
                setLog((log) => log.concat("> copyFromAssets successful\n"));

                // create a connection for myDB
                let db: SQLiteDBConnection = await sqlite.createConnection("myDB");
                setLog((log) => log.concat("> createConnection " +
                                            " 'myDb' successful\n"));
                await db.open();
                setLog((log) => log.concat("> open 'myDb' successful\n"));
                // Select all Users
                let res: any = await db.query("SELECT * FROM users");
                console.log(`@@@ res.values.length ${res.values.length}`)
                if(res.values.length !== 7 ||
                    res.values[0].name !== "Whiteley" ||
                    res.values[1].name !== "Jones" ||
                    res.values[2].name !== "Simpson" ||
                    res.values[3].name !== "Brown" ||
                    res.values[4].name !== "Jackson" ||
                    res.values[5].name !== "Kennedy" ||
                    res.values[6].name !== "Bush") {
                        errMess.current = `Query not returning 7 values`;
                        return false;
                    }

                setLog((log) => log.concat("> query 'myDb' successful\n"));

            
                // Close Connection MyDB        
                await sqlite.closeConnection("myDB"); 
                setLog((log) => log.concat("> closeConnection 'myDb' successful\n"));

                // create a connection for dbForCopy
                db = await sqlite.createConnection("dbForCopy");
                setLog((log) => log.concat("> createConnection " +
                                            " 'dbForCopy' successful\n"));
                await db.open();
                setLog((log) => log.concat("> open 'dbForCopy' successful\n"));
                // Select all Users
                res = await db.query("SELECT * FROM areas");
                console.log(`@@@ res.values.length ${res.values.length}`)
                if(res.values.length !== 3 ||
                    res.values[0].name !== "Access road" ||
                    res.values[1].name !== "Accessway" ||
                    res.values[2].name !== "Air handling system"){
                    errMess.current = `Query Users not returning 3 values`;
                    return false;
                }

                setLog((log) => log.concat("> query 'dbForCopy' successful\n"));
                // Close Connection dbForCopy       
                await sqlite.closeConnection("dbForCopy"); 
                setLog((log) => log.concat("> closeConnection 'dbForCopy' successful\n"));
                        
                setLog((log) => log
                    .concat("* Ending testDatabaseCopyFromAssets *\n"));

                return true;
            } catch (err: any) {
                errMess.current = `${err.message}`;
                return false;
            }
        }
        if(sqlite.isAvailable) {
            testDatabaseCopyFromAssets().then(async res => {
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
        <IonCard className="container-copyfromassets">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
                {errMess.current.length > 0 && <p>{errMess.current}</p>}
            </IonCardContent>
        </IonCard>
  );
};

export default CopyFromAssets;
