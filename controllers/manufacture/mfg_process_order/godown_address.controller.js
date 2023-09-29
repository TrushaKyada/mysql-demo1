const db = require('../../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const GoDown_Address = db.godown_address
const Item_data = db.item_data;
const unit_measurement = db.unit_measurement;
const Formula = db.formula;
const Formula_Material = db.formula_material
const Validator = require('validatorjs')

//Create Godown Address
const addGodownAddress = async (req, res) => {
    let validation = new Validator(req.body, {
        address_type: "required|in:All,Godown,Manufacture",
        enter_country: "required",
        postal_code: "required",
        state: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body } = req

        const GodownAddress = await GoDown_Address.create(body)

        return RESPONSE.success(res, "Godown Created Successfully", { id: GodownAddress.id });

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

//Get Godown Address
const getGodownAddress = async (req, res) => {
    let validation = new Validator(req.body, {
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id, search } } = req;
        let conditionWhere = {}
        let conditionOffset = {};
        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit);
        const offset = (page - 1) * limit;
        // Offset condition
        if (limit && page) {
            conditionOffset.limit = limit;
            conditionOffset.offset = offset;
        }
        // Search By Id
        if (id) {
            conditionWhere.id = id
        }
        if (search) {
            conditionWhere = {
                [Op.or]: {
                    address_type: {
                        [Op.like]: `%${search}%`
                    },
                    godown_name: {
                        [Op.like]: `%${search}%`
                    }

                }
            }
        }
        const GodownAddressCount = await GoDown_Address.findAndCountAll({
            where: conditionWhere,
            order: [['createdAt', 'DESC']],
            ...conditionOffset,
            // subQuery: false, 
            distinct: true,
        })

        // const GodownAddress = await GoDown_Address.findAll({
        //     where: conditionWhere,
        //     order: [['createdAt', 'DESC']],
        //     // subQuery: false,
        // })

        if (id) {
            return RESPONSE.success(res, 7302, GodownAddressCount.rows);
        }
        let responseData = {
            chatData: GodownAddressCount.rows,
            page_information: {
                totalrecords: GodownAddressCount.count,
                lastpage: Math.ceil(GodownAddressCount.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(GodownAddressCount.count / limit) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, 7302, responseData);

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

// Update Godown Address
const editGodownAddress = async (req, res) => {
    let validation = new Validator(req.body, {
        address_type: "required|in:All,Godown,Manufacture"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id }, body } = req

        const GodownAddress = await GoDown_Address.findOne({ where: { id: id } })
        if (!GodownAddress) {
            return RESPONSE.error(res, 7305)
        }
        await GodownAddress.update(body)

        return RESPONSE.success(res, 7303, { id: GodownAddress.id });

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

// Delete Godown Address
const deleteGodownAddress = async (req, res) => {
    let validation = new Validator(req.query, {
        id: "required",
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id } } = req

        const GodownAddress = await GoDown_Address.findOne({ where: { id: id } })
        if (!GodownAddress) {
            return RESPONSE.error(res, 7305)
        }
        await GodownAddress.destroy()
        return RESPONSE.success(res, 7304);

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

module.exports = {
    addGodownAddress,
    getGodownAddress,
    editGodownAddress,
    deleteGodownAddress
}