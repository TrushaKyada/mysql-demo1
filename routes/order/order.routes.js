const router = require('express').Router()

const RetailOrder = require('../../controllers/order/retail_order.controller')
const DistributorOrder = require('../../controllers/order/distibutor_order.controller')
const { userAuth } = require('../../middleware/checkAuth')

router.post('/create-retail-order', userAuth, RetailOrder.createOrder)
router.post('/create-distributor-order', userAuth, DistributorOrder.createDistOrder)
router.get('/today-order-item', userAuth, RetailOrder.getTodayOrderItems)

module.exports = router