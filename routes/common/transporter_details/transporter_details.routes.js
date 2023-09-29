const express = require("express");
const router = express.Router();
const { userAuth, authPermission } = require('../../../middleware/checkAuth');
const Transportercontroller = require('../../../controllers/Common_Data/transporter_details/transporter_details.controller');

router.get('/get-transporter-details',userAuth, authPermission('Admin'),Transportercontroller.getTransporterDetails)
router.delete('/delete-transporter-details',userAuth, authPermission('Admin'),Transportercontroller.deleteTransporterDetails)
router.post('/add-transporter-details',userAuth, authPermission('Admin'),Transportercontroller.addTransporterDetails)
router.patch('/update-transporter-details',userAuth, authPermission('Admin'),Transportercontroller.updateTransporterDetails)




module.exports = router