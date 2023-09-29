const router = require('express').Router()

const RetailOrder = require('../../controllers/order/retail_order.controller')
const { userAuth } = require('../../middleware/checkAuth')

router.post('/create-order', userAuth, RetailOrder.createOrder)
router.get('/today-order-item', userAuth, RetailOrder.getTodayOrderItems)

module.exports = router