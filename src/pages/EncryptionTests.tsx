import React, { useState, useEffect} from 'react';
import { IonBackButton, IonButtons, IonHeader, IonPage, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { useSQLite } from 'react-sqlite-hook/dist';


const EncryptionTests: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const {openDB, createSyncTable, close, execute, executeSet, run, query,
    isDBExists, deleteDB, isJsonValid, importFromJson, exportToJson, setSyncDate} = useSQLite();
    
  useEffect( () => {
    async function testEncrypted(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testEncrypted *\n"));
      setLog((log) => log.concat(" Not Implemented yet to come ...\n"));
      setLog((log) => log.concat("* Ending testEncrypted *\n"));
      return true;
    }
    async function testWrongSecret(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testWrongSecret *\n"));
      setLog((log) => log.concat(" Not Implemented yet to come ...\n"));
      setLog((log) => log.concat("* Ending testWrongSecret *\n"));
      return true;
    }
    async function testChangePassword(): Promise<Boolean>  {
      setLog((log) => log.concat("* Starting testChangePassword *\n"));
      setLog((log) => log.concat(" Not Implemented yet to come ...\n"));  
      setLog((log) => log.concat("* Ending testChangePassword *\n"));
      return true;
    }
    testEncrypted().then(res => {
      if(res) {
        testWrongSecret().then(res => {
          if(res) {
            testChangePassword().then(res => {
              if(res) {
                setLog((log) => log.concat("\n* The set of tests was successful *\n"));
              } else {
                setLog((log) => log.concat("\n* The set of tests failed *\n"));
              }  
            });
          } else {
            setLog((log) => log.concat("\n* The set of tests failed *\n"));
          }
        });
      } else {
        setLog((log) => log.concat("\n* The set of tests failed *\n"));
      }
    });

    
  }, [openDB, createSyncTable, close, execute, executeSet, run, query, isDBExists, deleteDB,
    isJsonValid, importFromJson, exportToJson, setSyncDate]);   

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab2" />
          </IonButtons>
          <IonTitle>Encryption Tests</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <pre>
          <p>{log}</p>
        </pre>
      </IonContent>
    </IonPage>
  );
};

export default EncryptionTests;
