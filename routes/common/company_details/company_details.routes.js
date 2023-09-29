const express = require("express");
let router = express.Router();
const { userAuth, authPermission } = require('../../../middleware/checkAuth');
const { addCompanyDetails, getCompanyDetails, updateCompanyDetails } = require('../../../controllers/Common_Data/company_details/company_details.controller')

router.post('/add-company-details',/* userAuth, authPermission('Admin'),*/addCompanyDetails)
router.get('/get-company-details', userAuth, authPermission('Admin'),getCompanyDetails)
router.patch('/edit-company-details',userAuth, authPermission('Admin'),updateCompanyDetails)



module.exports = router