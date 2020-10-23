import { Images } from './base64images';


export const dataToImport: any = {
    database : "db-from-json",
    version: 1,
    encrypted : false,
    mode : "full",
    tables :[
        {
            name: "users",
            schema: [
                {column:"id", value: "INTEGER PRIMARY KEY NOT NULL"},
                {column:"email", value:"TEXT UNIQUE NOT NULL"},
                {column:"name", value:"TEXT"},
                {column:"age", value:"INTEGER"},
                {column:"last_modified", value:"INTEGER"}
            ],
            indexes: [
                {name: "index_user_on_name",column: "name"},
                {name: "index_user_on_last_modified",column: "last_modified"}
            ],
            values: [
                [1,"Whiteley.com","Whiteley",30,1582536810],
                [2,"Jones.com","Jones",44,1582812800],
                [3,"Simpson@example.com","Simpson",69,1583570630],
                [4,"Brown@example.com","Brown",15,1590383895]
            ]
        },
        {
          name: "messages",
          schema: [
            {column:"id", value: "INTEGER PRIMARY KEY NOT NULL"},
            {column:"title", value:"TEXT NOT NULL"},
            {column:"body", value:"TEXT NOT NULL"},
            {column:"last_modified", value:"INTEGER"}
          ],
          values: [
              [1,"test post 1","content test post 1",1587310030],
              [2,"test post 2","content test post 2",1590388125]
          ]
        },
        {
          name: "images",
          schema: [
            {column:"id", value: "INTEGER PRIMARY KEY NOT NULL"},
            {column:"name", value:"TEXT UNIQUE NOT NULL"},
            {column:"type", value:"TEXT NOT NULL"},
            {column:"size", value:"INTEGER"},
            {column:"img", value:"BLOB"},
            {column:"last_modified", value:"INTEGER"}
          ],
          values: [
            [1,"feather","png","NULL",Images[1],1582536810],
            [2,"meowth","png","NULL",Images[0],1590151132]
          ]
        }

    ]
};
export const partialImport1: any = {
    database : "db-from-json",
    version: 1,
    encrypted : false,
    mode : "partial",
    tables :[
        {
            name: "users",
            values: [
                [5,"Addington.com","Addington",22,1590388335],
                [6,"Bannister.com","Bannister",59,1590393015],
                [2,"Jones@example.com","Jones",45,1590393325]

            ]
        },
        {
          name: "messages",
          indexes: [
            {name: "index_messages_on_title",column: "title"},
            {name: "index_messages_on_last_modified",column: "last_modified"}

          ],
          values: [
              [3,"test post 3","content test post 3",1590396146],
              [4,"test post 4","content test post 4",1590396288]
          ]
        }

    ]
}; 
export const tableTwoImports: any = {
    database: "twoimports",
    version: 1,
    encrypted: false,
    mode: "full",
    tables: [
      {
        name: "areas",
        schema: [
          { column: "id", value: "INTEGER PRIMARY KEY NOT NULL" },
          { column: "name", value: "TEXT" },
          { column: "favourite", value: "INTEGER" },
          { column:"last_modified", value:"INTEGER"},
        ],
      },
      {
        name: "elements",
        schema: [
          { column: "id", value: "INTEGER PRIMARY KEY NOT NULL" },
          { column: "name", value: "TEXT" },
          { column: "favourite", value: "INTEGER" },
          { column:"last_modified", value:"INTEGER"},
        ],
      },
      {
        name: "issues",
        schema: [
          { column: "id", value: "INTEGER PRIMARY KEY NOT NULL" },
          { column: "name", value: "TEXT" },
          { column: "favourite", value: "INTEGER" },
          { column:"last_modified", value:"INTEGER"},
        ],
      },
    ],
}; 
export const dataTwoImports: any = {
    database: "twoimports",
    version: 1,
    encrypted: false,
    mode: "partial",
    tables: [
      {
        name: "areas",
        values: [
          [1, "Access road", 0, 1590396146],
          [2, "Accessway", 0, 1590396146],
          [3, "Air handling system", 0, 1590396146],
        ],

      },
      {
        name: "elements",
        values: [
          [1, "Access door < 3m in height", 0, 1590396288],
          [2, "Access door > 3m in height", 0, 1590396288],
          [3, "Air inflitration", 0, 1590396288],
          [4, "Air ventilation", 0, 1590396288],
        ],
      },
      {
        name: "issues",
        values: [
          [1, "Accumulation of internal moisture", 0, 1590388335],
          [2, "Backflow prevention device", 0, 1590388335],
          [3, "Backpressure", 0, 1590388335],
          [4, "Backsiphonage", 0, 1590388335],
        ],
      },
    ],
};

/*
          { column:"last_modified", value:"INTEGER DEFAULT (strftime('%s', 'now'))"},

*/