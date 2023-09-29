const db = require('../../config/db.config')
const { Sequelize, Op, where } = require('sequelize');
const Validator = require('validatorjs');
const Sale_Purchase_Invoice = db.Sale_Purchase_invoice
const ItemData = db.item_data
const ItemTaxdata = db.Sale_Purchase_Tax
const Sale_Purchase_item = db.Sale_Purchase_Item
const SerialNo_data = db.Sale_Purchase_serialNo
const Sale_Purchase_total_Tax = db.Sale_Purchase_total_tax
const partyAccount = db.Sale_Purchase_account;
const stock_Unit = db.unit_measurement;
const Hsns = db.hsn_data
const Customer_address = db.customer_address
const Customer_details = db.customer_details
const Customer_parters = db.customer_parters
const Customer_other_details = db.customer_other_details;
const Prise_list_data = db.Price_List_Detail
const Price_list_Item = db.Price_List_Item
const GodownArea = db.godown_address
const { priceCalculation } = require('./Sale_Purchase_item.controller')
const Users = db.user
const { calculateTaxes } = require('./Sale_Purchase_Tax.controller');


// const addReturn = async (req, res) => {
//     let validation = new Validator(req.query, {
//         item_for: "required|in:0,1,2"
//     });
//     if (validation.fails()) {
//         firstMessage = Object.keys(validation.errors.all())[0];
//         return RESPONSE.error(res, validation.errors.first(firstMessage))
//     }
//     const trans = await db.sequelize.transaction();
//     try {
//         let { query: { item_for }, body: { number_series, serial_number, party, invoice_number, delivery_notes, internal_notes, items, taxData, total_taxes }, user: { id: user_id } } = req
//             ;
//         if (items?.length < 1 || taxData?.length < 1) {
//             await trans.rollback();
//             return RESPONSE.error(res, 8110);
//         };
//         //check_invoice
//         const checkInvoice = await Sale_Purchase_Invoice.findOne({
//             where: {
//                 serial_number: invoice_number,
//                 item_for: item_for,
//                 party: party
//             },
//             include: [
//                 {
//                     model: Customer_address,
//                     as: "Billing"
//                 }
//             ]
//         });
//         if (!checkInvoice) {
//             await trans.rollback();
//             return RESPONSE.error(res, 8111)
//         }
//         // Check Serial Number
//         const findnumberSRId = await SerialNo_data.findOne({
//             where: {
//                 id: number_series
//             }
//         })
//         if (!findnumberSRId) {
//             await trans.rollback();
//             return RESPONSE.error(res, 8208)
//         }
//         // Check Party
//         const findparty = await Customer_details.findOne({
//             where: {
//                 id: party
//             },
//             // include: [
//             //     {
//             //         model: Customer_address,
//             //         as: 'shipping',
//             //         attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
//             //     },
//             //     {
//             //         model: Customer_other_details,
//             //         //    as:"other details"
//             //     },
//             //     {
//             //         model: Customer_address,
//             //         as: 'billing',
//             //         attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
//             //     },
//             // ]

//         })
//         if (!findparty) {
//             await trans.rollback();
//             return RESPONSE.error(res, 8311)
//         }

//         // Check if serial number is repeated within the same number_series
//         const duplicateSerialNumber = await Sale_Purchase_Invoice.findOne({
//             where: {
//                 number_series: number_series,
//                 serial_number: serial_number
//             }
//         });

//         if (duplicateSerialNumber) {
//             await trans.rollback();
//             return RESPONSE.error(res, 8209);
//         }

//         // Update last_number field
//         const serialNumberParts = serial_number.split('-')[1];
//         const numericPart = parseInt(serialNumberParts);
//         if (isNaN(numericPart)) {
//             await trans.rollback();
//             return RESPONSE.error(res, 8210);
//         }

