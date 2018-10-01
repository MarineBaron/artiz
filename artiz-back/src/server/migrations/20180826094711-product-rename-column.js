'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Products',
      'description',
      {
        type: Sequelize.STRING,
      }
    );
    queryInterface.removeColumn(
      'Products',
      'name'
    );
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'Products',
      'description'
    );
    queryInterface.addColumn(
      'Products',
      'name',
      {
        type: Sequelize.STRING,
      }
    );
  }
};
