const db = require('../../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const item_data = db.item_data
const Godown_Area = db.godown_address
const Storage_room = db.storage_room
const Ready_To_delivery = db.ready_to_deliver
const Delivery_Items = db.delivery_item
const SerialNo_data = db.Sale_Purchase_serialNo
const Validator = require('validatorjs')


const addReadyToDelivery = async (req, res) => {
    let validation = new Validator(req.body, {
        voucher_number: "required",
        godown_area: "required",
        // material_location:"required",

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        let { body: { voucher_number, serial_number, godown_area, delivery_item/*material_name, quantity, material_location*/
        } } = req
        if (delivery_item?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7601);
        };
        // Check Godown
        const findGodownName = await Godown_Area.findOne({
            where: { id: godown_area }
        })
        if (!findGodownName) {
            await trans.rollback()
            return RESPONSE.error(res, 7305)
        }
        // Check Voucher Number
        const findvoucherNo = await SerialNo_data.findOne({
            where: {
                id: voucher_number
            }
        })
        if (!findvoucherNo) {
            await trans.rollback()
            return RESPONSE.error(res, 7609)
        }
        let DeliveryName = delivery_item.map(i => i.item_name)
        // Check Item Name
        const findMaterialName = await item_data.findOne({
            where: { id: { [Op.in]: DeliveryName } }
        })
        if (!findMaterialName) {
            await trans.rollback()
            return RESPONSE.error(res, 7602)
        }
        //can"t repeat serial_number same voucher_number
        const duplicateSerialNumber = await Ready_To_delivery.findOne({
            where: {
                voucher_number: voucher_number,
                serial_number: serial_number
            }
        });

        if (duplicateSerialNumber) {
            await trans.rollback()
            return RESPONSE.error(res, 8209);
        }

        const ReadyToDelivery = await Ready_To_delivery.create({ voucher_number, serial_number, godown_area }, { transaction: trans })
        // Update last_number field
        const serialNumberParts = ReadyToDelivery.serial_number.split('-')[1];
        const numericPart = parseInt(serialNumberParts);
        if (isNaN(numericPart)) {
            await trans.rollback()
            return RESPONSE.error(res, 8210);
        }

        const updatedSerialNumber = await SerialNo_data.update(
            { last_number: numericPart },
            {
                where: { id: findvoucherNo.id },
                transaction: trans
            }
        );
        if (!updatedSerialNumber) {
            await trans.rollback()
            return RESPONSE.error(res, 8208);
        }
        const addInvoiceID = (arr) => {
            return arr.map(item => {
                item.ready_delivery_id = ReadyToDelivery.id
                return item
            })
        }
        delivery_item = addInvoiceID(delivery_item)
        await Delivery_Items.bulkCreate(delivery_item, { transaction: trans })

        await trans.commit()
        return RESPONSE.success(res, 7604, { id: ReadyToDelivery.id })
    } catch (error) {
        await trans.rollback()
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

const getReadyToDelivery = async (req, res) => {
    try {
        const { query: { id, search } } = req
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
        if (id) {
            conditionWhere.id = id
        }
        // Search By 
        if (search) {
            conditionWhere = {
                [Op.or]: {
                    "$godown_address.godown_name$": {
                        [Op.like]: `%${search}%`
                    },
                    serial_number: {
                        [Op.like]: `%${search}%`
                    }
                }
            }
        }

        const ReadyToDelivery = await Ready_To_delivery.findAndCountAll({
            where: conditionWhere,
            include: [
                {
                    model: Godown_Area,

                },
                {
                    model: Delivery_Items,
                    include: [
                        {
                            model: item_data,
                            as: "Delivery_Item",
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
                        
                    ]

                },
                {
                    model: SerialNo_data
                },
            ],

            order: [['createdAt', 'DESC']],
            ...conditionOffset,
            distinct: true,

        })
        
        if (id) {
            return RESPONSE.success(res, 7605, FUNCTIONS.transformData(ReadyToDelivery.rows))
        }

        let responseData = {
            chatData: ReadyToDelivery.rows,
            page_information: {
                totalrecords: ReadyToDelivery.count,
                lastpage: Math.ceil(ReadyToDelivery.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(ReadyToDelivery.count / limit) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, 7605, FUNCTIONS.transformData(responseData))

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};
const editReadyToDelivery = async (req, res) => {
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
        let { godown_area, delivery_item } = body;

        if (delivery_item?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7601);
        };
        // Check Godown
        const findGodownName = await Godown_Area.findOne({
            where: { id: godown_area }
        })
        if (!findGodownName) {
            await trans.rollback()
            return RESPONSE.error(res, 7305)
        }
        let DeliveryName = delivery_item.map(i => i.item_name)
        // Check Item Name
        const findItemName = await item_data.findOne({
            where: { id: { [Op.in]: DeliveryName } }
        })
        if (!findItemName) {
            await trans.rollback()
            return RESPONSE.error(res, 7602)
        }
        const ReadyDeliveryData = await Ready_To_delivery.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Delivery_Items,

                }
            ]
        })
        if (!ReadyDeliveryData) {
            await trans.rollback()
            return RESPONSE.error(res, 7606)
        }

        // // can't not repeat voucher name
        // const checkVouchername = await Ready_To_delivery.findOne({
        //     where: {
        //         voucher_number: voucher_number,
        //         id: { [Op.not]: id }
        //     }
        // })
        // if (checkVouchername) {
        //     return RESPONSE.error(res, 7603)
        // }
        const delivery_item_Ids = ReadyDeliveryData.inventory_delivery_items.map(item => item.id)
        await ReadyDeliveryData.update({ voucher_number, godown_area }, { transaction: trans })

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
                    await model.create({ ...i, ready_delivery_id: ReadyDeliveryData.id }, { transaction: trans })
                }
            }
            // let totalIds = order.sale_purchase_items.map(item => item.id)
            // let itemIds = items.map(item => item.id)
            let remaningIds = olddata.filter(item => !ids.includes(item))
            if (remaningIds.length) {
                await model.destroy({ where: { ready_delivery_id: ReadyDeliveryData.id, id: { [Op.in]: remaningIds } }, transaction: trans })
            }
        }
        // updateing Material Item
        await updatedata(Delivery_Items, delivery_item, delivery_item_Ids);
        await trans.commit();
        return RESPONSE.success(res, 7607, { id: ReadyDeliveryData.id })
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

const deleteReadyToDelivery = async (req, res) => {
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

        const DeliveryData = await Ready_To_delivery.findOne({
            where: { id }
        })
        if (!DeliveryData) {
            await trans.rollback();
            return RESPONSE.error(res, 7606)
        }
        await DeliveryData.destroy({ transaction: trans })
        await Delivery_Items.destroy({ where: { ready_delivery_id: id }, transaction: trans })

        await trans.commit();
        return RESPONSE.success(res, 7608);
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

module.exports = {
    addReadyToDelivery,
    getReadyToDelivery,
    editReadyToDelivery,
    deleteReadyToDelivery
}