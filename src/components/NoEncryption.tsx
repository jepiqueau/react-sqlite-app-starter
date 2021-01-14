import React, { useState, useEffect } from 'react';
import './NoEncryption.css';
import { IonCard,IonCardContent } from '@ionic/react';
import { createTablesNoEncryption, importTwoUsers,
        dropTablesTablesNoEncryption } from '../Utils/noEncryptionUtils';
      
import { sqlite } from '../App';
import { SQLiteDBConnection} from 'react-sqlite-hook/dist';
import { deleteDatabase } from '../Utils/deleteDBUtil';     
const NoEncryption: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);

    useEffect( () => {
        const testDatabaseNoEncryption = async (): Promise<Boolean>  => {
            setLog((log) => log.concat("* Starting testDatabaseNoEncryption *\n"));
    
            // test the plugin with echo
            let res: any = await sqlite.echo("Hello from echo");
            if(res.value !== "Hello from echo") return false;
            setLog((log) => log.concat("> Echo successful\n"));
            // create a connection for NoEncryption
            res = await sqlite.createConnection("NoEncryption");
            if(res == null ) return false;
            if((Object.keys(res)).includes("result") && !res.result) return false;
            setLog((log) => log.concat("> createConnection " +
                                        " 'NoEncryption' successful\n"));
            let db: SQLiteDBConnection = res; 
            // check if the databases exist 
            // and delete it for multiple successive tests
            res = await deleteDatabase(db);         
            // open NoEncryption
            res = await db.open();
            if(!res.result) return false;
            setLog((log) => log.concat("> open 'NoEncryption' successful\n"));

            // Drop tables if exists
            res = await db.execute(dropTablesTablesNoEncryption);
            if(res.changes.changes !== 0 &&
                         res.changes.changes !== 1) return false;
            setLog((log) => log.concat(" Execute1 successful\n"));
            
            // Create tables
            res = await db.execute(createTablesNoEncryption);
            if(res.changes.changes !== 0 &&
                res.changes.changes !== 1) return false;
            setLog((log) => log.concat(" Execute2 successful\n"));

            // Insert two users with execute method
            res = await db.execute(importTwoUsers);
            if(res.changes.changes !== 2) return false;
            setLog((log) => log.concat(" Execute3 successful\n"));

            // Select all Users
            res = await db.query("SELECT * FROM users");
            if(res.values.length !== 2 ||
            res.values[0].name !== "Whiteley" ||
                        res.values[1].name !== "Jones") return false;
            setLog((log) => log.concat(" Select1 successful\n"));

            // add one user with statement and values              
            let sqlcmd = "INSERT INTO users (name,email,age) VALUES (?,?,?)";
            let values: Array<any>  = ["Simpson","Simpson@example.com",69];
            res = await db.run(sqlcmd,values);
            if(res.changes.changes !== 1 ||
                            res.changes.lastId !== 3) return false;
            setLog((log) => log.concat(" Run1 successful\n"));

            // add one user with statement              
            sqlcmd = `INSERT INTO users (name,email,age) VALUES `+
                            `("Brown","Brown@example.com",15)`;
            res = await db.run(sqlcmd);
            if(res.changes.changes !== 1 ||
                        res.changes.lastId !== 4) return false;
            setLog((log) => log.concat(" Run2 successful\n"));

            // Select all Users
            res = await db.query("SELECT * FROM users");
            if(res.values.length !== 4) return false;
            setLog((log) => log.concat(" Select2 successful\n"));

            // Select Users with age > 35
            sqlcmd = "SELECT name,email,age FROM users WHERE age > ?";
            values = ["35"];
            res = await db.query(sqlcmd,values);
            if(res.values.length !== 2) return false;
            setLog((log) => log
                    .concat(" Select with filter on age successful\n"));

            // Close Connection NoEncryption        
            res = await sqlite.closeConnection("NoEncryption"); 
            if(!res.result) {
                return false; 
            }
                    
          return true;
        }
        if(sqlite.isAvailable) {
            testDatabaseNoEncryption().then(res => {
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
        <IonCard className="container-noencryption">
            <IonCardContent>
                <pre>
                    <p>{log}</p>
                </pre>
            </IonCardContent>
        </IonCard>
  );
};

export default NoEncryption;
