import { useState } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import { useParams } from 'react-router';
import { Message } from '../data/messages';
import { sqlite } from '../App';
import { SQLiteDBConnection} from 'react-sqlite-hook';
import './ViewMessage.css';

function ViewMessage() {
  const [message, setMessage] = useState<Message>();
  const params = useParams<{ id: string }>();

  useIonViewWillEnter(async () => {
    try {
      const msg = await getMessage(parseInt(params.id, 10));
      setMessage(msg);
    } catch(err) {
      console.log(`Error: ${err}`);
    }
  });

  const getMessage = async (id: number): Promise<Message> => {
    let message: Message = {} as Message;
    let isConn = await sqlite.isConnection("db-messages");
    let db: SQLiteDBConnection;
    try {
      if(!isConn.result) {
        db = await sqlite.createConnection("db-messages");
      } else {
        db = await sqlite.retrieveConnection("db-messages");
      }
      await db.open();
      // query the messages
      const stmt = `SELECT * FROM messages where id=${id}`;
      const qValues = await db.query(stmt);
      if (qValues && qValues.values && qValues.values.length === 1) {
        message = qValues.values[0];
      }
      return Promise.resolve(message);
    } catch (err) {
      return Promise.reject(`Error: ${err}`);
    }

  }
  return (
    <IonPage id="view-message-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Inbox" defaultHref="/home"></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {message ? (
          <>
            <IonItem>
              <IonIcon icon={personCircle} color="primary"></IonIcon>
              <IonLabel className="ion-text-wrap">
                <h2>
                  {message.fromName}
                  <span className="date">
                    <IonNote>{message.date}</IonNote>
                  </span>
                </h2>
                <h3>
                  To: <IonNote>Me</IonNote>
                </h3>
              </IonLabel>
            </IonItem>

            <div className="ion-padding">
              <h1>{message.subject}</h1>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </>
        ) : (
          <div>Message not found</div>
        )}
      </IonContent>
    </IonPage>
  );
}

export default ViewMessage;
