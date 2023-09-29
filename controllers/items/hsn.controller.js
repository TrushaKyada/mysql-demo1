const db = require('../../config/db.config')
const Hsn = db.hsn_data;
const { Sequelize, Op } = require('sequelize');
const Validator = require('validatorjs')


// Create HSN data

const addHsn = async (req, res) => {
    let validation = new Validator(req.body, {
        hsn_code: 'integer',

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {

        const { hsn_description, hsn_code } = req.body


        const findData = await Hsn.findOne({
            where: {
                hsn_code
            }
        })
        if (findData) {
            return RESPONSE.error(res, 8083)
        }


        const hsnData = await Hsn.create({ hsn_code, hsn_description });

        return RESPONSE.success(res, 8081, hsnData)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}


// get HSN Data
const getHsn = async (req, res) => {
    try {
        // const { query: { hsn_code } } = req;
        // let conditionWhere = {};

        // // Search by HSN_CODE 
        // if (hsn_code) {
        //     conditionWhere.hsn_code = hsn_code;
        // }

        const hsndata = await Hsn.findAll({
            attributes: ['id', 'hsn_code', 'hsn_description'],
        })

        // if (!hsndata.length) {
        //     return RESPONSE.error(res, 8085, 404);
        // }

        return RESPONSE.success(res,hsndata.length ?  8082 :8085, hsndata);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// Update HSN
const editHsn = async (req, res) => {
    let validation = new Validator(req.body, {
        hsn_code: 'integer',

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id }, body: { hsn_code, hsn_description } } = req

        // Find id
        const hsnData = await Hsn.findOne({ where: { id } })

        if (!hsnData) {
            return RESPONSE.error(res, 8085, 404)
        }

        // Find by Hsn_code
        const hsnDataCode = await Hsn.findOne({
            where: {
                hsn_code, 
                id: {
                    [Op.not]: id,
                },
            }
        })

        if (hsnDataCode) {
            return RESPONSE.error(res, 8088, 404)
        }

        // update
        await Hsn.update({ hsn_code, hsn_description }, { where: { id } })

        return RESPONSE.success(res, 8086)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// Delete Hsn
const deleteHsn = async (req, res) => {
    try {
        const { query: { id } } = req

        const hsnData = await Hsn.findOne({ where: { id } })

        if (!hsnData) {
            return RESPONSE.error(res, 8085, 404)
        }

        // update
        await hsnData.destroy()

        return RESPONSE.success(res, 8087)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}
module.exports = {
    addHsn,
    getHsn,
    editHsn,
    deleteHsn
}