const db = require('../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const Item_data = db.item_data;
const unit_measurement = db.unit_measurement;
const stock_category_datas = db.stock_category
const Hsns = db.hsn_data
const Godown_Name = db.godown_address
const Storage_Room = db.storage_room
const Validator = require('validatorjs')
const { getData } = require('./Stock_category.controller')



// Add Item

const addItem = async (req, res) => {
    let validation = new Validator(req.body, {
        // item_type: "required",
        // item_name: "string",
        // item_code: "string",
        // hsn: "integer",
        // tax_category: "numeric",
        // invoice_description: "string",
        // item_quantity: "numeric",
        // cost_per_qty: "numeric",
        // manage_inventory: "boolean"
        item_for: "required|in:0,1,2,3",
        // free_scheme: '^\d+(?:\+\d+)*$'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { user: { id: user_id }, body } = req;
        body.user_id = user_id;

        //   check Hsn Id
        const findhsnid = await Hsns.findOne({
            where: {
                id: body.hsn
            }
        })
        if (!findhsnid) {
            return RESPONSE.error(res, 8085)
        }

        // Check Stock category Id
        const findStockid = await stock_category_datas.findOne({
            where: {
                id: body.stock_category
            }
        })
        if (!findStockid) {
            return RESPONSE.error(res, 8011)
        }

        // Check UOM Id
        const findUOMId = await unit_measurement.findOne({
            where: {
                id: body.unit_of_measurement
            }
        })
        if (!findUOMId) {
            return RESPONSE.error(res, 8012)
        }

        // Check Godown Address
        const findGodownAddress = await Godown_Name.findOne({
            where: {
                id: body.godown_name
            }
        })
        if (!findGodownAddress) {
            return RESPONSE.error(res, 7305)
        }

        //    check material location
        const findStorageRoom = await Storage_Room.findOne({
            where: { id: body.material_location }
        })
        if (!findStorageRoom) {
            return RESPONSE.error(res, 7701)
        }
        const parentCategory = await getData();
        const categoryData = parentCategory.filter(item => item.id == body.stock_category)[0];
        const parent = categoryData.parent.filter(item => item.parent_id == null)[0];
        if (parent == null) {
            body.parent_category = body.stock_category;
        } else {
            body.parent_category = parent.id;
        };

        const ItemData = await Item_data.create(body);

        return RESPONSE.success(res, 7001, FUNCTIONS.transformData(ItemData));
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

// Get all Item 
const getItemData = async (req, res) => {
    let validation = new Validator(req.query, {
        scheme_valid_by_date: "date",
        item_for: "in:0,1,2,3"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id, search, stock_category, item_for } } = req;
        let conditionWhere = { /*item_status: true*/ };
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

        // Search By itemName and itemCode
        if (search) {
            conditionWhere[Op.or] = [
                { item_name: { [Op.like]: `%${search}%` } },
                { item_code: { [Op.like]: `%${search}%` } }
            ];
        }

        // Filter by stock_category
        if (stock_category) {
            conditionWhere.stock_category = stock_category.toString().split(',');
        }

        // Filter by item_for
        if (item_for !== undefined && item_for !== '') {
            conditionWhere.item_for = { [Op.in]: [item_for, 2] };
        }

        const item_datas = await Item_data.findAndCountAll({

            where: conditionWhere,

            include: [
                {
                    model: stock_category_datas,
                    as: 'parentCategory',
                    attributes: ['id', 'parent_id', 'category'],
                },
                {
                    model: stock_category_datas,
                    as: 'category',
                    attributes: ['id', 'parent_id', 'category'],
                },
                {
                    model: unit_measurement,
                    as: 'unitofmeasurement',
                    attributes: ['id', 'unit_of_measurement', 'uom_fullName', 'qty_deci_places'],
                },
                {
                    model: Hsns,
                    attributes: ['id', 'hsn_code', 'hsn_description'],
                },
                {
                    model: Godown_Name,
                    attributes: ['id', 'godown_name', 'address_type'],
                },
                {
                    model: Storage_Room,
                    attributes: ['id', 'godown_id'],
                    include: [
                        {
                            model: Storage_Room,
                            as: "rack_data"
                        }
                    ]
                },

            ],
            // subQuery: false,
            ...conditionOffset,
            distinct: true,


        });

        // // decimal point
        // item_datas.rows = item_datas.rows.map((element) => {
        //     const decimalPlaces = element.unitofmeasurement && element.unitofmeasurement.qty_deci_places !== null ? element.unitofmeasurement.qty_deci_places : 0;
        //     const splitValue = element?.unit_quantity?.toString().split('.');
        //     element.unit_quantity = splitValue ? decimalPlaces > 0 && splitValue[1] ? splitValue[0] + '.' + splitValue[1].padEnd(decimalPlaces, '0').slice(0, decimalPlaces) : splitValue[0] : null;
        //     return element;
        // });

        item_datas.rows = item_datas.rows.map((element) => {
            // Global Function
            element.unit_quantity = FUNCTIONS.decimalPointSplit(element?.unit_quantity, element?.unitofmeasurement?.qty_deci_places)
            return element
        })

        if (id) {
            return RESPONSE.success(res, item_datas.rows.length ? 7003 : 7002, FUNCTIONS.transformData(item_datas.rows));
        }

        let responseData = {
            chatData: item_datas.rows,
            page_information: {
                totalrecords: item_datas.count,
                lastpage: Math.ceil(item_datas.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(item_datas.count / limit) ? page + 1 : 0
            }
        };

        return RESPONSE.success(res, responseData.length ? 7003 : 7002, FUNCTIONS.transformData(responseData));
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

// Edit  items
const updateItem = async (req, res) => {
    let validation = new Validator(req.body, {
        // item_type: "required",
        // item_name: "string",
        // item_code: "string",
        // hsn: "integer",
        // tax_category: "numeric",
        // invoice_description: "string",
        // item_quantity: "numeric",
        // cost_per_qty: "numeric",
        // manage_inventory: "boolean",
        // item_short_name: "string",
        // mrp: "numeric",
        scheme_valid_by_date: "date",
        item_for: "required|in:0,1,2,3",
        // free_scheme: /^\d+\s*\+\s*\d+$/,
        // min_order_qty: "integer",
        // order_turnaround_time: "integer",
        // last_purchase_rate: "numeric",
        // preferred_vendor: "string",
        // deliver_to: "string",
        // item_status: "boolean",
        // item_for_sale: "boolean",
        // item_for_purchase: "boolean",


    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }

    try {
        const { body, query: { id } } = req;

        //   check Hsn Id
        const findhsnid = await Hsns.findOne({
            where: {
                id: body.hsn
            }
        })
        if (!findhsnid) {
            return RESPONSE.error(res, 8085)
        }

        // Check Stock category Id
        const findStockid = await stock_category_datas.findOne({
            where: {
                id: body.stock_category
            }
        })
        if (!findStockid) {
            return RESPONSE.error(res, 8011)
        }

        // Check UOM Id
        const findUOMId = await unit_measurement.findOne({
            where: {
                id: body.unit_of_measurement
            }
        })
        if (!findUOMId) {
            return RESPONSE.error(res, 8012)
        }
        // Custom validation
        // if (exp_date <= mfg_date) {
        //     return RESPONSE.error(res, 7008);
        // }
        const item_datas = await Item_data.findOne({ where: { id } });

        if (!item_datas) {
            return RESPONSE.error(res, 7002, 404);
        }
        // Check Godown Address
        const findGodownAddress = await Godown_Name.findOne({
            where: {
                id: body.godown_name
            }
        })
        if (!findGodownAddress) {
            return RESPONSE.error(res, 7305)
        }

        //    check material location
        const findStorageRoom = await Storage_Room.findOne({
            where: { id: body.material_location }
        })
        if (!findStorageRoom) {
            return RESPONSE.error(res, 7701)
        }

        const parentCategory = await getData();
        const categoryData = parentCategory.filter(item => item.id == body.stock_category)[0];
        const parent = categoryData.parent.filter(item => item.parent_id == null)[0];
        if (parent == null) {
            body.parent_category = body.stock_category;
        } else {
            body.parent_category = parent.id;
        }

        // update
        await Item_data.update(body, { where: { id } });

        return RESPONSE.success(res, 7005);
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};


// Delete  items
const deleteItem = async (req, res) => {
    try {
        const { query: { id } } = req

        const item_datas = await Item_data.findOne({ where: { id } })

        if (!item_datas) {
            return RESPONSE.error(res, 7002, 404)
        }

        // Delete
        await Item_data.destroy({ where: { id } })

        return RESPONSE.success(res, 7007)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}





//********************************************* Finishes goods **********************************************//

// Get all Finished goods
// const getFinishedGoods = async (req, res) => {
//     try {
//         const { query: { id, search } } = req
//         let conditionWhere = {};
//         let conditionOffset = {};
//         // Pagination
//         const page = Number(req.query.page);
//         const limit = Number(req.query.limit);
//         const offset = (page - 1) * limit;

//         //    Search by id
//         if (id) {
//             conditionWhere.id = id
//         }
//         // Offset condition
//         if (limit && page) {
//             conditionOffset.limit = limit;
//             conditionOffset.offset = offset;
//         }

//         // Search By itemName and itemCode
//         if (search) {
//             conditionWhere[Op.or] = [
//                 { item_name: { [Op.like]: `%${search}%` } },
//                 { item_code: { [Op.like]: `%${search}%` } }
//             ];
//         }
//         const items_finished_goods = await Items_finished_goods.findAndCountAll({
//             where: conditionWhere,
//             include: [
//                 {
//                     model: stock_category_datas,
//                     as: 'Category1',
//                     attributes: ['id', 'parent_id', 'category'],
//                 },
//                 {
//                     model: unit_measurement,
//                     as: 'unitofMeasurement',
//                     attributes: ['id', 'unit_of_measurement', 'uom_fullName','qty_deci_places'],
//                 },
//                 {
//                     model: Hsns,
//                     attributes: ['id', 'hsn_code', 'hsn_description'],
//                 }
//             ],
//             ...conditionOffset
//         })

//         if (items_finished_goods.rows.length === 0) {
//             return RESPONSE.error(res, 7002, 404);
//         }

//         const data = items_finished_goods.rows.map((item) => {
//         
//             const newItem = item.toJSON();
//             newItem.category = newItem.Category1;
//             newItem.unitofmeasurement = newItem.unitofMeasurement;
//             delete newItem.Category1;
//             delete newItem.unitofMeasurement;
//             return newItem;
//         });

//         if (id) {
//             return RESPONSE.success(res, 7003,  FUNCTIONS.transformData(data[0]));
//         }

//         let Data = {
//             chatData: data,
//             page_information: {
//                 totalrecords: items_finished_goods.count,
//                 lastpage: Math.ceil(items_finished_goods.count / limit),
//                 currentpage: page,
//                 previouspage: 0 + (page - 1),
//                 nextpage: page < Math.ceil(items_finished_goods.count / limit) ? page + 1 : 0
//             }
//         };

//         return RESPONSE.success(res, 7004,FUNCTIONS.transformData(Data));

//     } catch (error) {
//         console.log(error);
//         return RESPONSE.error(res, 9999);
//     }
// }

// // Edit Raw Materials items

// const updatefinishedGoods = async (req, res) => {
//     // let validation = new Validator(req.body, {
//     //     item_type: "required",
//     //     item_name: "string",
//     //     item_code: "string",
//     //     item_short_name: "string",
//     //     invoice_description: "string",
//     //     cost_per_qty: "numeric",
//     //     tax_category: "numeric",
//     //     hsn: "integer",
//     //     mfg_date: "date",
//     //     exp_date: "date",
//     //     pack_of: "string",
//     //     min_mfg_qty: "integer",
//     //     mrp: "numeric",
//     //     mfg_time_days: "integer",
//     //     scheme: "string",
//     //     scheme_valid_by_date: "date",
//     //     max_discount: "numeric",
//     //     batch_prefix: "string",
//     //     standard_cost: "numeric",
//     //     current_cost: "numeric",
//     //     item_status: "boolean",
//     //     item_for_sale: "boolean",
//     //     item_for_purchase: "boolean",
//     //     distributor_moq: "integer",
//     //     distributor_price: "numeric",
//     //     retail_price: "numeric",
//     //     barcode: "string"
//     // });
//     // if (validation.fails()) {
//     //     firstMessage = Object.keys(validation.errors.all())[0];
//     //     return RESPONSE.error(res, validation.errors.first(firstMessage))
//     // }
//     try {
//         const { body, query: { id } } = req

//         const items_finished_goods = await Items_finished_goods.findOne({ where: { id } })

//         if (!items_finished_goods) {
//             return RESPONSE.error(res, 7002, 404)
//         }

//         // update
//         await Items_finished_goods.update(body, { where: { id } });


//         return RESPONSE.success(res, 7006)
//     } catch (error) {
//         console.log(error)
//         return RESPONSE.error(res, 9999)
//     }
// }



// const deleteFinishedGoods = async (req, res) => {
//     try {
//         const { query: { id } } = req

//         const items_finished_goods = await Items_finished_goods.findOne({ where: { id } })

//         if (!items_finished_goods) {
//             return RESPONSE.error(res, 7002, 404)
//         }

//         // Delete
//         await Items_finished_goods.destroy({ where: { id } })

//         return RESPONSE.success(res, 7007)
//     } catch (error) {
//         console.log(error)
//         return RESPONSE.error(res, 9999)
//     }
// }

// //Get Item data
const getItems = async (req, res) => {
    let validation = new Validator(req.query, {
        item_for: "in:0,1"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id, item_for } } = req
        let conditionWhere = {};
        if (id) {
            conditionWhere.id = id
        }
        // Filter by item_for
        if (item_for !== undefined && item_for !== '') {
            conditionWhere.item_for = item_for;
        }
        const items_datas = await Item_data.findAll({
            where: conditionWhere,
            attributes: ['id', 'item_name', 'tax_category', 'hsn', 'rate', 'item_for', "unit_of_measurement", "invoice_description"],
            include: [
                {
                    model: unit_measurement,
                    as: 'unitofmeasurement',
                    attributes: ['id', 'unit_of_measurement', 'uom_fullName', 'qty_deci_places'],
                },
                // {
                //     model: stock_category_datas,
                //     as: 'category',
                //     attributes: ['id', 'parent_id', 'category'],
                // },
                {
                    model: Hsns,
                    attributes: ['id', 'hsn_code', 'hsn_description'],
                }
            ]
        })

        if (!items_datas.length) {
            return RESPONSE.error(res, 7002, 404);
        }
        if (id) {
            return RESPONSE.success(res, 7008, items_datas[0]);
        }
        return RESPONSE.success(res, 7003, items_datas);

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

module.exports = {
    addItem,
    getItemData,
    // getFinishedGoods,
    updateItem,
    // updatefinishedGoods,
    deleteItem,
    // deleteFinishedGoods,
    getItems
}