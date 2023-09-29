const router = require('express').Router()

const RetailCustomer = require('../../controllers/customer/retail_customer.controller')
const Distibutor = require('../../controllers/customer/distributor.controller')
const { userAuth } = require('../../middleware/checkAuth')

router.post('/add-retail-customer', userAuth, RetailCustomer.addCustomer)
router.get('/all-retail-customer', userAuth, RetailCustomer.allCustomer)
router.post('/add-distibutor', userAuth, Distibutor.addDistibutor)
router.get('/all-distibutor', userAuth, Distibutor.allDistibutor)

module.exports = router