const db = require('../../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const Validator = require('validatorjs');
const PriceListDetail = db.Price_List_Detail;
const PriceListItem = db.Price_List_Item
const Customer = db.customer_details
const itemdata = db.item_data


// Add Price List 

const addPriceList = async (req, res) => {
    let validation = new Validator(req.body, {
        // is_enable:"reqiured|in:Sale,Purchase,Both"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        let { price_list_name, is_price_enable, for_sale, for_purchase, price_list_items } = req.body;
        if (price_list_items?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7101);
        };
        // Check Customer
        // const findcustomer = await Customer.findOne({ where: { id: customer_id } })
        // if (!findcustomer) {
        //     await trans.rollback();
        //     return RESPONSE.error(res, 8311)
        // }
        const PriceName = await PriceListDetail.findOne({
            where: {
                price_list_name: price_list_name
            }
        })
        if (PriceName) {
            await trans.rollback();
            return RESPONSE.error(res, 7102)
        }
        const PriceDetails = { price_list_name, is_price_enable, for_sale, for_purchase }
        const priceListDetail = await PriceListDetail.create(PriceDetails, { transaction: trans })

        const addInvoiceID = (arr) => {
            return arr.map(item => {
                item.price_list_id = priceListDetail.id
                return item
            })
        }

        // adding Item
        price_list_items = addInvoiceID(price_list_items);
        // creating Item
        await PriceListItem.bulkCreate(price_list_items, { transaction: trans })
        await trans.commit()
        return RESPONSE.success(res, 7103, { id: priceListDetail.id })

    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

const getPriceList = async (req, res) => {
    try {
        const { id, search, is_price_enable ,is_for} = req.query
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
        if (search) {
            conditionWhere = {
                price_list_name: {
                    [Op.like]: `%${search}%`
                },
            }
        }
        
        if (is_price_enable) {
            conditionWhere.is_price_enable = is_price_enable == 1 ? true:false;
        }
        if (is_for) {
            switch (is_for) {
                case 'Sales':
                    conditionWhere.for_sale = true
                    break;
            
                case 'Purchase':
                    conditionWhere.for_purchase = true
                    break;
            
                case 'Both':
                    conditionWhere.for_sale = true
                    conditionWhere.for_purchase = true
                    break;
            
                default:
                    break;
            }
        }
        const PriceListdata = await PriceListDetail.findAndCountAll({
            where: conditionWhere,
            include: [
                {
                    model: PriceListItem,
                    // include: [
                    //     {
                    //         model: itemdata
                    //     }
                    // ]
                }
            ],
            order: [['createdAt', 'DESC']],
            ...conditionOffset,
            distinct: true,

        })

        if (id) {
            return RESPONSE.success(res, 7104, PriceListdata.rows);
        }
        let responseData = {
            chatData: PriceListdata.rows,
            page_information: {
                totalrecords: PriceListdata.count,
                lastpage: Math.ceil(PriceListdata.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(PriceListdata.count / limit) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, 7104, responseData);
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

const editPriceList = async (req, res) => {
    let validation = new Validator(req.query, {
        // id: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        const { id } = req.query
        let { price_list_name, is_price_enable, for_sale, for_purchase, price_list_items } = req.body

        if (price_list_items?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 7101);
        };
        // Check Customer
        // const findcustomer = await Customer.findOne({ where: { id: PriceDetails.customer_id } })
        // if (!findcustomer) {
        //     return RESPONSE.error(res, 8311)
        // }
        const PriceListdata = await PriceListDetail.findOne({ where: { id: id } })
        if (!PriceListdata) {
            await trans.rollback();
            return RESPONSE.error(res, 7105)
        }
        const PriceName = await PriceListDetail.findOne({
            where: {
                price_list_name: price_list_name,
                id: {
                    [Op.not]: id, // Exclude the current invoiceId
                },
            }
        })
        if (PriceName) {
            await trans.rollback();
            return RESPONSE.error(res, 7102)
        }
        const PriceDetails = { price_list_name, is_price_enable, for_sale, for_purchase }
        // Price List Detail update
        await PriceListdata.update(PriceDetails, { transaction: trans })

        // Price List Items Update
        // for (const item of price_list_items) {
        //     const { item_name, rate, free_scheme, discount_scheme, id } = item;
        //     const updateItem = {
        //         item_name: item_name,
        //         rate: rate,
        //         free_scheme: free_scheme,
        //         discount_scheme: discount_scheme,
        //     };
        //     await PriceListItem.update(updateItem, { where: { id: id, price_list_id: PriceListdata.id }, transaction: trans });
        // }
        const addInvoiceID = (arr) => {
            return arr.map(item => {
                item.price_list_id = PriceListdata.id
                return item
            })
        }
        await PriceListItem.destroy({ where: { price_list_id: PriceListdata.id }, transaction: trans })
        // adding Item
        price_list_items.price_list_id = PriceListdata.id
        await PriceListItem.bulkCreate(addInvoiceID(price_list_items), { transaction: trans })
        await trans.commit()
        return RESPONSE.success(res, 7106)
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

const deletePriceList = async (req, res) => {
    let validation = new Validator(req.query, {
        id: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        const { id } = req.query
        const PriceListdata = await PriceListDetail.findOne({ where: { id: id } })
        if (!PriceListdata) {
            await trans.rollback();
            return RESPONSE.error(res, 7105)
        }
        await PriceListdata.destroy({ transaction: trans })
        await PriceListItem.destroy({ where: { price_list_id: PriceListdata.id }, transaction: trans })
        await trans.commit()
        return RESPONSE.success(res, 7107)
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

module.exports = {
    addPriceList,
    getPriceList,
    deletePriceList,
    editPriceList
}