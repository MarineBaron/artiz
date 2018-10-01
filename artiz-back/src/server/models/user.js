const bcrypt = require('bcrypt')

const Project = require('../models').Project;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 20],
          msg: "L'identifiant doit contenir entre 3 et 20 caractères."
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "L'email n'est pas conforme."
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    erpapikey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        this.setDataValue('password',bcrypt.hashSync(val, 10));
      }
    },
    role: {
      type: DataTypes.ENUM,
      values: ['admin', 'artisan', 'client']
    }
  });
  User.prototype.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };
  User.associate = (models) => {
    User.hasMany(models.Project, {
      foreignKey: 'artisanId',
      as: 'artisanProjects'
    });
    User.hasMany(models.Project, {
      foreignKey: 'clientId',
      as: 'clientProjects'
    });
    User.hasMany(models.Client, {
      foreignKey: 'clientId',
      as: 'artisans'
    });
    User.hasMany(models.Client, {
      foreignKey: 'artisanId',
      as: 'clients'
    });
  };
  return User;
};