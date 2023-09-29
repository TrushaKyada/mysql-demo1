const router = require('express').Router()

const DispatchItemsReceive = require('../../controllers/dispatch/items_receive_voucher.controller')

const { userAuth,authPermission } = require('../../middleware/checkAuth')

router.get('/get-dispatch-item-receive',userAuth, authPermission('Admin'), DispatchItemsReceive.getDispatchReceive)
router.post('/add-dispatch-item-receive',userAuth, authPermission('Admin'), DispatchItemsReceive.addItemsReceive)
router.patch('/update-dispatch-item-receive',userAuth, authPermission('Admin'),DispatchItemsReceive.updateItemsRecive)
router.delete('/delete-dispatch-item-receive',userAuth, authPermission('Admin'),DispatchItemsReceive.deleteItemReceive)
module.exports = router