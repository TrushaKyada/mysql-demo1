const express = require("express");
const router = express.Router();
const { userAuth, authPermission } = require('../../../middleware/checkAuth');
const PriceListcontroller = require('../../../controllers/Common_Data/Price_List/Price_List_detail.controller')

router.post('/add-price-list',userAuth, authPermission('Admin'),PriceListcontroller.addPriceList)
router.get('/get-price-list',userAuth, authPermission('Admin'),PriceListcontroller.getPriceList)
router.patch('/edit-price-list',userAuth, authPermission('Admin'),PriceListcontroller.editPriceList)
router.delete('/delete-price-list',userAuth, authPermission('Admin'),PriceListcontroller.deletePriceList)


module.exports = router