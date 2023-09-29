const db = require('../../config/db.config')
const { Sequelize, Op } = require('sequelize')
const Validator = require("validatorjs");

const dispatch_items = db.item_receive_data
const dispatch_item_receives = db.items_receive_voucher
const Storage_room = db.storage_room
const Item_data = db.item_data;
const Ready_to_Deliver = db.ready_to_deliver
const Godown_Name = db.godown_address
const addItemsReceive = async (req, res) => {
    let { voucher_id, godown_name, receive_item } = req.body
    let validation = new Validator(req.body, {
        voucher_id: 'required',
        godown_name: 'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }

   
    const t = await db.sequelize.transaction();
    try {

        if (receive_item?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7902);
        };
        // Check voucher 
        const findVoucherId = await Ready_to_Deliver.findOne({
            where: { id: voucher_id }
        })
        if (!findVoucherId) {
            await trans.rollback()
            return RESPONSE.error(res, 7609)
        }
        // Check Godown
        const findGodownName = await Godown_Name.findOne({
            where: { id: godown_name }
        })
        if (!findGodownName) {
            await trans.rollback()
            return RESPONSE.error(res, 7305)
        }
        for (let i of receive_item) {
            const item_name = await Item_data.findOne({
                where: { id: i.item_name }
            })
            if (!item_name) {
                await trans.rollback()
                return RESPONSE.error(res, 7904)
            }
            const storageRoom = await Storage_room.findOne({
                where: { id: i.item_name }
            })
            if (!storageRoom) {
                await trans.rollback()
                return RESPONSE.error(res, 7904)
            }

            // await Item_data.increment('unit_quantity', { by: transfer_quantity, where: { id: item_name.id }, transaction: t })
        }
        const DispatchItemsReceive = await dispatch_item_receives.create({ voucher_id, godown_name }, { transaction: t })

        const addInvoiceID = (arr) => {
            return arr.map(item => {
                item.dispatch_item_receives_id = DispatchItemsReceive.id
                return item
            })
        }
        receive_item = addInvoiceID(receive_item)
        await dispatch_items.bulkCreate(receive_item, { transaction: t })

        await t.commit()
        return RESPONSE.success(res, 7901)

    } catch (error) {
        await t.rollback();
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}
//get dispatch receive items
const getDispatchReceive = async (req, res) => {
    try {
        const { search, id } = req.query
        let conditionWhere = {}
        let conditionOffset = {};
        let conditioWhereForSearch = {}
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
        if (search) {
            conditioWhereForSearch = {
                serial_number: {
                    [Op.like]: `%${search}%`
                },
            }
            
            const voucherIds = await Ready_to_Deliver.findAll({ where: conditioWhereForSearch, attributes: ["id"] })
            const DispatchItemsReceiveList = []
            for (let voucherId of voucherIds) {
                conditionWhere.voucher_id = voucherId.id
                
                const dispatchItemsReceiveList = await dispatch_item_receives.findAndCountAll({
                    where: conditionWhere,
                    include: [
                        {
                            model: dispatch_items,
                            as: "Receive_Item",
                            include: [
                                {
                                    model: Item_data,
                                    attributes: ['id', "item_name"]
        
                                },
                                {
                                    model: Storage_room,
                                    as: "Item_location",
                                    attributes: ['id', 'room_id', 'rack_number', 'is_available'],
                                    include: [
                                        {
                                            model: Storage_room,
                                            as: "rack_data",
                                            attributes: ['id', 'godown_id', 'room_number', 'is_available'],
                                        }
                                    ]
                                }
        
                            ]
                            
        
                        },
                        {
                            model: Ready_to_Deliver,
                            as: "Voucher_number",
                            attributes: ["id", 'serial_number']
                        },
                        {
                            model: Godown_Name,
                            attributes: ["godown_name", "id"]
                        }
                    ],
                    order: [['createdAt', 'DESC']],
                    ...conditionOffset,
                    distinct: true,
                })
                DispatchItemsReceiveList.push(...dispatchItemsReceiveList.rows)
            }
            let responseData = {
                chatData: DispatchItemsReceiveList,
                page_information: {
                    totalrecords: DispatchItemsReceiveList.count,
                    lastpage: Math.ceil(DispatchItemsReceiveList.count / limit),
                    currentpage: page,
                    previouspage: 0 + (page - 1),
                    nextpage: page < Math.ceil(DispatchItemsReceiveList.count / limit) ? page + 1 : 0
                }
            };
            return RESPONSE.success(res, 7905, responseData);
        }
        // const DispatchItemsReceiveList = await dispatch_items.findAndCountAll({
        //     where: conditionWhere,
        //     include: [
        //         {
        //             model: dispatch_item_receives,
        //             as: "Receive_item",
        //             include: [
        //                 {
        //                     model: Ready_to_Deliver,
        //                     attributes: ["id", ['serial_number', 'voucher_number']]
        //                 },
        //                 {
        //                     model: Godown_Name,
        //                     attributes: ["godown_name", "id"]
        //                 },
        //             ]
        //         }, {
        //             model: Item_data,
        //             attributes: ['id', "item_name"]

        //         },
        //         {
        //             model: Storage_room,
        //             as: "Item_location",
        //             attributes: ['id', 'room_id', 'rack_number', 'is_available'],
        //             include: [
        //                 {
        //                     model: Storage_room,
        //                     as: "rack_data",
        //                     attributes: ['id', 'godown_id', 'room_number', 'is_available'],
        //                 }
        //             ]

        //         },
        //     ],
        //     order: [['createdAt', 'DESC']],
        //     ...conditionOffset,
        //     distinct: true,
        // })
        const DispatchItemsReceiveList = await dispatch_item_receives.findAndCountAll({
            where: conditionWhere,
            include: [
                {
                    model: dispatch_items,
                    as: "Receive_Item",
                    include: [
                        {
                            model: Item_data,
                            attributes: ['id', "item_name"]

                        },
                        {
                            model: Storage_room,
                            as: "Item_location",
                            attributes: ['id', 'room_id', 'rack_number', 'is_available'],
                            include: [
                                {
                                    model: Storage_room,
                                    as: "rack_data",
                                    attributes: ['id', 'godown_id', 'room_number', 'is_available'],
                                }
                            ]
                        }

                    ]
                    // },

                },
                {
                    model: Ready_to_Deliver,
                    as: "Voucher_number",
                    attributes: ["id", 'serial_number']
                },
                {
                    model: Godown_Name,
                    attributes: ["godown_name", "id"]
                }
            ],
            order: [['createdAt', 'DESC']],
            ...conditionOffset,
            distinct: true,
        })
        if (id) {
            return RESPONSE.success(res, 7905, DispatchItemsReceiveList.rows);
        }
        let responseData = {
            chatData: DispatchItemsReceiveList.rows,
            page_information: {
                totalrecords: DispatchItemsReceiveList.count,
                lastpage: Math.ceil(DispatchItemsReceiveList.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(DispatchItemsReceiveList.count / limit) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, 7905, responseData);
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}
//update items receive
const updateItemsRecive = async (req, res) => {
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
        let { voucher_id, godown_name, receive_item } = body;
        if (receive_item?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7902);
        }
        // Check Purchase Invoice
        const findVoucherId = await Ready_to_Deliver.findOne({
            where: { id: voucher_id }
        })
        if (!findVoucherId) {
            await trans.rollback()
            return RESPONSE.error(res, 7609)
        }
        // Check Godown
        const findGodownName = await Godown_Name.findOne({
            where: { id: godown_name }
        })
        if (!findGodownName) {
            await trans.rollback()
            return RESPONSE.error(res, 7305)
        }
        let room = receive_item.map(i => i.item_location)
        let receiveItemName = receive_item.map(i => i.item_name)
        // Check Storage Room
        const findStorageRoom = await Storage_room.findOne({
            where: { id: { [Op.in]: room } }
        })
        if (!findStorageRoom) {
            await trans.rollback()
            return RESPONSE.error(res, 7601)
        }
        // Check receive item Name
        const findReceiveItemName = await Item_data.findOne({
            where: { id: { [Op.in]: receiveItemName } }
        })
        if (!findReceiveItemName) {
            await trans.rollback()
            return RESPONSE.error(res, "Items Not Exist")
        }
        const dispatchData = await dispatch_item_receives.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: dispatch_items,
                    as: "Receive_Item"
                }
            ]
        })

        if (!dispatchData) {
            await trans.rollback()
            return RESPONSE.error(res, 7904)
        }
        
        const dispatch_item_receive_Ids = dispatchData.Receive_Item.map(item => item.id)
        await dispatchData.update({ voucher_id, godown_name }, { transaction: trans })
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
                    await model.create({ ...i, dispatch_item_receives_id: dispatchData.id }, { transaction: trans })
                }
            }
            let remaningIds = olddata.filter(item => !ids.includes(item))
            if (remaningIds.length) {
                await model.destroy({ where: { dispatch_item_receives_id: dispatchData.id, id: { [Op.in]: remaningIds } }, transaction: trans })
            }
        }
        // throw "data"
        // updateing dispatch receive Item
        await updatedata(dispatch_items, receive_item, dispatch_item_receive_Ids);
        await trans.commit();
        return RESPONSE.success(res, 7907, { id: dispatchData.id })
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}
//
const deleteItemReceive = async (req, res) => {
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

        const DispatchItemsReceive = await dispatch_item_receives.findOne({
            where: { id }
        })
        if (!DispatchItemsReceive) {
            await trans.rollback();
            return RESPONSE.error(res, 7904)
        }

        await DispatchItemsReceive.destroy({ transaction: trans })
        await dispatch_items.destroy({ where: { dispatch_item_receives_id: id }, transaction: trans })

        await trans.commit();
        return RESPONSE.success(res, 7906);
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}













module.exports = { addItemsReceive, getDispatchReceive, updateItemsRecive, deleteItemReceive }