//         const updatedSerialNumber = await SerialNo_data.update(
//             { last_number: numericPart },
//             {
//                 where: { id: findnumberSRId.id },
//                 transaction: trans
//             }
//         );
//         if (!updatedSerialNumber) {
//             await trans.rollback();
//             return RESPONSE.error(res, 8208);
//         }
//         // creating Invoice detail
//         const ReturnInvoice = await Sale_Purchase_Invoice.create({ number_series, serial_number, party, invoice_number, delivery_notes, internal_notes, item_for: item_for, is_return: true, account: checkInvoice.account, payment_day: checkInvoice.payment_day, date: checkInvoice.date, is_order: 0 || false, billing_address: checkInvoice.billing_address, shipping_address: checkInvoice.shipping_address }, { transaction: trans })

//         if (item_for === '1') {
//             const addInvoiceID = (arr) => {
//                 return arr.map(item => {
//                     item.invoice_id = ReturnInvoice.id
//                     item.customer_id = ReturnInvoice.party,
//                         item.user_id = user_id,
//                         item.item_for = item_for,
//                         item.is_return = true
//                     return item
//                 })
//             }
//             items = addInvoiceID(items)

//             // creating Items
//             await Sale_Purchase_item.bulkCreate(items, { transaction: trans })

//             const stateName = checkInvoice?.Billing?.state
//             let taxData1 = calculateTaxes(stateName, items);
//             const total_taxes = {
//                 grant_total: taxData1.grant_total,
//                 total_amount: taxData1.total_amount,
//                 total_cgst_amount: taxData1.total_cgst_amount,
//                 total_cgst_rate: taxData1.total_cgst_rate,
//                 total_igst_amount: taxData1.total_igst_amount,
//                 total_igst_rate: taxData1.total_igst_rate,
//                 total_sgst_amount: taxData1.total_sgst_amount,
//                 total_sgst_rate: taxData1.total_sgst_rate,
//                 total_gst_rate: taxData1.total_gst_rate,
//                 total_gst_amount: taxData1.total_gst_amount,
//                 round_off: taxData1.round_off,
//                 status_key: taxData1.status_key,
//                 invoice_id: ReturnInvoice.id,
//                 customer_id: ReturnInvoice.party,
//                 is_return: true
//             }

//             // adding Tax
//             taxData1 = addInvoiceID(taxData1.taxData)
//             // creating Tax data
//             await ItemTaxdata.bulkCreate(taxData1, { transaction: trans })

//             // creating Total tax
//             const taxData = await Sale_Purchase_total_Tax.create(total_taxes, { transaction: trans });
//             await Customer_details.increment('credit_note', { by: taxData?.grant_total, where: { id: ReturnInvoice.party }, transaction: trans });
//         } 
//         else if (item_for === '0') {

//             const addInvoiceID = (arr) => {
//                 return arr.map(item => {
//                     item.invoice_id = ReturnInvoice.id,
//                     item.is_return = true
//                     return item
//                 })
//             }
//             // adding Item
//             items = addInvoiceID(items);

//             // items array and update the existing records
//             for (const item of items) {
//                 await Sale_Purchase_item.update(item, {
//                     where: { id: item.id },
//                     transaction: trans
//                 });

//             }
//             // adding Tax
//             taxData = addInvoiceID(taxData)
//             // creating Tax data
//             await ItemTaxdata.bulkCreate(taxData, { transaction: trans })


//             // adding Total tax
//             total_taxes.invoice_id = ReturnInvoice.id;
//             total_taxes.customer_id = ReturnInvoice.party;
//             total_taxes.is_return = true
//             // creating Total tax
//             const totalTaxes = await Sale_Purchase_total_Tax.create(total_taxes, { transaction: trans })
//             await Customer_details.increment('credit_note', { by: totalTaxes.grant_total, where: { id: ReturnInvoice.party }, transaction: trans });
//         }
//         await trans.commit()
//         return RESPONSE.success(res, 8122, { id: ReturnInvoice.id })
//     } catch (error) {
//         await trans.rollback();
//         console.log(error);
//         return RESPONSE.error(res, 9999);
//     }
// }

