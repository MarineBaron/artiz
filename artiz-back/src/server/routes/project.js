const router = require('express').Router()
const controller = require('../controllers').project

router.get('/projects', function(req, res) {
  console.log('/project/projects')
  controller.getAll()
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})

router.get('/projects/:role/:id', function(req, res) {
  controller.getAllByUser(req.params.role,req.params.id)
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})

router.get('/project/:id', function(req, res) {
  controller.getOne(req.params.id)
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    console.log(error)
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})

router.post('/project', function(req, res) {
  controller.create(req.body)
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})

router.put('/project/:id', function(req, res) {
  controller.update(req.body)
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})

router.put('/products/:id', function(req, res) {
  controller.createProducts(req.params.id, req.body)
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})

router.delete('/project/:id', function(req, res) {
  controller.delete(req.params.id)
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})

router.delete('/product/:projectId/:productId', function(req, res) {
  controller.deleteProduct(req.params.projectId, req.params.productId)
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})


router.put('/erp/project/:id', function(req, res) {
  controller.updateProjectErpId({
    id: req.params.id,
    erpId: req.body.erpId
  })
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})

router.put('/erp/product/:id', function(req, res) {
  controller.updateProductErpId({
    id: req.params.id,
    erpId: req.body.erpId
  })
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})

router.put('/erp/client/:id', function(req, res) {
  controller.updateClientErpId({
    artisan: req.body.artisan,
    client: req.body.client,
    erpId: req.body.erpId
  })
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})


router.put('/fromerp/:id', function(req, res) {
  controller.updateProjectByErpId(req.params.id, req.body)
  .then((data) => {
    res.json({
      success: true,
      data: data,
      error: null
    })
  })
  .catch((error) => {
    res.json({
      success: false,
      data: null,
      error: error
    })
  })
})


module.exports = router