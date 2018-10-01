const router = require('express').Router()
const jwt = require('jsonwebtoken')
const ctlUser = require('../controllers/user.js')

// @TODO change 'macle'

function checkIfAuthenticated(req, res, next) {
  // from angular
  if (req.headers['authorization']) {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
      return res.status(401).json({
        auth: false,
        message: 'No token provided.'
      })
    }
    jwt.verify(token, 'macle', function(err, decoded) {
      if (err) {
        return res.status(500).send({
          auth: false,
          message: 'Failed to authenticate token.'
        })
      }
      req.user = decoded
      next();
    })
  } else {
    if (req.headers['erpapikey']) {
      ctlUser.getOneByApiKey(req.headers['erpapikey'])
      .then((user) => {
        if (!user) {
          return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
          })
        }
        req.user = user
        next();
      })
      .catch((err) => {
        return res.status(500).send({
          auth: false,
          message: 'Failed to authenticate token.'
        })
      })
    }
  }
}

router.use('/auth', require('./auth'))
router.use('/user', checkIfAuthenticated, require('./user'))
router.use('/project', checkIfAuthenticated, require('./project'))

module.exports = router