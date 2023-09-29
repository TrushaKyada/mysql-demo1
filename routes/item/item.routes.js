const express = require("express");
const router = express.Router();
const { userAuth, authPermission } = require('../../middleware/checkAuth');
const itemController = require('../../controllers/items/items.controller');
const hsnController = require('../../controllers/items/hsn.controller')


router.post('/add-item', userAuth, authPermission('Admin'), itemController.addItem);

// Raw Materials
router.get('/get-item', userAuth, authPermission('Admin'), itemController.getItemData);
router.patch('/update-item', userAuth, authPermission('Admin'), itemController.updateItem);
router.delete('/delete-item', userAuth, authPermission('Admin'), itemController.deleteItem);
// router.get('/get-raw-material-id',userAuth,authPermission('Admin'),itemController.getRawMaterialbyId);


// Finishes goods
// router.get('/get-finishes-goods', userAuth, authPermission('Admin'), itemController.getFinishedGoods);
// router.patch('/update-finishes-goods', userAuth, authPermission('Admin'), itemController.updatefinishedGoods);
// router.delete('/delete-finishes-goods', userAuth, authPermission('Admin'), itemController.deleteFinishedGoods);
router.get('/get-items-data', userAuth, authPermission('Admin'), itemController.getItems)


// HSN Data
router.post('/add-hsn', userAuth, authPermission('Admin'), hsnController.addHsn)
router.get('/get-hsn', userAuth, authPermission('Admin'), hsnController.getHsn)
router.patch('/edit-hsn',userAuth, authPermission('Admin'),hsnController.editHsn)
router.delete('/delete-hsn',userAuth, authPermission('Admin'),hsnController.deleteHsn)

module.exports = router;