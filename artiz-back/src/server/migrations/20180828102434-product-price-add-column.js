'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Products',
      'price',
      {
        type: Sequelize.REAL,
      }
    );
    queryInterface.addColumn(
      'Products',
      'tva_tx',
      {
        type: Sequelize.REAL,
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'Products',
      'price'
    );
    queryInterface.removeColumn(
      'Products',
      'tva_tx'
    );
  }
};
