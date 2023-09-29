const db = require('../../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const Sale_Item_data = db.Sale_Purchase_Item
const Item_data = db.item_data
const Godown_Name = db.godown_address
const Storage_Room = db.storage_room
const Purchase_Invoice = db.Sale_Purchase_invoice
const Material_Receive = db.material_receive
const Material_Item = db.material_item
const Validator = require('validatorjs')

// const addMaterialReceive = async (req, res) => {
//     let validation = new Validator(req.body, {
//         purchase_invoice_number: "required",
//         godown_name: "required",
//         // material_location:"required",

//     });
//     if (validation.fails()) {
//         firstMessage = Object.keys(validation.errors.all())[0];
//         return RESPONSE.error(res, validation.errors.first(firstMessage))
//     }
//     const trans = await db.sequelize.transaction();
//     try {
//         let { user: { id: user_id }, body } = req
//         body.user_id = user_id;
//         console.log(`body.user_id`, user_id);
//         let { purchase_invoice_number, godown_name, material_item/*material_name, quantity, material_location*/
//         } = body
//         if (material_item?.length < 1) {
//             await trans.rollback();
//             return RESPONSE.error(res, 7501);
//         };
//         // Check Purchase Invoice
//         const findPrchaseInvoice = await Purchase_Invoice.findOne({
//             where: { id: purchase_invoice_number }
//         })
//         if (!findPrchaseInvoice) {
//             await trans.rollback()
//             return RESPONSE.error(res, 7502)
//         }
//         // Check Godown
//         const findGodownName = await Godown_Name.findOne({
//             where: { id: godown_name }
//         })
//         if (!findGodownName) {
//             await trans.rollback()
//             return RESPONSE.error(res, 7305)
//         }
//         let room = material_item.map(i => i.material_location)
//         let MaterialName = material_item.map(i => i.material_name)
//         for(let i of material_item){
//             let ids = i.material_name

//         }
//         // console.log(MaterialName,"MaterialName");
//         // Check Storage Room
//         const findStorageRoom = await Storage_Room.findOne({
//             where: { id: { [Op.in]: room } }
//         })
//         if (!findStorageRoom) {
//             await trans.rollback()
//             return RESPONSE.error(res, 7001)
//         }
//         // Check material Name
//         const findMaterialName = await Sale_Item_data.findOne({
//             where: { id: { [Op.in]: MaterialName } }
//         })
//         if (!findMaterialName) {
//             await trans.rollback()
//             return RESPONSE.error(res, 7503)
//         }
//         // let main_item_name = findMaterialName.map(item => item.item_name)

//         // // find Item data quantity
//         // const ItemData = await Item_data.findAll({
//         //     where: { [Op.and]:  {item_name:{ [Op.in]:main_item_name} , item_for: 1, user_id: user_id} }
//         // })
//         // if (!ItemData) {
//         //     return RESPONSE.error(res, "This Item not avialable")
//         // }
//         // const itemId = ItemData.map(item => item.id)
//         // const itemquantity = ItemData.map(item => item.unit_quantity);
//         // const materialQty = material_item.map(item => item.quantity)

//         // console.log("Itemqty ====",itemquantity);
//         // console.log("ItemId ====",itemId);

//         // throw "hhhhhh"
//         // // can't not repeat Material name same invoice Number
//         // const checkmaterialname = await Material_Receive.findAll({
//         //     where:{
//         //         purchase_invoice_number:purchase_invoice_number,
//         //         material_name:{[Op.in]:MaterialName}
//         //     }
//         // })
//         // if(checkmaterialname){
//         //     return RESPONSE.error(res,"This Material Already Exist In Invoice")
//         // }

//         const MaterialReceive = await Material_Receive.create({ purchase_invoice_number, godown_name }, { transaction: trans })

//         const addInvoiceID = (arr) => {
//             return arr.map(item => {
//                 item.material_received_id = MaterialReceive.id
//                 return item
//             })
//         }
//         material_item = addInvoiceID(material_item)
//         await Material_Item.bulkCreate(material_item, { transaction: trans })

//         await trans.commit()
//         return RESPONSE.success(res, 7504, { id: MaterialReceive.id })
//     } catch (error) {
//         await trans.rollback()
//         console.log(error);
//         return RESPONSE.error(res, 9999);
//     }
// }
const addMaterialReceive = async (req, res) => {
    let validation = new Validator(req.body, {
        purchase_invoice_number: "required",
        godown_name: "required",
        // material_location:"required",

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        let { user: { id: user_id }, body } = req
        body.user_id = user_id;
        let { purchase_invoice_number, godown_name, material_item/*material_name, quantity, material_location*/
        } = body
        if (material_item?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7501);
        };
        // Check Purchase Invoice
        const findPrchaseInvoice = await Purchase_Invoice.findOne({
            where: { id: purchase_invoice_number }
        })
        if (!findPrchaseInvoice) {
            await trans.rollback()
            return RESPONSE.error(res, 7502)
        }
        // Check Godown
        const findGodownName = await Godown_Name.findOne({
            where: { id: godown_name }
        })
        if (!findGodownName) {
            await trans.rollback()
            return RESPONSE.error(res, 7305)
        }
        let room = material_item.map(i => i.material_location)
        let MaterialName = material_item.map(i => i.material_name)

        for (let i of material_item) {
            const material_qty = i.quantity
            const findMaterialName = await Sale_Item_data.findOne({
                where: { id: i.material_name }
            })
            if (!findMaterialName) {
                await trans.rollback()
                return RESPONSE.error(res, 7503)
            }
            const ItemData = await Item_data.findOne({
                where: { item_name: findMaterialName.item_name }
            })
            if (!ItemData) {
                await trans.rollback()
                return RESPONSE.error(res, "This Item not avialable")
            }

            await Item_data.increment('unit_quantity', { by: material_qty, where: { id: ItemData.id }, transaction: trans })
        }
        // Check Storage Room
        const findStorageRoom = await Storage_Room.findOne({
            where: { id: { [Op.in]: room } }
        })
        if (!findStorageRoom) {
            await trans.rollback()
            return RESPONSE.error(res, 7001)
        }
        // Check material Name
        const findMaterialName = await Sale_Item_data.findOne({
            where: { id: { [Op.in]: MaterialName } }
        })
        if (!findMaterialName) {
            await trans.rollback()
            return RESPONSE.error(res, 7503)
        }
        // let main_item_name = findMaterialName.map(item => item.item_name)

        // // find Item data quantity
        // const ItemData = await Item_data.findAll({
        //     where: { [Op.and]:  {item_name:{ [Op.in]:main_item_name} , item_for: 1, user_id: user_id} }
        // })
        // if (!ItemData) {
        //     return RESPONSE.error(res, "This Item not avialable")
        // }
        // const itemId = ItemData.map(item => item.id)
        // const itemquantity = ItemData.map(item => item.unit_quantity);
        // const materialQty = material_item.map(item => item.quantity)

        // console.log("Itemqty ====",itemquantity);
        // console.log("ItemId ====",itemId);

        // throw "hhhhhh"
        // // can't not repeat Material name same invoice Number
        // const checkmaterialname = await Material_Receive.findAll({
        //     where:{
        //         purchase_invoice_number:purchase_invoice_number,
        //         material_name:{[Op.in]:MaterialName}
        //     }
        // })
        // if(checkmaterialname){
        //     return RESPONSE.error(res,"This Material Already Exist In Invoice")
        // }

        const MaterialReceive = await Material_Receive.create({ purchase_invoice_number, godown_name }, { transaction: trans })

        const addInvoiceID = (arr) => {
            return arr.map(item => {
                item.material_received_id = MaterialReceive.id
                return item
            })
        }
        material_item = addInvoiceID(material_item)
        await Material_Item.bulkCreate(material_item, { transaction: trans })

        await trans.commit()
        return RESPONSE.success(res, 7504, { id: MaterialReceive.id })
    } catch (error) {
        await trans.rollback()
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}
const getMaterialReceive = async (req, res) => {
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
        // // Search By 
        if (search) {
            conditionWhere = {
                [Op.or]: {
                    receive_date: {
                        [Op.like]: `%${search}%`
                    },
                    "$sale_purchase_Invoice.serial_number$": {
                        [Op.like]: `%${search}%`
                    }

                }
            }
        }
        const MaterialReceive = await Material_Receive.findAndCountAll({
            where: conditionWhere,
            include: [
                {
                    model: Purchase_Invoice,
                    attributes: ['id', 'serial_number'],

                },
                {
                    model: Godown_Name,
                    attributes: ['id', 'godown_name'],
                },
                {
                    model: Material_Item,
                    include: [
                        {
                            model: Sale_Item_data,
                            as: "materialName",
                            attributes: ['id', 'item_name'],
                        },
                        {
                            model: Storage_Room,
                            as: "materialLocation",
                            attributes: ['id', 'room_id', 'rack_number', 'is_available'],
                            include: [
                                {
                                    model: Storage_Room,
                                    as: "rack_data",
                                    attributes: ['id', 'godown_id', 'room_number', 'is_available'],
                                }
                            ]

                        }
                    ]

                }
            ],

            order: [['createdAt', 'DESC']],
            ...conditionOffset,
            distinct: true,

        })
        if (id) {
            return RESPONSE.success(res, 7505, FUNCTIONS.transformData(MaterialReceive.rows))
        }

        let responseData = {
            chatData: MaterialReceive.rows,
            page_information: {
                totalrecords: MaterialReceive.count,
                lastpage: Math.ceil(MaterialReceive.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(MaterialReceive.count / limit) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, 7505, FUNCTIONS.transformData(responseData))

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};
const editMaterialReceive = async (req, res) => {
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
        let { purchase_invoice_number, godown_name, material_item } = body;
        if (material_item?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7501);
        }
        // Check Purchase Invoice
        const findPrchaseInvoice = await Purchase_Invoice.findOne({
            where: { id: purchase_invoice_number }
        })
        if (!findPrchaseInvoice) {
            await trans.rollback()
            return RESPONSE.error(res, 7502)
        }
        // Check Godown
        const findGodownName = await Godown_Name.findOne({
            where: { id: godown_name }
        })
        if (!findGodownName) {
            await trans.rollback()
            return RESPONSE.error(res, 7305)
        }
        let room = material_item.map(i => i.material_location)
        let MaterialName = material_item.map(i => i.material_name)
        // Check Storage Room
        const findStorageRoom = await Storage_Room.findOne({
            where: { id: { [Op.in]: room } }
        })
        if (!findStorageRoom) {
            await trans.rollback()
            return RESPONSE.error(res, 7001)
        }
        // Check material Name
        const findMaterialName = await Sale_Item_data.findOne({
            where: { id: { [Op.in]: MaterialName } }
        })
        if (!findMaterialName) {
            await trans.rollback()
            return RESPONSE.error(res, "Material Not Exist")
        }
        const MateriaData = await Material_Receive.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Material_Item
                }
            ]
        })
        if (!MateriaData) {
            await trans.rollback()
            return RESPONSE.error(res, 7503)
        }
        const Material_item_Ids = MateriaData.inventory_material_items.map(item => item.id)
        await MateriaData.update({ purchase_invoice_number, godown_name }, { transaction: trans })

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
                    await model.create({ ...i, material_received_id: MateriaData.id }, { transaction: trans })
                }
            }
            // let totalIds = order.sale_purchase_items.map(item => item.id)
            // let itemIds = items.map(item => item.id)
            let remaningIds = olddata.filter(item => !ids.includes(item))
            if (remaningIds.length) {
                await model.destroy({ where: { material_received_id: MateriaData.id, id: { [Op.in]: remaningIds } }, transaction: trans })
            }
        }
        // throw "data"
        // updateing Material Item
        await updatedata(Material_Item, material_item, Material_item_Ids);
        await trans.commit();
        return RESPONSE.success(res, 7506, { id: MateriaData.id })
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};
const deleteMaterialReceive = async (req, res) => {
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

        const MaterialReceive = await Material_Receive.findOne({
            where: { id }
        })
        if (!MaterialReceive) {
            await trans.rollback();
            return RESPONSE.error(res, 7503)
        }
        
        await MaterialReceive.destroy({ transaction: trans })
        await Material_Item.destroy({ where: { material_received_id: id }, transaction: trans })

        await trans.commit();
        return RESPONSE.success(res, 7507);
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}




module.exports = {
    addMaterialReceive,
    getMaterialReceive,
    editMaterialReceive,
    deleteMaterialReceive
}