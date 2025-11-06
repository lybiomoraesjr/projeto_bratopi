const express = require('express')
const router = express.Router()
const controller = require('../controllers/rotasController');
const authMiddleware = require('../services/authMiddleware');

router.get('/', authMiddleware, controller.getAllRotas);
router.get('/:id', authMiddleware, controller.getById);
router.post('/', authMiddleware, controller.create);
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

module.exports = router
