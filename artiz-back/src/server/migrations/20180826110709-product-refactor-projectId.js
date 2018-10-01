'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'Products',
      'projectId'
    );
    queryInterface.addColumn(
      'Products',
      'projectId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Projects',
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
  }
};
