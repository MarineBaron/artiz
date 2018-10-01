'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Users',
      'dolapikey',
      {
        type: Sequelize.STRING,
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'Users',
      'dolapikey'
    );
  }
};
