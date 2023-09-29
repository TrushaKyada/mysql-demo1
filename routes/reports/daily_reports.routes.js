const router = require('express').Router()

const { userAuth } = require('../../middleware/checkAuth')
const { morningReport, eveningReport } = require('../../controllers/reports/daily_reports.controller')

router.post('/morning-report', userAuth, morningReport)
router.patch('/evening-report/:report_id', userAuth, eveningReport)

module.exports = router