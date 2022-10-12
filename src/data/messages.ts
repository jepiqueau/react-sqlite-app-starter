import MessagesJson from './messages.json';


export interface Message {
  fromName: string;
  subject: string;
  date: string;
  id: number;
}

export const messagesImport: any = {
  database : "db-messages",
  version : 1,
  encrypted : false,
  mode : "full",
  tables :[
      {
          name: "messages",
          schema: [
              {column:"id", value: "INTEGER PRIMARY KEY NOT NULL"},
              {column:"fromName", value:"TEXT NOT NULL"},
              {column:"subject", value:"TEXT"},
              {column:"date", value:"TEXT"},
              {column:'sql_deleted', value:'BOOLEAN DEFAULT 0 CHECK (sql_deleted IN (0, 1))'},
              {column:'last_modified', value:'INTEGER DEFAULT (strftime(\'%s\', \'now\'))'}
          ],
          indexes: [
              {name: "index_user_on_fromName",value: "fromName"},
              {name: "index_user_on_last_modified",value: "last_modified DESC"}
          ]
      },

  ]
};

export const fetchMessages = () => {
  const messages: Message[] = MessagesJson;
  return messages;
}