const addReturn = async (req, res) => {
    let validation = new Validator(req.query, {
        item_for: "required|in:0,1,2"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        let { query: { item_for }, body: { number_series, serial_number, party, invoice_number, delivery_notes, internal_notes, items, /*taxData*/ total_taxes }, user: { id: user_id } } = req
            ;
        if (items?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 8110);
        };
        //check_invoice
        const checkInvoice = await Sale_Purchase_Invoice.findOne({
            where: {
                serial_number: invoice_number,
                item_for: item_for,
                party: party
            },
            include: [
                {
                    model: Customer_address,
                    as: "Billing"
                },
                {
                    model: Customer_address,
                    as: "Shipping"
                }
            ]
        });
        if (!checkInvoice) {
            await trans.rollback();
            return RESPONSE.error(res, 8111)
        }
        // Check Serial Number
        const findnumberSRId = await SerialNo_data.findOne({
            where: {
                id: number_series
            }
        })
        if (!findnumberSRId) {
            await trans.rollback();
            return RESPONSE.error(res, 8208)
        }
        // Check Party
        const findparty = await Customer_details.findOne({
            where: {
                id: party
            },
            // include: [
            //     {
            //         model: Customer_address,
            //         as: 'shipping',
            //         attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            //     },
            //     {
            //         model: Customer_other_details,
            //         //    as:"other details"
            //     },
            //     {
            //         model: Customer_address,
            //         as: 'billing',
            //         attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            //     },
            // ]

        })
        if (!findparty) {
            await trans.rollback();
            return RESPONSE.error(res, 8311)
        }

        // Check if serial number is repeated within the same number_series
        const duplicateSerialNumber = await Sale_Purchase_Invoice.findOne({
            where: {
                number_series: number_series,
                serial_number: serial_number
            }
        });

        if (duplicateSerialNumber) {
            await trans.rollback();
            return RESPONSE.error(res, 8209);
        }

        // Update last_number field
        const serialNumberParts = serial_number.split('-')[1];
        const numericPart = parseInt(serialNumberParts);
        if (isNaN(numericPart)) {
            await trans.rollback();
            return RESPONSE.error(res, 8210);
        }

        const updatedSerialNumber = await SerialNo_data.update(
            { last_number: numericPart },
            {
                where: { id: findnumberSRId.id },
                transaction: trans
            }
        );
        if (!updatedSerialNumber) {
            await trans.rollback();
            return RESPONSE.error(res, 8208);
        }
        // creating Invoice detail
        const ReturnInvoice = await Sale_Purchase_Invoice.create({ number_series, serial_number, party, invoice_number, delivery_notes, internal_notes, item_for: item_for, is_return: true, account: checkInvoice.account, payment_day: checkInvoice.payment_day, date: checkInvoice.date, is_order: 0 || false, billing_address: checkInvoice.billing_address, shipping_address: checkInvoice.shipping_address }, { transaction: trans })

        const addInvoiceID = (arr) => {
            return arr.map(item => {
                item.invoice_id = ReturnInvoice.id
                item.customer_id = ReturnInvoice.party,
                    item.user_id = user_id,
                    item.item_for = item_for,
                    item.is_return = true
                return item
            })
        }
        items = addInvoiceID(items)

        // creating Items
        await Sale_Purchase_item.bulkCreate(items, { transaction: trans })

        // const stateName = checkInvoice?.Billing?.state  || checkInvoice?.Shipping?.state
        const stateName = item_for === '1' ? checkInvoice?.Billing?.state : (checkInvoice?.Shipping?.state || checkInvoice?.Billing?.state
        )
        let taxData = calculateTaxes(stateName, items);
        total_taxes = {
            grant_total: taxData.grant_total,
            total_amount: taxData.total_amount,
            total_cgst_amount: taxData.total_cgst_amount,
            total_cgst_rate: taxData.total_cgst_rate,
            total_igst_amount: taxData.total_igst_amount,
            total_igst_rate: taxData.total_igst_rate,
            total_sgst_amount: taxData.total_sgst_amount,
            total_sgst_rate: taxData.total_sgst_rate,
            total_gst_rate: taxData.total_gst_rate,
            total_gst_amount: taxData.total_gst_amount,
            round_off: taxData.round_off,
            status_key: taxData.status_key,
            invoice_id: ReturnInvoice.id,
            customer_id: ReturnInvoice.party,
            is_return: true
        }

        // adding Tax
        taxData = addInvoiceID(taxData.taxData)
        // creating Tax data
        await ItemTaxdata.bulkCreate(taxData, { transaction: trans })

        // creating Total tax
        const totaltaxData = await Sale_Purchase_total_Tax.create(total_taxes, { transaction: trans });
        await Customer_details.increment('credit_note', { by: totaltaxData?.grant_total, where: { id: ReturnInvoice.party }, transaction: trans });
        await trans.commit()
        return RESPONSE.success(res, 8122, { id: ReturnInvoice.id })
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

const getReturn = async (req, res) => {
    try {
        const { query: { id, search, item_for } } = req;
        const conditionOffset = {}
        let conditionWhere = { is_return: true }
        if (item_for) {
            conditionWhere.item_for = item_for
        }
        if (id) {
            conditionWhere.id = id
        }
        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit);
        const offset = (page - 1) * limit;
        // Offset condition
        if (limit && page) {
            conditionOffset.limit = limit;
            conditionOffset.offset = offset;
        }
        // Search By  partyname and  serial_number
        if (search) {
            conditionWhere = {
                [Op.or]: {
                    serial_number: {
                        [Op.like]: `%${search}%`
                    },
                    invoice_number: {
                        [Op.like]: `%${search}%`
                    },
                    "$customer_detail.firm_name$": {
                        [Op.like]: `%${search}%`
                    }

                },
                is_return: true,
                item_for: item_for

            }
        }
        const ReturnInvoice = await Sale_Purchase_Invoice.findAndCountAll({
            where: conditionWhere,
            include: [
                {
                    model: Customer_details,
                    required: true,
                    include: [
                        {
                            model: Customer_address,
                            as: 'billing',
                        },
                        {
                            model: Customer_address,
                            as: 'shipping',
                        },
                        {
                            model: Customer_parters
                        },
                        {
                            model: Customer_other_details,
                        }
                    ]
                },
                {
                    model: Customer_address,
                    as: 'Billing',
                },
                {
                    model: SerialNo_data,

                },
                {
                    model: Sale_Purchase_item,
                    include: [
                        {
                            model: stock_Unit,
                            attributes: ['id', 'unit_of_measurement', 'uom_fullName', 'qty_deci_places'],
                        },
                        {
                            model: Hsns,
                            attributes: ['id', 'hsn_code'],
                        }
                    ]

                },
                {
                    model: ItemTaxdata,
                },
                {
                    model: Sale_Purchase_total_Tax,
                    as: 'totalTax'
                },
                // {
                //     model: GodownArea,
                //     as: 'delivery',
                //     attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                // },
            ],
            order: [['createdAt', 'DESC']],
            ...conditionOffset,
            distinct: true
        })
        if (id) {
            return RESPONSE.success(res, 8123, FUNCTIONS.transformData(ReturnInvoice.rows));
        }
        let responseData = {
            chatData: ReturnInvoice.rows,
            page_information: {
                totalrecords: ReturnInvoice.count,
                lastpage: Math.ceil(ReturnInvoice.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(ReturnInvoice.count / limit) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, 8123, FUNCTIONS.transformData(responseData))

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

// const updateReturn = async (req, res) => {
//     let validation = new Validator(req.query, {
//         // is_order: "required",
//         invoiceId: "required",
//         item_for: "required|in:0,1"    // 0 = sale && 1 = purchase
//     });
//     if (validation.fails()) {
//         firstMessage = Object.keys(validation.errors.all())[0];
//         return RESPONSE.error(res, validation.errors.first(firstMessage))
//     }
//     const trans = await db.sequelize.transaction();
//     try {
//         let { user: { id: user_id }, query: { invoiceId, item_for }, body: { items, taxData, totalTaxes } } = req
//         if (items?.length < 1 || taxData?.length < 1) {
//             await trans.rollback();
//             return RESPONSE.error(res, 8110);
//         };
//         const existingInvoice = await Sale_Purchase_Invoice.findOne({
//             where: {
//                 id: invoiceId,
//                 // is_order: is_order,
//                 item_for: item_for,
//                 is_return: true
//             },
//             include: [
//                 {
//                     model: Customer_address,
//                     as: "Billing"
//                 },
//                 {
//                     model: Sale_Purchase_item
//                 },
//                 {
//                     model: ItemTaxdata
//                 },
//                 {
//                     model: Sale_Purchase_total_Tax,
//                     as: 'totalTax'
//                 }
//             ]
//         });

//         if (!existingInvoice) {
//             await trans.rollback();
//             return RESPONSE.error(res, 8111);
//         }
//         if (item_for === '1') {
//             const addInvoiceIDs = (arr, user_id) => {
//                 return arr.map(item => {
//                     item.invoice_id = invoiceId;
//                     item.user_id = user_id;
//                     item.item_for = item_for;
//                     item.customer_id = existingInvoice.party;
//                     item.is_return = true
//                     return item;
//                 });
//             };
//             let items_ids = existingInvoice.sale_purchase_items.map(item => item.id)
//             // let tax_id = existingInvoice.sale_purchase_taxes.map(item => item.id)
//             const updatedata = async (model, updatedata, olddata) => {
//                 let ids = []
//                 for (let i of updatedata) {
//                     if (i.id) {
//                         ids.push(i.id)
//                         let updateId = i.id
//                         delete i.id
//                         // i.invoice_id = existingInvoice.id
//                         // delete i.customer_id
//                         await model.update(i, { where: { id: updateId, is_return: true }, transaction: trans })
//                     } else {
//                         // creating new data 
//                         i.item_for = item_for;
//                         i.user_id = user_id;
//                         i.customer_id = existingInvoice.party
//                         await model.create({ ...i, invoice_id: invoiceId, is_return: true }, { transaction: trans })
//                     }
//                 }
//                 // let totalIds = order.sale_purchase_items.map(item => item.id)
//                 // let itemIds = items.map(item => item.id)
//                 let remaningIds = olddata.filter(item => !ids.includes(item))
//                 if (remaningIds.length) {
//                     await model.destroy({ where: { invoice_id: invoiceId, id: { [Op.in]: remaningIds }, is_return: true }, transaction: trans })
//                 }
//             }

//             // updateing Itemdata
//             await updatedata(Sale_Purchase_item, items, items_ids)
//             // Update tax calculations
//             const stateName = existingInvoice?.Billing?.state;
//             let taxData1 = calculateTaxes(stateName, items);
//             const total_Taxes = {
//                 grant_total: taxData1.grant_total,
//                 total_amount: taxData1.total_amount,
//                 total_cgst_amount: taxData1.total_cgst_amount,
//                 total_cgst_rate: taxData1.total_cgst_rate,
//                 total_igst_amount: taxData1.total_igst_amount,
//                 total_igst_rate: taxData1.total_igst_rate,
//                 total_sgst_amount: taxData1.total_sgst_amount,
//                 total_sgst_rate: taxData1.total_sgst_rate,
//                 total_gst_rate: taxData1.total_gst_rate,
//                 total_gst_amount: taxData1.total_gst_amount,
//                 round_off: taxData1.round_off,
//                 status_key: taxData1.status_key,
//                 invoice_id: invoiceId,
//                 customer_id: existingInvoice.party,
//                 is_return: true
//             }
//             // Delete existing tax records for this invoice
//             await Customer_details.decrement('credit_note', { by: existingInvoice.totalTax[0].grant_total, where: { id: existingInvoice.party }, transaction: trans })
//             await ItemTaxdata.destroy({ where: { invoice_id: invoiceId, is_return: true }, transaction: trans });
//             await Sale_Purchase_total_Tax.destroy({ where: { invoice_id: invoiceId, is_return: true }, transaction: trans });

//             // adding Tax
//             taxData1 = addInvoiceIDs(taxData1.taxData)
//             // creating Tax data
//             await ItemTaxdata.bulkCreate(taxData1, { transaction: trans })

//             // Total_tax delete and create

//             const totaltaxData = await Sale_Purchase_total_Tax.create(total_Taxes, { transaction: trans });
//             await Customer_details.increment('credit_note', { by: totaltaxData.grant_total, where: { id: existingInvoice.party }, transaction: trans });
//         } else if (item_for === '0') {
//             const addInvoiceID = (arr, user_id) => {
//                 return arr.map(item => {
//                     item.invoice_id = invoiceId;
//                     item.user_id = user_id;
//                     item.is_return = true
//                     return item;
//                 });
//             };

//             // Delete existing Sale_Purchase_total_Tax, ItemTaxdata, and Sale_Purchase_item records
//             await Sale_Purchase_total_Tax.destroy({ where: { invoice_id: invoiceId }, transaction: trans });
//             await ItemTaxdata.destroy({ where: { invoice_id: invoiceId }, transaction: trans });
//             await Customer_details.decrement('credit_note', { by: existingInvoice.totalTax[0].grant_total, where: { id: existingInvoice.party }, transaction: trans })
//             let updateIds = items.map(item => item.id)

//             await db.Sale_Purchase_Item.update({ invoice_id: invoiceId }, { where: { id: { [Op.in]: updateIds } }, transaction: trans })

//             await ItemTaxdata.bulkCreate(addInvoiceID(taxData), { transaction: trans });
//             // adding Total tax
//             totalTaxes.invoice_id = invoiceId;
//             totalTaxes.customer_id = existingInvoice.party;
//             const totaltaxData = await Sale_Purchase_total_Tax.create(totalTaxes, { transaction: trans });
//             await Customer_details.increment('credit_note', { by: totaltaxData.grant_total, where: { id: existingInvoice.party }, transaction: trans });
//         }
//         await trans.commit()
//         return RESPONSE.success(res, 8124, { id: invoiceId })
//     } catch (error) {
//         await trans.rollback();
//         console.log(error);
//         return RESPONSE.error(res, 9999);
//     }
// }

const updateReturn = async (req, res) => {
    let validation = new Validator(req.query, {
        // is_order: "required",
        invoiceId: "required",
        item_for: "required|in:0,1"    // 0 = sale && 1 = purchase
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const trans = await db.sequelize.transaction();
    try {
        let { user: { id: user_id }, query: { invoiceId, item_for }, body: { delivery_notes, internal_notes, items, /*taxData*/ total_taxes } } = req
        // let taxData;
        if (items?.length < 1) {
            await trans.rollback();
            return RESPONSE.error(res, 8110);
        };
        const existingInvoice = await Sale_Purchase_Invoice.findOne({
            where: {
                id: invoiceId,
                // is_order: is_order,
                item_for: item_for,
                is_return: true
            },
            include: [
                {
                    model: Customer_address,
                    as: "Billing"
                },
                {
                    model: Customer_address,
                    as: "Shipping"
                },
                {
                    model: Sale_Purchase_item
                },
                {
                    model: ItemTaxdata
                },
                {
                    model: Sale_Purchase_total_Tax,
                    as: 'totalTax'
                }
            ]
        });

        if (!existingInvoice) {
            await trans.rollback();
            return RESPONSE.error(res, 8111);
        }
        await existingInvoice.update({ delivery_notes, internal_notes })
        const addInvoiceIDs = (arr, user_id) => {
            return arr.map(item => {
                item.invoice_id = invoiceId;
                item.user_id = user_id;
                item.item_for = item_for;
                item.customer_id = existingInvoice.party;
                item.is_return = true
                return item;
            });
        };
        let items_ids = existingInvoice.sale_purchase_items.map(item => item.id)
        // let tax_id = existingInvoice.sale_purchase_taxes.map(item => item.id)
        const updatedata = async (model, updatedata, olddata) => {
            let ids = []
            for (let i of updatedata) {
                if (i.id) {
                    ids.push(i.id)
                    let updateId = i.id
                    delete i.id
                    // i.invoice_id = existingInvoice.id
                    // delete i.customer_id
                    await model.update(i, { where: { id: updateId, is_return: true }, transaction: trans })
                } else {
                    // creating new data 
                    i.item_for = item_for;
                    i.user_id = user_id;
                    i.customer_id = existingInvoice.party
                    await model.create({ ...i, invoice_id: invoiceId, is_return: true }, { transaction: trans })
                }
            }
            // let totalIds = order.sale_purchase_items.map(item => item.id)
            // let itemIds = items.map(item => item.id)
            let remaningIds = olddata.filter(item => !ids.includes(item))
            if (remaningIds.length) {
                await model.destroy({ where: { invoice_id: invoiceId, id: { [Op.in]: remaningIds }, is_return: true }, transaction: trans })
            }
        }

        // updateing Itemdata
        await updatedata(Sale_Purchase_item, items, items_ids)
        // Update tax calculations
        // const stateName = existingInvoice?.Billing?.state;
        const stateName = item_for === '1' ? existingInvoice?.Billing?.state : (existingInvoice?.Billing?.state || existingInvoice?.Billing?.state
        )
        let taxData = calculateTaxes(stateName, items);
        total_taxes = {
            grant_total: taxData.grant_total,
            total_amount: taxData.total_amount,
            total_cgst_amount: taxData.total_cgst_amount,
            total_cgst_rate: taxData.total_cgst_rate,
            total_igst_amount: taxData.total_igst_amount,
            total_igst_rate: taxData.total_igst_rate,
            total_sgst_amount: taxData.total_sgst_amount,
            total_sgst_rate: taxData.total_sgst_rate,
            total_gst_rate: taxData.total_gst_rate,
            total_gst_amount: taxData.total_gst_amount,
            round_off: taxData.round_off,
            status_key: taxData.status_key,
            invoice_id: invoiceId,
            customer_id: existingInvoice.party,
            is_return: true
        }
        // Delete existing tax records for this invoice
        await Customer_details.decrement('credit_note', { by: existingInvoice.totalTax[0].grant_total, where: { id: existingInvoice.party }, transaction: trans })
        await ItemTaxdata.destroy({ where: { invoice_id: invoiceId, is_return: true }, transaction: trans });
        await Sale_Purchase_total_Tax.destroy({ where: { invoice_id: invoiceId, is_return: true }, transaction: trans });

        // adding Tax
        taxData = addInvoiceIDs(taxData.taxData)
        // creating Tax data
        await ItemTaxdata.bulkCreate(taxData, { transaction: trans })

        // Total_tax delete and create

        const totaltaxData = await Sale_Purchase_total_Tax.create(total_taxes, { transaction: trans });
        await Customer_details.increment('credit_note', { by: totaltaxData.grant_total, where: { id: existingInvoice.party }, transaction: trans });

        await trans.commit()
        return RESPONSE.success(res, 8124, { id: invoiceId })
    } catch (error) {
        await trans.rollback();
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}
const deleteReturn = async (req, res) => {
    let validation = new Validator(req.query, {
        // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
        id: "required",
        item_for: "required|in:0,1"    // 0 = sale && 1 = purchase
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage));
    }
    const trans = await db.sequelize.transaction();
    try {
        const {
            query: { id, item_for },
        } = req;

        const ReturnInvoice = await Sale_Purchase_Invoice.findOne({
            where: {
                id,
                item_for,
            },
            // include: [
            //     {
            //         model: Sale_Purchase_total_Tax,
            //         as: 'totalTax'
            //     }
            // ]
        },
        );

        if (!ReturnInvoice) {
            await trans.rollback();
            return RESPONSE.error(res, 8111, 404);
        }

        // Check Party
        // const findparty = await Customer_details.findOne({
        //     where: {
        //         id: ReturnInvoice.party
        //     }
        // })
        // if (!findparty) {
        //     await trans.rollback();
        //     return RESPONSE.error(res, 8311)
        // }
        // Delete order
        await Sale_Purchase_Invoice.destroy({ where: { id, is_return: true }, transaction: trans });

        await ItemTaxdata.destroy({ where: { invoice_id: ReturnInvoice.id, is_return: true }, transaction: trans })
        await Sale_Purchase_total_Tax.destroy({ where: { invoice_id: ReturnInvoice.id, is_return: true }, transaction: trans })
        await Sale_Purchase_item.destroy({ where: { invoice_id: ReturnInvoice.id, is_return: true }, transaction: trans })



        await trans.commit()
        return RESPONSE.success(res, 8125);
    } catch (error) {
        await trans.rollback()
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};


module.exports = {
    addReturn,
    getReturn,
    updateReturn,
    deleteReturn
}