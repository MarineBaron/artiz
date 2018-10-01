'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Products',
      'dolibarrId',
      {
        type: Sequelize.INTEGER,
      }
    );
    queryInterface.addColumn(
      'Projects',
      'dolibarrId',
      {
        type: Sequelize.INTEGER,
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'Products',
      'dolibarrId'
    );
    queryInterface.removeColumn(
      'Projects',
      'dolibarrId'
    );
  }
};
