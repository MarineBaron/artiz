'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Products',
      'projectId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'Products',
      'projectId'
    );
  }
};
