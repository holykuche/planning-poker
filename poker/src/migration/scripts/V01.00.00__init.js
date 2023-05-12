async function run(dbClient) {

    await dbClient.createTable("lobby", {
        columns: {
            id: { type: "Number", primary_key: true },
            name: { type: "String", required: true },
            current_theme: { type: "String" },
            state: { type: "String", required: true },
        },
        index_by: [ "name" ],
    });

    await dbClient.createTable("member", {
        columns: {
            id: { type: "Number", primary_key: true },
            name: { type: "String", required: true },
        },
        index_by: [ "name" ],
    });

    await dbClient.createTable("member_lobby_xref", {
        columns: {
            member_id: { type: "Number", required: true },
            lobby_id: { type: "Number", required: true },
        },
        index_by: [ "member_id", "lobby_id" ],
    });

    await dbClient.createTable("member_card_xref", {
        columns: {
            member_id: { type: "Number", required: true },
            card_code: { type: "String", required: true },
        },
        index_by: [ "member_id" ],
    });

}

module.exports = run;