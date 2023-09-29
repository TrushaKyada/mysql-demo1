const express = require("express");
const router = express.Router();
const { userAuth, authPermission } = require('../../middleware/checkAuth');
const formulaController = require('../../controllers/manufacture/formula.controller')
const mfg_orderProcessControllerAddress = require('../../controllers/manufacture/mfg_process_order/godown_address.controller')
const mfg_orderProcessController = require('../../controllers/manufacture/mfg_process_order/mfg_process_order.controller')
const RackController = require('../../controllers/manufacture/mfg_process_order/room/rack_data.controller')
const RoomController = require("../../controllers/manufacture/mfg_process_order/room/room_data.controller")
const MaterialReceiveController = require('../../controllers/manufacture/inventory/material_receive.controller')
const ReadyToDeliverController = require('../../controllers/manufacture/inventory/ready_to_deliver.controller')

const RackDataController = require('../../controllers/manufacture/rack_management_controller')
// Formula
router.post('/add-formula', userAuth, authPermission('Admin'), formulaController.addFormula)
router.get('/get-formula', userAuth, authPermission('Admin'), formulaController.getFormula)
router.patch('/update-formula', userAuth, authPermission('Admin'), formulaController.updateFormula)
router.delete('/delete-formula', userAuth, authPermission('Admin'), formulaController.deleteFormula)

//*****************************   Mfg Order && Process  **********************************//
// Godown Address
router.post('/add-godown-address', userAuth, authPermission('Admin'), mfg_orderProcessControllerAddress.addGodownAddress)
router.get('/get-godown-address', userAuth, authPermission('Admin'), mfg_orderProcessControllerAddress.getGodownAddress)
router.patch('/update-godown-address', userAuth, authPermission('Admin'), mfg_orderProcessControllerAddress.editGodownAddress)
router.delete('/delete-godown-address', userAuth, authPermission('Admin'), mfg_orderProcessControllerAddress.deleteGodownAddress)

// Mfg Order && Process
router.post('/add-mfg-order-process', userAuth, authPermission('Admin'), mfg_orderProcessController.addMfgOrderProcess)
router.get('/get-mfg-order-process', userAuth, authPermission('Admin'), mfg_orderProcessController.getMfgOrderProcess)
router.patch('/update-mfg-order-process', userAuth, authPermission('Admin'), mfg_orderProcessController.editMfgOrderProcess)
router.delete('/delete-mfg-order-process', userAuth, authPermission('Admin'), mfg_orderProcessController.deleteMfgOrderProcess)

// Room
router.post('/add-room', userAuth, authPermission('Admin'), RoomController.addRoom)
router.get('/get-room', userAuth, authPermission('Admin'), RoomController.getRoom)
router.patch('/update-room', userAuth, authPermission('Admin'), RoomController.updateRoom)
router.delete('/delete-room', userAuth, authPermission('Admin'), RoomController.deleteRoom)

// Rack
router.post('/add-rack', userAuth, authPermission('Admin'), RackController.addRack)
router.get('/get-rack', userAuth, authPermission('Admin'), RackController.getRack)
router.patch('/update-rack', userAuth, authPermission('Admin'), RackController.editRack)
router.delete('/delete-rack', userAuth, authPermission('Admin'), RackController.deleteRack)

// Inventory
// Material Receive
router.post('/add-material-receive', userAuth, authPermission('Admin'), MaterialReceiveController.addMaterialReceive)
router.get('/get-material-receive', userAuth, authPermission('Admin'), MaterialReceiveController.getMaterialReceive)
router.patch('/update-material-receive',userAuth, authPermission('Admin'),MaterialReceiveController.editMaterialReceive)
router.delete('/delete-material-receive',userAuth, authPermission('Admin'),MaterialReceiveController.deleteMaterialReceive)

// Ready TO Deliver
router.post('/add-ready-to-deliver',userAuth, authPermission('Admin'),ReadyToDeliverController.addReadyToDelivery)
router.get('/get-ready-to-deliver',userAuth, authPermission('Admin'),ReadyToDeliverController.getReadyToDelivery)
router.patch('/update-ready-to-deliver',userAuth, authPermission('Admin'),ReadyToDeliverController.editReadyToDelivery)
router.delete('/delete-ready-to-deliver',userAuth, authPermission('Admin'),ReadyToDeliverController. deleteReadyToDelivery)

// Rack data
router.get('/get-rack-management-data',userAuth, authPermission('Admin'),RackDataController.getRackManagement)
router.patch('/update-rack-management-data',userAuth, authPermission('Admin'),RackDataController.updateRackManagement)

module.exports = router