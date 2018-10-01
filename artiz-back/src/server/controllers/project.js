const Model = require('../models').Project;
const User = require('../models').User;
const Product = require('../models').Product;
const Project = require('../models').Project;
const Client = require('../models').Client;

module.exports = {
  getAll() {
    return new Promise((resolve, reject) => {
      Model.findAll({
        attributes: ['id', 'name', 'isErpSync'],
        include: [
          { model: User, as: 'artisan', attributes: ['id', 'username', 'name']},
          { model: User, as: 'client', attributes: ['id', 'username', 'name']}
        ]
      })
      .then((projects) => {
        Promise.all(projects.map((p) => {
          return Client.findOne({
            where: {
              clientId: p.client.id,
              artisanId: p.artisan.id,
            },
            attributes: ['erpId', 'isErpSync']
          })
        })).then((results) => {
          results.map((r, i) => {
            projects[i].client.dataValues.erpId = r ? r. erpId : null;
            projects[i].client.dataValues.isErpSync = r ? r.isErpSync  : null;
          })
          resolve(projects)
        })
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  getAllByUser(role, id) {
    return new Promise((resolve, reject) => {
      let where;
      if (role === 'artisan') {
        where = {
          artisanId: id
        }
      } else if (role === 'client') {
        where = {
          clientId: id
        }
      }
      Model.findAll({
        attributes: ['id', 'name', 'isErpSync'],
        include: [
          { model: User, as: 'artisan', attributes: ['id', 'username', 'name'] },
          { model: User, as: 'client', attributes: ['id', 'username', 'name'] },
        ],
        where: where
      })
      .then((projects) => {
        Promise.all(projects.map((p) => {
          return Client.findOne({
            where: {
              clientId: p.client.id,
              artisanId: p.artisan.id,
            },
            attributes: ['erpId', 'isErpSync']
          })
        })).then((results) => {
          results.map((r, i) => {
            projects[i].client.dataValues.erpId = r ? r. erpId : null;
            projects[i].client.dataValues.isErpSync = r ? r.isErpSync  : null;
          })
          resolve(projects)
        })
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  getOne(id) {
    return new Promise((resolve, reject) => {
      Model.findOne({
        include: [
        { model: User, as: 'artisan', attributes: ['id', 'username', 'erpapikey', 'name'] },
        { model: User, as: 'client', attributes: ['id', 'username', 'name'] },
        { model: Product, as: 'products', attributes: ['id', 'description', 'qty', 'tva_tx', 'price', 'erpId'] },
      ],
        attributes: ['id', 'name', 'erpId', 'isErpSync'],
        where: {
          id: id
        }
      })
      .then((project) => {
        Client.findOne({
          //raw: true,
          where: {
            clientId: project.dataValues.client.id,
            artisanId: project.dataValues.artisan.id,
          },
          attributes: ['erpId', 'isErpSync']
        })
        .then((result) => {
          project.dataValues.client.dataValues.erpId = result ? result.dataValues.erpId : null;
          project.dataValues.client.dataValues.isErpSync = result ? result.dataValues.isErpSync : null;
          resolve(project)
        })
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  create(data) {
    const self = this;
    return new Promise((resolve, reject) => {
      Model.create({
        name: data.name,
        artisanId: data.artisan,
        clientId: data.client,
      })
      .then((project) => {
        Client.findOne({
          where: {
            artisanId: data.artisan,
            clientId: data.client
          }
        }).then((client) => {
          if(client) {
            resolve(self.getOne(project.id))
          } else {
            Client.create({
              artisanId: data.artisan,
              clientId: data.client
            })
            .then((client) => {
              resolve(self.getOne(project.id))
            })
            .catch((error) => {
              reject(error)
            })
          }
        })
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  update(data) {
    return new Promise((resolve, reject) => {
      Model.update({
        name: data.name,
        isErpSync: false
      }, {
        where: {
          id: data.id
        }
      }, { fields: ['name'] })
      .then((project) => {
        resolve(this.getOne(data.id))
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

  createProducts(id, allProducts) {
    return new Promise((resolve, reject) => {
      Promise.all([
        Product.bulkCreate(allProducts.filter(p => p.id === null)),
        Model.update({
          isErpSync: false
        }, {
          where: {
            id: projectId
          }, fields: ['isErpSync']
        })
      ])
      .then(() => {
        return Product.findAll({
          where: {
            projectId: id
          }
        });
      })
      .then((products) => {
        resolve(products)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  deleteProduct(projectId, productId) {
    return new Promise((resolve, reject) => {
      Promise.all([
        Product.destroy({
          where: {
            id: productId
          }
        }),
        Model.update({
          isErpSync: false
        }, {
          where: {
            id: projectId
          }, fields: ['isErpSync']
        })
      ])
      .then(() => {
        resolve()
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  updateProjectErpId(data) {
    return new Promise((resolve, reject) => {
      Model.update({
        erpId: data.erpId,
        isErpSync: 1
      }, {
        where: {
          id: data.id
        }
      }, { fields: ['erpId', 'isErpSync'] })
      .then((project) => {
        resolve(data.erpId)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  updateProductErpId(data) {
    return new Promise((resolve, reject) => {
      Product.update({
        erpId: data.erpId
      }, {
        where: {
          id: data.id
        }
      }, { fields: ['erpId'] })
      .then((project) => {
        resolve({
          id: data.id,
          erpId: data.erpId
        })
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  updateClientErpId(data) {
    return new Promise((resolve, reject) => {
      Client.update({
        erpId: data.erpId,
        isErpSync: 1
      }, {
        where: {
          artisanId: data.artisan,
          clientId: data.client,
        }
      }, { fields: ['erpId', 'isErpSync'] })
      .then((project) => {
        resolve(data.erpId)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },

  updateProjectByErpId(id, data) {
    return new Promise((resolve, reject) => {
      // mise à jour du project
      Model.update(data, {
        where: {
          erpId: id
        },
        fields: ['isErpSync', 'name']
      })
      .then((res) => resolve())
      .catch((error) => reject(error))
    });
  },

}