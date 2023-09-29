const db = require('../../config/db.config')
const Validator = require('validatorjs')
const DailyReport = db.daily_report
const Op = db.Sequelize


const morningReport = async (req, res) => {
    let validation = new Validator(req.body, {
        distributor_id: 'required',
        city: 'required',
        area: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body, user: { id: user_id } } = req
        body.user_id = user_id
        body.morning_status = new Date()
        body.isMorningReportSubmitted = true
        await DailyReport.create(body)
        return RESPONSE.success(res, 6001)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}




const eveningReport = async (req, res) => {
    let validation = new Validator(req.body, {
        productive_call: 'required',
        total_call: 'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body, user: { id: user_id }, params: { report_id } } = req
        body.evening_time = new Date()
        body.evening_status = new Date()
        body.isEveningReportSubmitted = true
        await DailyReport.update(body, {
            where:
            {
                id: report_id,
                user_id: user_id,
            }
        })
        return RESPONSE.success(res, 6002)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

module.exports = { morningReport, eveningReport }