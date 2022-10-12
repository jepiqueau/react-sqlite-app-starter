import React, { useEffect, useState, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './Tab3.css';
import { SQLiteDBConnection } from 'react-sqlite-hook';
import { sqlite } from '../App';

const Tab3: React.FC = () => {
  const ref = useRef(false);
  const [tests, setTests] = useState<any>([]);
  const initialize = async (): Promise<void> => {
    console.log('Entering initialize');
    try {
      let db: SQLiteDBConnection = await sqlite.createConnection("db_issue9");
      await db.open();
      let randomText = (Math.random() + 1).toString(36).substring(7);
      console.log(`Inserting ${randomText}`);
      await db.run("INSERT INTO test (name) VALUES (?)", [randomText]);
      let res: any = await db.query("SELECT * FROM test");
      setTests(res.values);
      await db.close();
      sqlite.closeConnection("db_issue9");
      return ;
    }
    catch (err) {
      console.log(`Error: ${err}`);
      return ;
    }
  }
  useIonViewWillEnter(() => {
    if(ref.current === false) {
      initialize();
      ref.current = true;
    }
  });

  useIonViewWillLeave(() => {
    ref.current = false;  
  });
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
        <div className="container-tab3">
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
