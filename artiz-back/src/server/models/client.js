module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    erpId: DataTypes.INTEGER,
    artisanId: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id'
      },
    },
    clientId: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id'
      },
    },
    isErpSync: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {});
  Client.associate = function(models) {
    Client.belongsTo(models.User, {
      foreignKey: 'artisanId',
      as: 'artisan',
      onDelete: 'CASCADE'
    });
    Client.belongsTo(models.User, {
      foreignKey: 'clientId',
      as: 'client',
      onDelete: 'CASCADE'
    });
  };
  return Client;
};