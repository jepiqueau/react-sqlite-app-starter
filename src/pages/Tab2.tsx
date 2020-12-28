import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
         IonList, IonItem, IonButton } from '@ionic/react';
import NoEncryption from '../components/NoEncryption';
import Test2dbs from '../components/Test2dbs';
import ExistingConnection from '../components/ExistingConnection';
import TestEncryption from '../components/TestEncryption';
import TestUpgradeVersion from '../components/TestUpgradeVersion';
import TestJsonImportExport from '../components/TestJsonImportExport';

import './Tab2.css';
import { usePermissions } from '../Hooks/usePermissions';
import { existingConn } from '../App';

const Tab2: React.FC = (props) => {
  const [start, setStart] = useState("");
  const startTest = (testName: string) => {
    setStart(testName); 
  }
  const isGranted = usePermissions();

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
        </IonList>
        {isGranted && start === "NoEncryption" && <NoEncryption></NoEncryption>}
        {isGranted && start === "Test2dbs" && <Test2dbs></Test2dbs>}
        {isGranted && start === "ExistingConnection" && <ExistingConnection></ExistingConnection>}
        {isGranted && start === "TestEncryption" && <TestEncryption></TestEncryption>}
        {isGranted && start === "TestUpgradeVersion" && <TestUpgradeVersion></TestUpgradeVersion>}
        {isGranted && start === "TestJsonImportExport" && <TestJsonImportExport></TestJsonImportExport>}
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
