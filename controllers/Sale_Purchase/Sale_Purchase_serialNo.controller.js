const db = require('../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const SerialNo_data = db.Sale_Purchase_serialNo
const Validator = require('validatorjs');

// Add serial Number
const addSerialNo = async (req, res) => {
    let validation = new Validator(req.body, {
        reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt,Manufacturer Order Number,Voucher Number,Purchase Return,Sales Return,Shipment",
        number_length: "required",
        start: "required",

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body: { reference_type, start, number_length, prefix } } = req;

        // Match start length and pad_zeros value
        if (start.length !== Number(number_length)) {
            return RESPONSE.error(res, 8207);
        }

        // Start Value can't not repeat for same reference_type
        const existingSerialNoData = await SerialNo_data.findOne({
            where: {
                prefix: prefix,
                // start: start,
                reference_type: reference_type
            }
        });
        if (existingSerialNoData) {
            return RESPONSE.error(res, 8206);
        }
        const SerialNoData = await SerialNo_data.create({ reference_type, start, number_length, prefix, last_number: start });
        return RESPONSE.success(res, 8201, SerialNoData);

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

// Get serial Number
const getSerialNo = async (req, res) => {
    let validation = new Validator(req.query, {
        reference_type: "in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt,Manufacturer Order Number,Voucher Number,Purchase Return,Sales Return,Shipment"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id, reference_type } } = req;

        let conditionWhere = {};
        let conditionOffset = {};

        // Pagination
        const page = Number(req.query.page) || 0;
        const limit = Number(req.query.limit);
        const offset = (page - 1) * limit;

        // Filter by reference_type
        if (reference_type) {
            conditionWhere.reference_type = reference_type
        }

        // Search by Id 
        if (id) {
            conditionWhere.id = id;
        }

        // Offset condition
        if (limit && page) {
            conditionOffset.limit = limit;
            conditionOffset.offset = offset;
        }
        const serialnumberdata = await SerialNo_data.findAll({
            where: conditionWhere,
            ...conditionOffset
        });
        // if (serialnumberdata.length === 0) {
        //     return RESPONSE.error(res, 8003, 404);
        // }
        if (id) {
            return RESPONSE.success(res, 8203, serialnumberdata.rows);
        }

        // let Data = {
        //     chatData: serialnumberdata.rows,
        //     page_information: {
        //         totalrecords: serialnumberdata.count,
        //         lastpage: Math.ceil(serialnumberdata.count / limit),
        //         currentpage: page,
        //         previouspage: 0 + page,
        //         nextpage: page < Math.ceil(serialnumberdata.count / limit) ? page + 1 : 0
        //     }
        // };

        return RESPONSE.success(res, serialnumberdata.length ? 8203 : 8003, serialnumberdata);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// update  serial Number
const updateSerialNo = async (req, res) => {
    let validation = new Validator(req.body, {
        reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt ,Manufacturer Order Number,Voucher Number,Purchase Return,Sales Return,Shipment",
        // id: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body: { reference_type, start, number_length, prefix, last_number }, query: { id } } = req

        // Match start length and pad_zeros value
        if (start.length !== parseInt(number_length)) {
            return RESPONSE.error(res, 8207);
        }

        // Start Value can't not repeat for same reference_type
        const existingSerialNoData = await SerialNo_data.findOne({
            where: {
                reference_type: reference_type,
                start: start,
                id: {
                    [Op.not]: id,
                },
            }
        });
        if (existingSerialNoData) {
            return RESPONSE.error(res, 8206);
        }

        const SerialNo_datas = await SerialNo_data.findOne({ where: { id } })

        if (!SerialNo_datas) {
            return RESPONSE.error(res, 8003, 404)
        }

        // update
        await SerialNo_datas.update({ reference_type, start, number_length, prefix, last_number })

        return RESPONSE.success(res, 8204)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// Delete  serial Number
const deleteSerialNo = async (req, res) => {
    try {
        const { query: { id } } = req

        const SerialNo_datas = await SerialNo_data.findOne({ where: { id } })

        if (!SerialNo_datas) {
            return RESPONSE.error(res, 8003, 404)
        }

        // Delete
        await SerialNo_datas.destroy()

        return RESPONSE.success(res, 8205)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}
module.exports = {
    addSerialNo,
    getSerialNo,
    updateSerialNo,
    deleteSerialNo
}