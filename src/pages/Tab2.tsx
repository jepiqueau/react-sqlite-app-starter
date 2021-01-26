import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
         IonList, IonItem, IonButton } from '@ionic/react';
import NoEncryption from '../components/NoEncryption';
import Test2dbs from '../components/Test2dbs';
import ExistingConnection from '../components/ExistingConnection';
import TestEncryption from '../components/TestEncryption';
import TestUpgradeVersion from '../components/TestUpgradeVersion';
import TestJsonImportExport from '../components/TestJsonImportExport';
import CopyFromAssets from '../components/CopyFromAssets';

import './Tab2.css';
import { existingConn } from '../App';

const Tab2: React.FC = (props) => {
  const [start, setStart] = useState("");
  const startTest = (testName: string) => {
    setStart(testName); 
  }

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
            <IonButton onClick={() => startTest("NoEncryption")} expand="block">SQLite No Encryption Test</IonButton>
          </IonItem>
          <IonItem>
            <IonButton onClick={() => startTest("Test2dbs")} expand="block">SQLite Two DBs Tests</IonButton>
          </IonItem>
          {existingConn.existConn &&
            <IonItem>
              <IonButton onClick={() => startTest("ExistingConnection")} expand="block">SQLite Existing Test</IonButton>
            </IonItem>
          }
          <IonItem>
            <IonButton onClick={() => startTest("TestEncryption")} expand="block">SQLite Encryption Test</IonButton>
          </IonItem>
          <IonItem>
            <IonButton onClick={() => startTest("TestUpgradeVersion")} expand="block">SQLite Upgrade Version Test</IonButton>
          </IonItem>
          <IonItem>
            <IonButton onClick={() => startTest("TestJsonImportExport")} expand="block">SQLite Json Import Export Test</IonButton>
          </IonItem>
          <IonItem>
            <IonButton onClick={() => startTest("CopyFromAssets")} expand="block">SQLite Copy From Assets Test</IonButton>
          </IonItem>
        </IonList>
        {start === "NoEncryption" && <NoEncryption></NoEncryption>}
        {start === "Test2dbs" && <Test2dbs></Test2dbs>}
        {start === "ExistingConnection" && <ExistingConnection></ExistingConnection>}
        {start === "TestEncryption" && <TestEncryption></TestEncryption>}
        {start === "TestUpgradeVersion" && <TestUpgradeVersion></TestUpgradeVersion>}
        {start === "TestJsonImportExport" && <TestJsonImportExport></TestJsonImportExport>}
        {start === "CopyFromAssets" && <CopyFromAssets></CopyFromAssets>}
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
