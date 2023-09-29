const db = require('../../../config/db.config')

//model
const { Sequelize, Op } = require('sequelize');
const Validator = require('validatorjs');
const Transporter_Details = db.transporter_details

// Add Transporter Details
const addTransporterDetails = async (req, res) => {
    let validation = new Validator(req.body, {
        transfer_name: "required",
        transfer_address: "required",
        mobile_number: "required",
        gst: "required"
        // is_enable:"reqiured|in:Sale,Purchase,Both"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        const { transfer_name, transfer_address, mobile_number, gst } = req.body
        if (await Transporter_Details.isExistField('mobile_number', mobile_number)) {
            return RESPONSE.error(res, 7909)
        }
        const transporter_Details = await Transporter_Details.create({
            transfer_name, transfer_address, mobile_number, gst
        })
        await trans.commit();
        return RESPONSE.success(res, 7907, transporter_Details)
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

//get all Transporter Details
const getTransporterDetails = async (req, res) => {
    try {
        const { id } = req.query
        let conditionWhere = {}

        if (id) {
            conditionWhere.id = id
        }
        const transaction_details_list = await Transporter_Details.findAll({
            where: conditionWhere,
            order: [['createdAt', 'DESC']],
            distinct: true,
        })
        if (id) {
            return RESPONSE.success(res, 7911, transaction_details_list);
        }
        return RESPONSE.success(res, 7911, transaction_details_list);
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}


//delete Transporter Details
const deleteTransporterDetails = async (req, res) => {
    let validation = new Validator(req.query, {
        id: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        const { query: { id } } = req

        const transaction_details = await Transporter_Details.findOne({
            where: { id }
        })
        if (!transaction_details) {
            await trans.rollback();
            return RESPONSE.error(res, 7910)
        }
        await transaction_details.destroy({ transaction: trans })

        await trans.commit();
        return RESPONSE.success(res, 7912)
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

//edit Transporter Details
const updateTransporterDetails = async (req, res) => {
    let validation = new Validator(req.query, {
        id: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }

    const trans = await db.sequelize.transaction();
    try {
        let { query: { id }, body: { transfer_name, transfer_address, mobile_number, gst } } = req
        const transaction_details = await Transporter_Details.findOne({
            where: { id }
        })
        const transaction_mobile_number = await Transporter_Details.findOne({
            where: { mobile_number }
        })
        if(transaction_mobile_number){

            if(transaction_mobile_number.id === transaction_details.id){
                const transporter_Details = await Transporter_Details.update({
                    transfer_name, transfer_address, mobile_number, gst
                }, {
                    where: {
                        id
                    }
                })
                await trans.commit();
                return RESPONSE.success(res, 7913)
            }
            else{
                return RESPONSE.error(res, 7914)
            }
        }
        else{
            const transporter_Details = await Transporter_Details.update({
                transfer_name, transfer_address, mobile_number, gst
            }, {
                where: {
                    id
                }
            })
            await trans.commit();
            return RESPONSE.success(res, 7913)
        }
               
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

module.exports = {
    addTransporterDetails,
    getTransporterDetails,
    deleteTransporterDetails,
    updateTransporterDetails
}