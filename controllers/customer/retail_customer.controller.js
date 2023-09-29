const db = require('../../config/db.config')
const { Op } = db.Sequelize

const RetailCustomer = db.retail_customer
const Validator = require('validatorjs')

const addCustomer = async (req, res) => {
    let validation = new Validator(req.body, {
        retailer_name: 'required',
        person_name: 'required',
        retailer_address: 'required',
        retailer_phone: 'required',
        retailer_city: 'required',
        distributor_id: 'required',

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { id: user_id } = req.user
        const { retailer_name, retailer_phone } = req.body
        const isRetailCustomer = await RetailCustomer.findOne({
            where: {
                [Op.or]: [{ retailer_name }, { retailer_phone }]
            }
        })

        if (isRetailCustomer) {
            return RESPONSE.error(res, 5007)
        }

        req.body.user_id = user_id
        const retail_customer = await RetailCustomer.create(req.body)
        return RESPONSE.success(res, 5001)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}
const allCustomer = async (req, res) => {
    try {
        const { city, distributor } = req.query
        let searchObj = {}
        if (distributor) {
            searchObj.distributor_id = distributor
        }
        if (city) {
            searchObj.retailer_city = city
        }
        const allRetailCustomer = await RetailCustomer.findAll({
            where: searchObj,
            attributes: { exclude: ['isVerified', 'createdAt', 'updatedAt', 'user_id'] }
        })
        if (allRetailCustomer < 1) {
            return RESPONSE.success(res, 5003)
        }
        return RESPONSE.success(res, 5002, allRetailCustomer)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

module.exports = { addCustomer, allCustomer }