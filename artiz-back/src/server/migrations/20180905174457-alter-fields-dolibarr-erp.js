'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.renameColumn(
      'Clients',
      'dolibarrId',
      'erpId',
    );
    queryInterface.renameColumn(
      'Products',
      'dolibarrId',
      'erpId',
    );
    queryInterface.renameColumn(
      'Projects',
      'dolibarrId',
      'erpId',
    );
    queryInterface.renameColumn(
      'Users',
      'dolapikey',
      'erpapikey',
    );
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.renameColumn(
      'Clients',
      'erpId',
      'dolibarrId',
    );
    queryInterface.renameColumn(
      'Products',
      'erpId',
      'dolibarrId',
    );
    queryInterface.renameColumn(
      'Projects',
      'erpId',
      'dolibarrId',
    );
    queryInterface.renameColumn(
      'Users',
      'erpapikey',
      'dolapikey',
    );
  }
};
