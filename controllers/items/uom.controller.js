const db = require('../../config/db.config')
const { Sequelize, Op } = require('sequelize');

// model
const unit_measurement = db.unit_measurement;

const Validator = require('validatorjs');


// Add unit measurment
const addUnitOfMesurement = async (req, res) => {
    let validation = new Validator(req.body, {
        unit_of_measurement: "string",
        uom_fullName: "string",
        qty_deci_places: "integer"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {

        let { unit_of_measurement, qty_deci_places, uom_fullName } = req.body

        // For Unit of Measurment
        if (unit_of_measurement) {
            let unitMeasurement = await unit_measurement.findOne({
                where: {
                    unit_of_measurement,
                }
            })
            if (unitMeasurement) {
                return RESPONSE.error(res, 8001)
            }
        }


        const property = await unit_measurement.create({ unit_of_measurement, uom_fullName, qty_deci_places })

        return RESPONSE.success(res, 8002, property)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}


// Get Universal property
const getUnitOfMesurement = async (req, res) => {
    try {
        const universalProperty = await unit_measurement.findAll({
            attributes: ['id', 'unit_of_measurement', 'uom_fullName', 'qty_deci_places']
        })
        // if (!universalProperty.length ) {
        //     return RESPONSE.error(res, 8003, 404);
        // }

        return RESPONSE.success(res, universalProperty.length ? 8004 : 8003, universalProperty);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// Update Universal property
const editUnitOfMesurement = async (req, res) => {

    try {
        const { query: { id }, body: { unit_of_measurement, qty_deci_places, uom_fullName } } = req

        const uomData = await unit_measurement.findOne({ where: { id } })

        if (!uomData) {
            return RESPONSE.error(res, 8003, 404)
        }

        // For Unit of Measurment
        if (unit_of_measurement) {
            let unitMeasurement = await unit_measurement.findOne({
                where: {
                    unit_of_measurement,
                    id: {
                        [Op.not]: id,
                    },
                }
            })
            if (unitMeasurement) {
                return RESPONSE.error(res, 8001)
            }
        }
        // update
        await unit_measurement.update({ unit_of_measurement, qty_deci_places, uom_fullName }, { where: { id } })

        return RESPONSE.success(res, 8007)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// Delete Universal property
const deleteUnitOfMesurement = async (req, res) => {
    try {
        const { query: { id } } = req

        const uomData = await unit_measurement.findOne({ where: { id } })

        if (!uomData) {
            return RESPONSE.error(res, 8003, 404)
        }

        // update
        await uomData.destroy()

        return RESPONSE.success(res, 8008)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}



module.exports = {
    addUnitOfMesurement,
    getUnitOfMesurement,
    editUnitOfMesurement,
    deleteUnitOfMesurement
}