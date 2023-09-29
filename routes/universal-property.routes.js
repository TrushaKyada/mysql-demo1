const router = require('express').Router();

const { userAuth, authPermission } = require('../middleware/checkAuth');

const UniversalProperty = require('../controllers/items/uom.controller');
const stockCategory = require('../controllers/items/Stock_category.controller')

// Universal property
router.post('/create-universal-property',userAuth,userAuth,authPermission('Admin'),UniversalProperty.addUnitOfMesurement);
router.get('/get-universal-property',userAuth,userAuth,authPermission('Admin'),UniversalProperty.getUnitOfMesurement);
router.patch('/edit-universal-property',userAuth,userAuth,authPermission('Admin'),UniversalProperty.editUnitOfMesurement)
router.delete('/delete-universal-property',userAuth,userAuth,authPermission('Admin'),UniversalProperty.deleteUnitOfMesurement)

// Stock Category
router.post('/create-stock-category',userAuth,userAuth,authPermission('Admin'),stockCategory.addStockCategory);
router.get('/get-stock-category',userAuth,userAuth,authPermission('Admin'),stockCategory.getStockCategory);
router.patch('/edit-stock-category',userAuth,userAuth,authPermission('Admin'),stockCategory.editStockCategory)
router.delete('/delete-stock-category',userAuth,userAuth,authPermission('Admin'),stockCategory.deleteStockCategory)


module.exports = router;


