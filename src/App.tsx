import React, { useState, useRef }  from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import { SQLiteHook, useSQLite } from 'react-sqlite-hook';
import ModalJsonMessages from './components/ModalJsonMessages';
import ViewMessage from './pages/ViewMessage';

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

interface JsonListenerInterface {
  jsonListeners: boolean,
  setJsonListeners: React.Dispatch<React.SetStateAction<boolean>>,
}
interface existingConnInterface {
  existConn: boolean,
  setExistConn: React.Dispatch<React.SetStateAction<boolean>>,
}

// Singleton SQLite Hook
export let sqlite: SQLiteHook;
// Existing Connections Store
export let existingConn: existingConnInterface;
// Is Json Listeners used
export let isJsonListeners: JsonListenerInterface;

setupIonicReact();

const App: React.FC = () => {
  const [existConn, setExistConn] = useState(false);
  existingConn = {existConn: existConn, setExistConn: setExistConn};
  const [jsonListeners, setJsonListeners] = useState(false);
  isJsonListeners = {jsonListeners: jsonListeners, setJsonListeners: setJsonListeners};
  const [isModal,setIsModal] = useState(false);
  const message = useRef("");
  
  const onProgressImport = async (progress: string) => {
    if(isJsonListeners.jsonListeners) {
      if(!isModal) setIsModal(true);
      message.current = message.current.concat(`${progress}\n`);
    }
  }
  const onProgressExport = async (progress: string) => {
    if(isJsonListeners.jsonListeners) {
      if(!isModal) setIsModal(true);
      message.current = message.current.concat(`${progress}\n`);
    }
  }
  
  // !!!!! if you do not want to use the progress events !!!!!
  // since react-sqlite-hook 2.1.0
  // sqlite = useSQLite()
  // before
  // sqlite = useSQLite({})
  // !!!!!                                               !!!!!

  sqlite = useSQLite({
    onProgressImport,
    onProgressExport
  });
  const handleClose = () => {
    setIsModal(false);
    message.current = "";
  }

  return (
  <IonApp>
    <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/tab1" component={Tab1} exact={true} />
            <Route path="/tab2" component={Tab2} exact={true} />
            <Route path="/tab3" component={Tab3} />
            <Route path="/" render={() => <Redirect to="/tab1" />} exact={true} />
            <Route path="/message/:id" component={ViewMessage} />
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
    { isModal
      ? <ModalJsonMessages close={handleClose} message={message.current}></ModalJsonMessages>
      : null
    }
  </IonApp>
  )
};

export default App;
