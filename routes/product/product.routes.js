const router = require('express').Router()
const { userAuth, authPermission } = require('../../middleware/checkAuth')
const productController = require('../../controllers/products/products.controller')

router.post('/add-product', userAuth, authPermission('Admin'), productController.addProduct)
router.get('/get-product-list', userAuth, productController.getAllProductList)

module.exports = router