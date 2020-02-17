import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { DarkModeService } from '../services/DarkModeService';

class Tab3 extends React.Component {
  dMService:DarkModeService ;

  constructor(props:any) {
    super(props);
    this.dMService = new DarkModeService ();
  }
  
  enableDarkTheme(mode:boolean) {
    this.dMService.enableDarkTheme(mode);
  }

  /**
   * Render
   */
  render() {   

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Tab Three</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonButton id="dark" onClick={this.enableDarkTheme.bind(this,true)} expand="block">Dark Theme</IonButton>
          <IonButton id="light" onClick={this.enableDarkTheme.bind(this,false)}  expand="block">Light Theme</IonButton>

        </IonContent>
      </IonPage>
    );
  };
};

export default Tab3;
