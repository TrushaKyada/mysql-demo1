const { Op } = require('sequelize')
const db = require('../../config/db.config')
const Customer_address = db.customer_address
const Customer = db.customer_details
const Validator = require('validatorjs')

const addAddress = async (req, res) => {
    let validation = new Validator(req.body, {
        customer_id: "required",
        type_of_address: "required",
        country: "required",
        state: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body } = req
        // const typeaddress = body.type_of_address
        const customerdata = await Customer.findOne({
            where: { id: body.customer_id },
        })
        if (!customerdata) {
            return RESPONSE.error(res, 8311, 404);
        }
        const customerAddressData = await Customer_address.create(body/*,{type_of_address:typeaddress }*/)

        return RESPONSE.success(res, 8401, customerAddressData);

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

module.exports = {
    addAddress
}