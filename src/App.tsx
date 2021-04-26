import React, { useState }  from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import { useSQLite } from 'react-sqlite-hook/dist';
import { Toast } from '@capacitor/toast';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

// Singleton SQLite Hook
export let sqlite: any;
// Existing Connections Store
export let existingConn: any;
// Is Json Listeners used
export let isJsonListeners: any;

const App: React.FC = () => {
  const [existConn, setExistConn] = useState(false);
  existingConn = {existConn: existConn, setExistConn: setExistConn};
  const [jsonListeners, setJsonListeners] = useState(false);
  isJsonListeners = {jsonListeners: jsonListeners, setJsonListeners: setJsonListeners};

  const onProgressImport = async (progress: string) => {
    if(isJsonListeners.jsonListeners) await Toast.show({
        text: progress,
        duration: 'short',
        position: 'top'
      });
  }
  const onProgressExport = async (progress: string) => {
    if(isJsonListeners.jsonListeners) await Toast.show({
        text: progress,
        duration: 'short',
        position: 'top'
      });
  }

  const {echo, getPlatform, createConnection, closeConnection,
         retrieveConnection, retrieveAllConnections, closeAllConnections,
         isConnection, addUpgradeStatement, importFromJson, isJsonValid,
         isDatabase, getDatabaseList, addSQLiteSuffix, deleteOldDatabases,
         copyFromAssets, checkConnectionsConsistency, isAvailable} = useSQLite({
          onProgressImport,
          onProgressExport
         });
  sqlite = {echo: echo, getPlatform: getPlatform,
            createConnection: createConnection,
            closeConnection: closeConnection,
            retrieveConnection: retrieveConnection,
            retrieveAllConnections: retrieveAllConnections,
            closeAllConnections: closeAllConnections,
            isConnection: isConnection,
            isDatabase: isDatabase,
            getDatabaseList: getDatabaseList,
            addSQLiteSuffix: addSQLiteSuffix,
            deleteOldDatabases: deleteOldDatabases,
            addUpgradeStatement: addUpgradeStatement,
            importFromJson: importFromJson,
            isJsonValid: isJsonValid,
            copyFromAssets: copyFromAssets,
            checkConnectionsConsistency: checkConnectionsConsistency,
            isAvailable:isAvailable};
  
  return (
  <IonApp>
    <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/tab1" component={Tab1} exact={true} />
            <Route path="/tab2" component={Tab2} exact={true} />
            <Route path="/tab3" component={Tab3} />
            <Route path="/" render={() => <Redirect to="/tab1" />} exact={true} />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon icon={triangle} />
              <IonLabel>Tab 1</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tab2">
              <IonIcon icon={ellipse} />
              <IonLabel>Tab 2</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab3">
              <IonIcon icon={square} />
              <IonLabel>Tab 3</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
    </IonReactRouter>
  </IonApp>
  )
};

export default App;
