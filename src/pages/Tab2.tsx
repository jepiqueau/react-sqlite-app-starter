import { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonButton } from '@ionic/react';
import './Tab2.css';
import { sqlite } from '../App';
import { existingConn } from '../App';

const Tab2: React.FC = () => {
  const [isNative, setIsNative] = useState(false);
  sqlite.getPlatform().then((platform: any) => {
    if(platform.platform === "ios" || platform.platform === "android") {
      setIsNative(true);
    }
  });
 
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 2</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 2</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
        <IonItem>
            <IonButton routerLink={`/test/${"Test2dbs"}`} expand="block">SQLite Two DBs Tests</IonButton>
          </IonItem>
          {existingConn.existConn &&
            <IonItem>
              <IonButton routerLink={`/test/${"ExistingConnection"}`} expand="block">SQLite Existing Test</IonButton>
            </IonItem>
          }
          <IonItem>
            <IonButton routerLink={`/test/${"NoEncryption"}`} expand="block">SQLite No Encryption Test</IonButton>
          </IonItem>
          {isNative &&
            <IonItem>
              <IonButton routerLink={`/test/${"TestEncryption"}`} expand="block">SQLite Encryption Test</IonButton>
            </IonItem>
          }
          <IonItem>
            <IonButton routerLink={`/test/${"TestUpgradeVersion"}`} expand="block">SQLite Upgrade Version Test</IonButton>
          </IonItem>
          <IonItem>
            <IonButton routerLink={`/test/${"TestJsonImportExport"}`} expand="block">SQLite Json Import Export Test</IonButton>
          </IonItem>
          <IonItem>
            <IonButton routerLink={`/test/${"CopyFromAssets"}`} expand="block">SQLite Copy From Assets Test</IonButton>
          </IonItem>
          <IonItem>
            <IonButton routerLink={`/test/${"TestIssue184"}`} expand="block">Test Issue184</IonButton>
          </IonItem>
          {isNative &&
            <IonItem>
              <IonButton routerLink={`/test/${"MigrateDB"}`} expand="block">Test Migrate DB</IonButton>
            </IonItem>
          }
          {isNative &&
            <IonItem>
              <IonButton routerLink={`/test/${"NonConformedDB"}`} expand="block">Test NC Database</IonButton>
            </IonItem>
          }
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;

/*
        <StartTest test={testStart.current}></StartTest>
*/