function run(dbClient) {
  dbClient.createTable('lobby', {
    columns: {
      id: {type: 'Number', primary_key: true},
      name: {type: 'String', required: true},
      current_theme: {type: 'String'},
      state: {type: 'String', required: true},
    },
    index_by: ['name'],
  });

  dbClient.createTable('member', {
    columns: {
      id: {type: 'Number', primary_key: true},
      name: {type: 'String', required: true},
    },
    index_by: ['name'],
  });

  dbClient
    .createTable('card', {
      columns: {
        code: {type: 'String', required: true},
        label: {type: 'String', required: true},
        value: {type: 'Number'},
      },
      index_by: ['code'],
    })
    .then(() => {
      dbClient.save('card', {code: 'Score0', label: '0', value: 0});
      dbClient.save('card', {code: 'Score1', label: '1', value: 1});
      dbClient.save('card', {code: 'Score2', label: '2', value: 2});
      dbClient.save('card', {code: 'Score3', label: '3', value: 3});
      dbClient.save('card', {code: 'Score5', label: '5', value: 5});
      dbClient.save('card', {code: 'Score8', label: '8', value: 8});
      dbClient.save('card', {code: 'Score13', label: '13', value: 13});
      dbClient.save('card', {code: 'Score20', label: '20', value: 20});
      dbClient.save('card', {code: 'Score40', label: '40', value: 40});
      dbClient.save('card', {code: 'Score100', label: '100', value: 100});
      dbClient.save('card', {code: 'DontKnow', label: '?'});
      dbClient.save('card', {code: 'Skip', label: 'Skip'});
    });

  dbClient.createTable('member_lobby_xref', {
    columns: {
      member_id: {type: 'Number', required: true},
      lobby_id: {type: 'Number', required: true},
    },
    index_by: ['member_id', 'lobby_id'],
  });

  dbClient.createTable('member_card_xref', {
    columns: {
      member_id: {type: 'Number', required: true},
      card_code: {type: 'String', required: true},
    },
    index_by: ['member_id'],
  });
}

module.exports = run;
