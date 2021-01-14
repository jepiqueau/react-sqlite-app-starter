import React, { useState, useEffect } from 'react';
import './CopyFromAssets.css';
import { IonCard,IonCardContent } from '@ionic/react';
   
import { sqlite } from '../App';
import { SQLiteDBConnection } from 'react-sqlite-hook/dist';
    
const CopyFromAssets: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);

    useEffect( () => {
        const testDatabaseCopyFromAssets = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testDatabaseCopyFromAssets *\n"));
    
            let res: any = await sqlite.copyFromAssets();
            if(!res.result) return false;
            setLog((log) => log.concat("> copyFromAssets successful\n"));

            // create a connection for myDB
            res = await sqlite.createConnection("myDB");
            if(res == null ) return false;
            if((Object.keys(res)).includes("result") && !res.result) return false;
            setLog((log) => log.concat("> createConnection " +
                                        " 'myDb' successful\n"));
            let db: SQLiteDBConnection = res; 
            res = await db.open();
            if(!res.result) return false;
            setLog((log) => log.concat("> open 'myDb' successful\n"));
            // Select all Users
            res = await db.query("SELECT * FROM users");
            console.log(`@@@ res.values.length ${res.values.length}`)
            if(res.values.length !== 7 ||
                res.values[0].name !== "Whiteley" ||
                res.values[1].name !== "Jones" ||
                res.values[2].name !== "Simpson" ||
                res.values[3].name !== "Brown" ||
                res.values[4].name !== "Jackson" ||
                res.values[5].name !== "Kennedy" ||
                res.values[6].name !== "Bush") return false;

            setLog((log) => log.concat("> query 'myDb' successful\n"));

            
            // Close Connection MyDB        
            res = await sqlite.closeConnection("myDB"); 
            if(!res.result) {
                return false; 
            }
            setLog((log) => log.concat("> closeConnection 'myDb' successful\n"));

            // create a connection for dbForCopy
            res = await sqlite.createConnection("dbForCopy");
            if(res == null ) return false;
            if((Object.keys(res)).includes("result") && !res.result) return false;
            setLog((log) => log.concat("> createConnection " +
                                        " 'dbForCopy' successful\n"));
            db = res;
            res = await db.open();
            if(!res.result) return false;
            setLog((log) => log.concat("> open 'dbForCopy' successful\n"));
            // Select all Users
            res = await db.query("SELECT * FROM areas");
            console.log(`@@@ res.values.length ${res.values.length}`)
            if(res.values.length !== 3 ||
                res.values[0].name !== "Access road" ||
                res.values[1].name !== "Accessway" ||
                res.values[2].name !== "Air handling system") return false;

            setLog((log) => log.concat("> query 'dbForCopy' successful\n"));
            // Close Connection dbForCopy       
            res = await sqlite.closeConnection("dbForCopy"); 
            if(!res.result) {
                return false; 
            }
            setLog((log) => log.concat("> closeConnection 'dbForCopy' successful\n"));
                    
            setLog((log) => log
                .concat("* Ending testDatabaseCopyFromAssets *\n"));

            return true;
        }
        if(sqlite.isAvailable) {
            testDatabaseCopyFromAssets().then(res => {
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
        <IonCard className="container-copyfromassets">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
            </IonCardContent>
        </IonCard>
  );
};

export default CopyFromAssets;
