const Model = require('../models').User;
const Client = require('../models').Client;
const Project = require('../models').Project;
const jwt = require('jsonwebtoken');

module.exports = {
  getAll() {
    return new Promise((resolve, reject) => {
      Model.findAll({
        raw: true,
        attributes: ['id', 'username', 'email', 'role', 'name']
      })
      .then((users) => {
        resolve(users)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  getAllByRole(role) {
    return new Promise((resolve, reject) => {
      Model.findAll({
        raw: true,
        attributes: ['id', 'username', 'email', 'role', 'name'],
        where: {
          role: role
        }
      })
      .then((users) => {
        resolve(users)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  getOne(id) {
    return new Promise((resolve, reject) => {
      Model.findOne({
        raw: true,
        attributes: ['id', 'username', 'email', 'role', 'erpapikey', 'name'],
        where: {
          id: id
        }
      })
      .then((user) => {
        resolve(user)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  getOneByApiKey(key) {
    return new Promise((resolve, reject) => {
      Model.findOne({
        raw: true,
        attributes: ['id', 'username', 'email', 'role', 'erpapikey', 'name'],
        where: {
          erpapikey: key
        }
      })
      .then((user) => {
        resolve(user)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  create(data) {
    return new Promise((resolve, reject) => {
      Model.create({
        username: data.username,
        password: data.password,
        email: data.email,
        role: data.role,
        name: data.name
      })
      .then((user) => {
        resolve({
          username: user.username,
          password: user.password,
          email: user.email,
          role: user.role,
          name: data.name
        })
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  verify(data) {
    return new Promise((resolve, reject) => {
      Model.findOne({
        where: {
          username: data.username
        }
      })
      .then((user) => {
        if (!user) {
          reject({
            message: "L'identifiant est incorrect."
          })
        }
        if (user.verifyPassword(data.password)) {
          // @TODO change 'macle'
          const jwtBearerToken = jwt.sign({
            id: user.id,
            role: user.role
          }, 'macle')
          resolve({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            erpapikey: user.erpapikey,
            name: data.name,
            token: jwtBearerToken})
        } else {
          reject({
            message: "Les identifiants/mot de passe sont incorrects."
          })
        }
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  check(req) {
    const self = this;
    return new Promise((resolve, reject) => {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, 'macle');
          jwt.verify(req.headers.authorization.split(' ')[1], 'macle', function(err, decoded) {
            if (err) {
              reject()
            }
            self.getOne(decoded.id).then((user) => {
              resolve(user);
            })
          })
      } else {
        reject()
      }
    })
  },

  update(data) {
    return new Promise((resolve, reject) => {
      let user = {
        username: data.username,
        email: data.email,
        role: data.role,
        erpapikey: data.erpapikey,
        name: data.name
      }
      let fields = ['username', 'email', 'role', 'erpapikey', 'name']

      if (data.password.length) {
        user.password = data.password
        fields.push('password')
      }
      Promise.all([
        Model.update(user, {
          where: {
            id: data.id
          },
          fields: fields
        }),
        Client.update({
          isErpSync: false
        }, {
          where: {
            clientId: data.id
          }
        , fields: ['isErpSync'] })
      ])
      .then((results) => {
        resolve(data)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      Model.destroy({
        where: {
          id: id
        }
      })
      .then(() => {
        resolve()
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  // Actions suite Erp

  updateClientByErpId(id, artisan, data) {
    return new Promise((resolve, reject) => {
      // recherche du client associé
      Client.findOne({
        raw: true,
        attributes: ['clientId'],
        where: {
          erpId: id,
          artisanId: artisan.id,
        }
      })
      .then((client) => {
        Promise.all(
          [
            // mise à jour du client
            Model.update({
              isErpSync: true,
              name: data.name
            }, {
              where: {
                id: client.clientId
              }
            , fields: ['isErpSync', 'name'] }),
            // mise à jour des lignes clients (pour tous les artisans)
            Client.update({
              isErpSync: true,
            }, {
              where: {
                clientId: client.clientId
              }
            , fields: ['isErpSync'] })
          ]
        )
        .then((res) => {
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  // ne detruit pas le client, mais supprime la synchronisation
  removeSyncClientByErpId(id, artisan, data) {
    return new Promise((resolve, reject) => {
      // recherche du client associé
      Client.findOne({
        raw: true,
        attributes: ['clientId'],
        where: {
          erpId: id,
          artisanId: artisan.id,
        }
      })
      .then((client) => {
        // mise à jour des lignes clients (pour tous les artisans)
        Client.update({
          isErpSync: false,
        }, {
          where: {
            clientId: client.clientId
          }
        , fields: ['isErpSync'] })
        .then((res) => {
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  updateArtisanByErpId(artisan, data) {
    return new Promise((resolve, reject) => {
      // mise à jour du client
      Promise.all([
        Model.update({
          name: data.name
        }, {
          where: {
            id: artisan.id
          }
        , fields: ['isErpSync', 'name'] }),
        // mise à jour des propales (les PDF devront étre re-créés)
        Project.update({
          isErpSync: false
        }, {
          where: {
            artisanId: artisan.id
          }
        , fields: ['isErpSync'] }),
      ])
      .then((res) => resolve())
      .catch((error) => reject(error))
    });
  },


}
