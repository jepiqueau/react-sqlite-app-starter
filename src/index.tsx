import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { defineCustomElements as jeepSqlite, applyPolyfills, JSX as LocalJSX  } from "jeep-sqlite/loader";
import { HTMLAttributes } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

type StencilToReact<T> = {
  [P in keyof T]?: T[P] & Omit<HTMLAttributes<Element>, 'className'> & {
    class?: string;
  };
} ;

declare global {
  export namespace JSX {
    interface IntrinsicElements extends StencilToReact<LocalJSX.IntrinsicElements> {
    }
  }
}

applyPolyfills().then(() => {
  jeepSqlite(window);
});
window.addEventListener('DOMContentLoaded', async () => {
  const platform = Capacitor.getPlatform();
  const sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite)
  try {
    if(platform === "web") {
      console.log('in index.ts')
      const jeepEl = document.createElement("jeep-sqlite");
      document.body.appendChild(jeepEl);
      await customElements.whenDefined('jeep-sqlite');
      console.log('in index.ts after customElements')
      await sqlite.initWebStore();
      console.log('after sqlite.initWebStore()');   
    }
    await sqlite.checkConnectionsConsistency();

    let db: SQLiteDBConnection = await sqlite.createConnection("db_issue9", false, "no-encryption", 1);
    console.log(`db ${JSON.stringify(db)}`)
    await db.open();
    console.log(`after db.open`)
    let query = `
    CREATE TABLE IF NOT EXISTS test (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL
    );
    `
    console.log(`query ${query}`)

    const res: any = await db.execute(query);
    console.log(`res: ${JSON.stringify(res)}`);
    await db.close();
    console.log(`after db.close`);
    await sqlite.closeConnection("db_issue9");
    
    ReactDOM.render(
      <React.StrictMode>
        <App /> 
      </React.StrictMode>,
      document.getElementById('root')
    );

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://bit.ly/CRA-PWA
    serviceWorker.unregister();

  } catch (err) {
    console.log(`Error: ${err}`);
    throw new Error(`Error: ${err}`)
  }

});



