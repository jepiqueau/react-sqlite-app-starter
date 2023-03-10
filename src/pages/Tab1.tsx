import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, useIonViewWillEnter } from '@ionic/react';
//import ExploreContainer from '../components/ExploreContainer';
import MessageListItem from '../components/MessageListItem';
import { useState } from 'react';
import { Message, messagesImport, fetchMessages } from '../data/messages';
import { sqlite } from '../App';
import { SQLiteDBConnection} from 'react-sqlite-hook';
import './Tab1.css';

const Tab1: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useIonViewWillEnter(async () => {
    console.log(`in useIonViewWillEnter`)

    try {
      // check if database "db-messages" exists
      const isDB = (await sqlite.isDatabase('db-messages')).result;
      console.log(`$$$ isDB : ${isDB}`)
        if (!isDB) {
          // get messagesImport
          const jsonImport = messagesImport;
          console.log(`jsonImport: ${JSON.stringify(jsonImport)}`)
          // simulate a fetch to get messages
          const response  = fetchMessages();
          console.log(`response: ${JSON.stringify(response)}`)
          // load the messages in jsonImport
          const mValues  = [];
          for (const message of response) {
            console.log(`message: ${JSON.stringify(message)}`)
            const row = [];
            const timestamp = Math.floor(Date.now() / 1000);
            row.push(message.id);
            row.push(message.fromName);
            row.push(message.subject);
            row.push(message.date);
            row.push(0);
            row.push(timestamp);
            console.log(`row: ${JSON.stringify(row)}`)
            mValues.push(row);
          }
          jsonImport.tables[0].values = mValues;
          console.log(`jsonImport: ${JSON.stringify(jsonImport)}`)
          const isJsonValid = await sqlite.isJsonValid(JSON.stringify(jsonImport));
          console.log(`>> jsonImport: ${JSON.stringify(jsonImport)}`)
          if(!isJsonValid.result) { 
            throw new Error(`Error: jsonImport Object not valid`);
          }
          const retImport: any = await sqlite.importFromJson(JSON.stringify(jsonImport)); 
          console.log(`full import result ${retImport.changes.changes}`);
          if(retImport.changes.changes === -1 ) {
            throw new Error(`Error: importFromJson failed`);
          }
        }
        // create a connection for "db-messages"
        const db: SQLiteDBConnection = await sqlite.createConnection("db-messages");
        await db.open();
        // query the messages
        const cmd = `--test comments
          SELECT *
          /*
          * Author: jeepq
          * Purpose: To show a comment that spans multiple lines in your SQL
          * statement in SQLite.
          */
          FROM messages;
        `;
        console.log(`&&&& cmd: ${cmd}`);
        const qValues = await db.query(cmd);
        const msgs = qValues.values
        if(msgs != null) {
          setMessages(msgs);            
        }
        // Close Connection db-messages        
        await sqlite.closeConnection("db-messages"); 

    } catch (err) {
      console.log(`Error: ${err}`);
    }
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {messages.map(m => <MessageListItem key={m.id} message={m} />)}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
