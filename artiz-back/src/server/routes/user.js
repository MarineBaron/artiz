const router = require('express').Router()
const controller = require('../controllers').user

router.get('/users', function(req, res) {
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

router.get('/users/:role', function(req, res) {
  controller.getAllByRole(req.params.role)
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

router.get('/user/:id', function(req, res) {
  controller.getOne(req.params.id)
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

router.put('/user/:id', function(req, res) {
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

router.delete('/user/:id', function(req, res) {
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

router.put('/fromerp/client/:id', function(req, res) {
  controller.updateClientByErpId(req.params.id, req.user, req.body)
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

router.delete('/fromerp/client/:id', function(req, res) {
  controller.removeSyncClientByErpId(req.params.id, req.user, req.body)
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

router.put('/fromerp/artisan', function(req, res) {
  controller.updateArtisanByErpId(req.user, req.body)
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