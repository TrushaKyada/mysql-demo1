const db = require('../config/db.config')
const { Op } = db.Sequelize

// model
const universal_property = db.universal_property;

const Validator = require('validatorjs');


// Add Universal property
const addUniversalProperty = async (req, res) => {
    let validation = new Validator(req.body, {
        unit_of_measurement: "string",
        uom_fullName: "string",
        qty_deci_places: "integer",
        stock_category: "string",
        parent_category: "string"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {

        let { unit_of_measurement, qty_deci_places, uom_fullName, parent_category, stock_category } = req.body

        // For Unit of Measurment
        if (unit_of_measurement) {
            let unitMeasurement = await universal_property.findOne({
                where: {
                    unit_of_measurement,
                }
            })
            if (unitMeasurement) {
                return RESPONSE.error(res, 8001)
            }
        }
        // For Stock category
        if (stock_category && parent_category) {
            const parentCategory = ['Raw Material', 'Finished Goods'];
            if (!parentCategory.includes(parent_category)) {
                return RESPONSE.error(res, 8006)
            }
            const findCategory = await universal_property.findOne({
                where: {
                    stock_category,
                    parent_category,
                }
            })
            if (findCategory) {
                return RESPONSE.error(res, 8001)
            }
        }

        const property = await universal_property.create({ unit_of_measurement, uom_fullName, qty_deci_places, stock_category, parent_category })

        return RESPONSE.success(res, 8002, property)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}




// Get Universal property
const getUniversalProperty = async (req, res) => {
    try {
        const { query: { unit, category } } = req

        if ((!unit && !category) || (unit && category)) {
            return RESPONSE.error(res, 8005)
        }
        const conditionObj = {}
        const attrArr = ['id']
        // For 
        if (unit == 1) {
            conditionObj.unit_of_measurement = {
                [Op.ne]: null
            }
            attrArr.push('unit_of_measurement', 'uom_fullName', 'qty_deci_places')
        }
        if (category == 1) {
            conditionObj.parent_category = {
                [Op.ne]: null
            }
            attrArr.push('stock_category', 'parent_category')
        }

        const universalProperty = await universal_property.findAll({
            where: conditionObj,
            attributes: attrArr
        })
        if (!universalProperty || universalProperty.length === 0) {
            return RESPONSE.error(res, 8003, 404);
        }

        return RESPONSE.success(res, 8004, universalProperty);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}


const editUniversalProperty = async(req,res) => {
   
    try {
        const {  query: { id },body:{unit_of_measurement,parent_category,stock_category,qty_deci_places,uom_fullName}} = req
       
        const univarsalData = await universal_property.findOne({ where: { id } })

        if (!univarsalData) {
            return RESPONSE.error(res, 8003, 404)
        }
        
             // For Unit of Measurment
             if (unit_of_measurement) {
                let unitMeasurement = await universal_property.findOne({
                    where: {
                        unit_of_measurement,
                    }
                })
                if (unitMeasurement) {
                    return RESPONSE.error(res, 8001)
                }
            }
            // For Stock category
            // if (stock_category && parent_category) {
            //     // const parentCategory = ['Raw Material', 'Finished Goods'];
            //     // if (!parentCategory.includes(parent_category)) {
            //     //     return RESPONSE.error(res, 8006)
            //     // }
            //     const findCategory = await universal_property.findOne({
            //         where: {
            //             stock_category,
            //            parent_category, 
            //         }
            //     })
            //     if (findCategory) {
            //         return RESPONSE.error(res, 8001)
            //     }
            // }
        // update
        await universal_property.update({unit_of_measurement,parent_category,stock_category,qty_deci_places,uom_fullName},{ where: { id } })

        return RESPONSE.success(res, 8007)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}


const deleteUniversal = async(req,res) => {
    try {
        const {  query: { id }} = req
       
        const universalData = await universal_property.findOne({ where: { id } })

        if (!universalData) {
            return RESPONSE.error(res, 8003, 404)
        }

        // update
        await universalData.destroy()

        return RESPONSE.success(res, 8008)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

module.exports = {
    addUniversalProperty,
    getUniversalProperty,
    editUniversalProperty,
    deleteUniversal
}