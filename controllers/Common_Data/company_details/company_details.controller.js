const db = require('../../../config/db.config')


// model
const Company_details = db.company_details
const Company_terms = db.company_term_conditions

const Validator = require('validatorjs');

const addCompanyDetails = async (req, res) => {
    let validation = new Validator(req.body, {
        // unit_of_measurement: "string",
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        let { body: { company_details, company_terms } } = req
        const company = await Company_details.create(company_details)
        company_terms = company_terms.map(item => {
            item.company_id = company.id
            return item
        })
        await Company_terms.bulkCreate(company_terms)
        return RESPONSE.success(res, 1501)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}
const getCompanyDetails = async (req, res) => {
    let validation = new Validator(req.body, {
        // unit_of_measurement: "string",
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        // let { query: { for } } = req
        const company = await Company_details.findAll({
            include: [{
                model: Company_terms
            }]
        })

        return RESPONSE.success(res, 1502, company)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}
const updateCompanyDetails = async (req, res) => {
    // console.log("ewfcwem");
    let validation = new Validator(req.query, {
        id: "required",
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        let { query: { id }, body: { company_details, company_terms } } = req
        const company = await Company_details.update(company_details, {
            where: {
                id
            }
        })
        await Company_terms.destroy({
            where: {
                company_id: id
            }
        })
        company_terms = company_terms.map(item => {
            item.company_id = id
            return item
        })
        await Company_terms.bulkCreate(company_terms)

        return RESPONSE.success(res, 1503)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

module.exports = { addCompanyDetails, getCompanyDetails, updateCompanyDetails }