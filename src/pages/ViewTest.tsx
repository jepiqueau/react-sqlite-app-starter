import { useParams } from 'react-router';
import './ViewTest.css';
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
  } from '@ionic/react';
import Test2dbs from '../components/Test2dbs';
import ExistingConnection from '../components/ExistingConnection';
import NoEncryption from '../components/NoEncryption';
import TestEncryption from '../components/TestEncryption';
import TestJsonImportExport from '../components/TestJsonImportExport';
import CopyFromAssets from '../components/CopyFromAssets';
import TestUpgradeVersion from '../components/TestUpgradeVersion';
import TestIssue184 from '../components/TestIssue184';
import MigrateDB  from '../components/MigrateDB';
import NonConformedDB from '../components/NonConformedDB';


const ViewTest: React.FC = () => {
    
    const params = useParams<{ name: string }>();

    const setTestName = (testName:string) => {
        switch (testName) {
            case 'NoEncryption':
                return (<NoEncryption></NoEncryption>)
            case 'Test2dbs':
                return (<Test2dbs></Test2dbs>)
            case 'ExistingConnection':
                return (<ExistingConnection></ExistingConnection>)
            case 'TestEncryption':
                return (<TestEncryption></TestEncryption>)
            case 'TestJsonImportExport':
                return (<TestJsonImportExport></TestJsonImportExport>)
            case 'CopyFromAssets':
                return (<CopyFromAssets></CopyFromAssets>)
            case 'TestUpgradeVersion':
                return (<TestUpgradeVersion></TestUpgradeVersion>)
            case 'TestIssue184':
                return (<TestIssue184></TestIssue184>)
            case 'MigrateDB':
                return (<MigrateDB></MigrateDB>)
            case 'NonConformedDB':
                return (<NonConformedDB></NonConformedDB>)
            default:
              console.log(`Test name: ${testName} does not exist`);
          }        
    }
    return (
        <IonPage id="view-message-page">
            <IonHeader translucent>
                <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton text="tests" defaultHref="/tab2"></IonBackButton>
                </IonButtons>
                </IonToolbar>
            </IonHeader>
    
            <IonContent fullscreen>
                {setTestName(params.name)}
            </IonContent>
        </IonPage>
    )
};
export default ViewTest;
