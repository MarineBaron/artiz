module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    qty: {
      type: DataTypes.REAL,
      allowNull: false
    },
    price: {
      type: DataTypes.REAL,
      allowNull: false
    },
    tva_tx: {
      type: DataTypes.REAL,
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Projects',
        key: 'id',
        as: 'projectId',
      },
    },
    erpId: DataTypes.INTEGER
  }, {});
  Product.associate = (models) => {
    Product.belongsTo(models.Project, {
      foreignKey: 'projectId',
      onDelete: 'CASCADE',
    });
  };
  return Product;
};