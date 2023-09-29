const db = require('../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const Item_data = db.item_data;
const unit_measurement = db.unit_measurement;
const Formula = db.formula;
const Formula_Material = db.formula_material;
const Godown_Area = db.godown_address;
const Storage_room = db.storage_room;
const Validator = require('validatorjs');

const addFormula = async (req, res) => {
    let validation = new Validator(req.body, {
        bill_of_material: "required",
        packing_of_material: "required",
        bom_name: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        let { user: { id: user_id }, body } = req;
        body.user_id = user_id;
        let { bom_name, finish_product_name, unit_of_measurement, batch_size, batch_prefix, bill_of_material, packing_of_material } = body;
        if (bill_of_material?.length < 1 || packing_of_material?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7207);
        }
        // Check UOM Id
        const findUOMId = await unit_measurement.findOne({
            where: {
                id: unit_of_measurement
            }
        })
        if (!findUOMId) {
            await trans.rollback();
            return RESPONSE.error(res, 8012)
        }
        // check Finish product name
        const findFinishProduct = await Item_data.findOne({
            where: {
                id: finish_product_name
            }
        })
        if (!findFinishProduct) {
            await trans.rollback();
            return RESPONSE.error(res, "Finish product not exist")
        }
        // Can"t repeated Bom Name
        const isBomname = await Formula.findOne({
            where: {
                bom_name: bom_name
            }
        })
        if (isBomname) {
            await trans.rollback();
            return RESPONSE.error(res, 7206)
        }
        // creating Formula
        const formula_data = await Formula.create({ bom_name, finish_product_name, unit_of_measurement, batch_size, batch_prefix, user_id }, { transaction: trans })

        const addInvoiceID = (arr) => {
            return arr.map(item => {
                item.formula_id = formula_data.id
                return item
            })
        }

        /*     Billing    */
        // Adding Billing Material
        bill_of_material = addInvoiceID(bill_of_material)
        //Creating Billing Material
        await Formula_Material.bulkCreate(bill_of_material, { transaction: trans })

        /*    Packing    */
        // Adding  Packing  Material
        packing_of_material = addInvoiceID(packing_of_material)
        //Creating  Packing  Material
        await Formula_Material.bulkCreate(packing_of_material, { transaction: trans })

        await trans.commit();
        return RESPONSE.success(res, 7201, { id: formula_data.id })
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

const getFormula = async (req, res) => {
    let validation = new Validator(req.query, {
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id, search } } = req;
        let conditionWhere = {};
        let conditionOffset = {};

        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit);
        const offset = (page - 1) * limit;

        // Search by Id 
        if (id) {
            conditionWhere.id = id;
        }
        // Offset condition
        if (limit && page) {
            conditionOffset.limit = limit;
            conditionOffset.offset = offset;
        }

        // Search By bom Name and item Name
        if (search) {
            conditionWhere = {
                [Op.or]: {
                    bom_name: {
                        [Op.like]: `%${search}%`
                    },
                    "$item_data.item_name$": {
                        [Op.like]: `%${search}%`
                    }

                }
            }
        }
        const formulaCount_datas = await Formula.findAndCountAll({

            where: conditionWhere,

            include: [
                // {
                //     model: unit_measurement,
                //     attributes: ['id', 'unit_of_measurement', 'uom_fullName', 'qty_deci_places'],
                // },
                {
                    model: Item_data,
                    attributes: [/*'id',*/ 'item_name'],
                    include: [
                        {
                            model: Godown_Area,
                            attributes: ['id', 'godown_name']
                        },
                        {
                            model: Storage_room,
                            include: [
                                {
                                    model: Storage_room,
                                    as: "rack_data"
                                }
                            ]
                            // attributes: ['id']
                        },
                    ]
                },
                {
                    model: Formula_Material,
                    as: 'bill_of_material',
                    required: false,
                    where: {
                        is_packing: false,
                    }
                    // include:[
                    //     {
                    //         model: Item_data,
                    //         as: 'material',
                    //         attributes: [/*'id',*/ 'item_name'],

                    //     },
                    // ]
                },
                {
                    model: Formula_Material,
                    as: 'packing_of_material',
                    required: false,
                    where: {
                        is_packing: true,
                    }
                    // include:[
                    //     {
                    //         model: Item_data,
                    //         as: 'material',
                    //         attributes: [/*'id',*/ 'item_name'],
                    //     },
                    // ]
                }

            ],
            // subQuery: false,
            order: [['createdAt', 'DESC']],
            ...conditionOffset,
            distinct: true,

        });
        // const formula_datas = await Formula.findAll({

        //     where: conditionWhere,

        //     include: [
        //         // {
        //         //     model: unit_measurement,
        //         //     attributes: ['id', 'unit_of_measurement', 'uom_fullName', 'qty_deci_places'],
        //         // },
        //         {
        //             model: Item_data,
        //             attributes: [/*'id',*/ 'item_name'],
        //         },
        //         {
        //             model: Formula_Material,
        //             as: 'bill_of_material',
        //             required: false,
        //             where: {
        //                 is_packing: false,
        //             }
        //             // include:[
        //             //     {
        //             //         model: Item_data,
        //             //         as: 'material',
        //             //         attributes: [/*'id',*/ 'item_name'],

        //             //     },
        //             // ]
        //         },
        //         {
        //             model: Formula_Material,
        //             as: 'packing_of_material',
        //             required: false,
        //             where: {
        //                 is_packing: true,
        //             }
        //             // include:[
        //             //     {
        //             //         model: Item_data,
        //             //         as: 'material',
        //             //         attributes: [/*'id',*/ 'item_name'],
        //             //     },
        //             // ]
        //         }
        //     ],
        //     order: [['createdAt', 'DESC']],

        // });
        
        if (id) {
            return RESPONSE.success(res, 7202, formulaCount_datas.rows);
        }

        let responseData = {
            chatData: formulaCount_datas.rows,
            page_information: {
                totalrecords: formulaCount_datas.count,
                lastpage: Math.ceil(formulaCount_datas.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(formulaCount_datas.count / limit) ? page + 1 : 0
            }
        };

        return RESPONSE.success(res, 7202, responseData);
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

const updateFormula = async (req, res) => {
    let validation = new Validator(req.query, {
        id: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        const { query: { id }, body } = req
        let { bom_name, finish_product_name, unit_of_measurement, batch_size, batch_prefix, bill_of_material, packing_of_material } = body;
        if (bill_of_material?.length < 1 || packing_of_material?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7207);
        }
        const formula_Data = await Formula.findOne({
            where: { id: id },
            include: [
                // {
                //     model: unit_measurement,
                //     attributes: ['id', 'unit_of_measurement', 'uom_fullName', 'qty_deci_places'],
                // },
                {
                    model: Item_data,
                    attributes: [/*'id',*/ 'item_name'],
                },
                {
                    model: Formula_Material,
                    as: 'bill_of_material',
                    required: false,
                    where: {
                        is_packing: false,
                    }
                },
                {
                    model: Formula_Material,
                    as: 'packing_of_material',
                    required: false,
                    where: {
                        is_packing: true,
                    }
                }

            ],
        })
        if (!formula_Data) {
            await trans.rollback();
            return RESPONSE.error(res, 7205)
        }
        let bill_of_material_ids = formula_Data.bill_of_material.map(item => item.id)
        let packing_of_material_ids = formula_Data.packing_of_material.map(item => item.id)
        // Check UOM Id
        const findUOMId = await unit_measurement.findOne({
            where: {
                id: unit_of_measurement
            }
        })
        if (!findUOMId) {
            await trans.rollback();
            return RESPONSE.error(res, 8012)
        }
        // check Finish product name
        const findFinishProduct = await Item_data.findOne({
            where: {
                id: finish_product_name
            }
        })
        if (!findFinishProduct) {
            await trans.rollback();
            return RESPONSE.error(res, "Finish product not exist")
        }
        // Can"t repeated Bom Name
        const isBomname = await Formula.findOne({
            where: {
                bom_name: bom_name,
                id: {
                    [Op.not]: id,
                },
            }
        })
        if (isBomname) {
            await trans.rollback();
            return RESPONSE.error(res, 7206)
        }
        await formula_Data.update({ bom_name, finish_product_name, unit_of_measurement, batch_size, batch_prefix }, { transaction: trans })
        const updatedata = async (model, updatedata, olddata) => {
            let ids = []
            for (let i of updatedata) {
                if (i.id) {
                    ids.push(i.id)
                    let updateId = i.id
                    delete i.id
                    // delete i.customer_id
                    await model.update(i, { where: { id: updateId }, transaction: trans })
                } else {
                    // creating new data 
                    await model.create({ ...i, formula_id: formula_Data.id }, { transaction: trans })
                }
            }
            // let totalIds = order.sale_purchase_items.map(item => item.id)
            // let itemIds = items.map(item => item.id)
            let remaningIds = olddata.filter(item => !ids.includes(item))
            if (remaningIds.length) {
                await model.destroy({ where: { formula_id: formula_Data.id, id: { [Op.in]: remaningIds } }, transaction: trans })
            }
        }
        // updateing Billing Material
        await updatedata(Formula_Material, bill_of_material,bill_of_material_ids)
        // updateing Packing Material
        await updatedata(Formula_Material, packing_of_material,packing_of_material_ids)

        await trans.commit();
        return RESPONSE.success(res, 7203);
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

const deleteFormula = async (req, res) => {
    let validation = new Validator(req.query, {
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        const { query: { id } } = req

        const formula_Data = await Formula.findOne({
            where: { id }
        })
        if (!formula_Data) {
            await trans.rollback();
            return RESPONSE.error(res, 7205)
        }
        await formula_Data.destroy({ transaction: trans })
        await Formula_Material.destroy({ where: { formula_id: id }, transaction: trans })

        await trans.commit();
        return RESPONSE.success(res, 7204);
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}
module.exports = {
    addFormula,
    getFormula,
    updateFormula,
    deleteFormula
}