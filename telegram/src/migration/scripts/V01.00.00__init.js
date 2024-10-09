async function run(dbClient) {
  await dbClient.createTable('telegram_message', {
    columns: {
      id: {type: 'Number', primary_key: true},
      lobby_id: {type: 'Number', required: true},
      chat_id: {type: 'Number', required: true},
      message_id: {type: 'Number', required: true},
      message_type: {type: 'String', required: true},
    },
    index_by: ['lobby_id'],
  });

  await dbClient.createTable('telegram_user_member_xref', {
    columns: {
      telegram_user_id: {type: 'Number', primary_key: true},
      member_id: {type: 'Number', required: true},
    },
    index_by: ['member_id'],
  });
}

module.exports = run;
