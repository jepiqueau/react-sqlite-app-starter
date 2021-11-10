import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import './Tab3.css';
import { SQLiteDBConnection } from 'react-sqlite-hook';
import { sqlite } from '../App';

const Tab3: React.FC = () => {
  const [tests, setTests] = useState<any>([]);
  console.log('in Tab3')
  useEffect(() => {
    const initialize = async (): Promise<Boolean> => {
      console.log('in Tab3 initialize')
      try {
        let db: SQLiteDBConnection = await sqlite.createConnection("db_issue9");
        await db.open();
        let randomText = (Math.random() + 1).toString(36).substring(7);
        await db.run("INSERT INTO test (name) VALUES (?)", [randomText]);
        let res: any = await db.query("SELECT * FROM test");
        setTests(res.values);
        console.log(`query ${res}`);
        await db.close();
        await sqlite.closeConnection("db_issue9");
        return true;
      }
      catch (err) {
        console.log(`Error: ${err}`);
        return false;
      }
    }
    initialize();
  }, []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 3</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container">
          {tests.map((x: any, index: any) =>
            <div key={index}><IonText>
              {index} {x.name}
            </IonText>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
