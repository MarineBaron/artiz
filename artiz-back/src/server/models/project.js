module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
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
      }
    },
    isErpSync: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    erpId: DataTypes.INTEGER
  }, {});
  Project.associate = (models) => {
    Project.belongsTo(models.User, {
      foreignKey: 'artisanId',
      as: 'artisan',
      onDelete: 'CASCADE'
    });
    Project.belongsTo(models.User, {
      foreignKey: 'clientId',
      as: 'client',
      onDelete: 'CASCADE'
    });
    Project.hasMany(models.Product, {
      foreignKey: 'projectId',
      as: 'products',
    });
  };
  return Project;
};