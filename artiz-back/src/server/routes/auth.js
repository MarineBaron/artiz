const router = require('express').Router()
const controller = require('../controllers').user


router.post('/signin', function(req, res) {
  controller.verify(req.body)
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

router.post('/signup', function(req, res) {
  controller.create(req.body)
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

router.get('/check', function(req, res) {
  controller.check(req)
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

router.post('/signout', function(req, res) {
  res.json({
    success: true,
    data: null,
    error: null
  })
})

module.exports = router