const db = require('../../config/db.config')
const { Sequelize, Op, where } = require('sequelize')
const Validator = require('validatorjs')
const Sale_Purchase_Invoice = db.Sale_Purchase_invoice
const ItemData = db.item_data
const ItemTaxdata = db.Sale_Purchase_Tax
const Sale_Purchase_item = db.Sale_Purchase_Item
const SerialNo_data = db.Sale_Purchase_serialNo
const Sale_Purchase_total_Tax = db.Sale_Purchase_total_tax
const partyAccount = db.Sale_Purchase_account
const stock_Unit = db.unit_measurement
const Hsns = db.hsn_data
const Customer_address = db.customer_address
const Customer_details = db.customer_details
const Customer_parters = db.customer_parters
const Customer_other_details = db.customer_other_details
const Prise_list_data = db.Price_List_Detail
const Price_list_Item = db.Price_List_Item
const GodownArea = db.godown_address
const { priceCalculation } = require('./Sale_Purchase_item.controller')
const Users = db.user
const { calculateTaxes } = require('./Sale_Purchase_Tax.controller')

// Add Invoicedata
const addInvoice = async (req, res) => {                                                                                                                                                                                                                                                                                                                                                              
  let validation = new Validator(req.query, {
    // date: "date",
    // "Sale_PurchaseInvoicedata.*.item_for": "required||in:0,1"    // 0 = sale && 1 = purchase,
    item_for: 'required|in:0,1'
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  const trans = await db.sequelize.transaction()
  try {
    let {
      user: { id: user_id },
      body: { Sale_PurchaseInvoicedata, items, taxData, total_taxes },
      query: { item_for }
    } = req
    // let { Sale_PurchaseInvoicedata, items, taxData, total_taxes } = body;
    // body.user_id = user_id;

    // let { item_for } = req.query
    if (items?.length < 1 || taxData?.length < 1) {
      await trans.rollback()
      return RESPONSE.error(res, 8110)
    }

    // check billing_address Id
    const findbillingId = await Customer_address.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.billing_address
      }
    })
    if (!findbillingId) {
      await trans.rollback()
      return RESPONSE.error(res, 8309)
    }
    // Check Serial Number
    const findnumberSRId = await SerialNo_data.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.number_series
      }
    })
    if (!findnumberSRId) {
      await trans.rollback()
      return RESPONSE.error(res, 8208)
    }
    // Check Party
    const findparty = await Customer_details.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.party
      },
      include: [
        {
          model: Customer_address,
          as: 'shipping',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        },
        {
          model: Customer_other_details
          //    as:"other details"
        },
        {
          model: Customer_address,
          as: 'billing',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        }
      ]
    })
    if (!findparty) {
      await trans.rollback()
      return RESPONSE.error(res, 8311)
    }
    // Check account
    const findaccount = await partyAccount.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.account
      }
    })
    if (!findaccount) {
      await trans.rollback()
      return RESPONSE.error(res, 8312)
    }

    // Check if serial number is repeated within the same number_series
    const duplicateSerialNumber = await Sale_Purchase_Invoice.findOne({
      where: {
        number_series: Sale_PurchaseInvoicedata.number_series,
        serial_number: Sale_PurchaseInvoicedata.serial_number
      }
    })

    if (duplicateSerialNumber) {
      await trans.rollback()
      return RESPONSE.error(res, 8209)
    }

    // Update last_number field
    const serialNumberParts =
      Sale_PurchaseInvoicedata.serial_number.split('-')[1]
    const numericPart = parseInt(serialNumberParts)
    if (isNaN(numericPart)) {
      await trans.rollback()
      return RESPONSE.error(res, 8210)
    }

    const updatedSerialNumber = await SerialNo_data.update(
      { last_number: numericPart },
      {
        where: { id: findnumberSRId.id },
        transaction: trans
      }
    )
    if (!updatedSerialNumber) {
      await trans.rollback()
      return RESPONSE.error(res, 8208)
    }
    // creating Invoice detail
    const Sale_PurchaseInvoice = await Sale_Purchase_Invoice.create(
      { ...Sale_PurchaseInvoicedata, item_for },
      { transaction: trans }
    )
    // old Outstanding(don"t move that part)
    const oldOutstandingAmount = Number(findparty?.outstanding_amount)

    // For Sale item_for === '0'
    if (item_for === '0') {
      // /* For Sale Order And Invoice*/
      //  check sale person
      const findsalePerson = await Users.findOne({
        where: {
          id: Sale_PurchaseInvoicedata.sales_person
        }
      })
      if (!findsalePerson) {
        await trans.rollback()
        return RESPONSE.error(res, 1008)
      }

      // check shipping_address Id
      const findshippingId = await Customer_address.findOne({
        where: {
          id: Sale_PurchaseInvoicedata.shipping_address
        }
      })
      if (!findshippingId) {
        await trans.rollback()
        return RESPONSE.error(res, 8310)
      }

      let creditLimit = Number(
        findparty?.customer_other_details[0].credit_limit
      )
      if (oldOutstandingAmount > creditLimit) {
        for (const item of items) {
          await Sale_Purchase_item.destroy({
            where: { id: item.id, invoice_id: null },
            transaction: trans
          })
        }
        await trans.commit()
        return RESPONSE.error(res, 8118)
      }

      // // creating Invoice detail
      // const Sale_PurchaseInvoice = await Sale_Purchase_Invoice.create({ ...Sale_PurchaseInvoicedata, item_for }, { transaction: trans })
      const addInvoiceID = arr => {
        return arr.map(item => {
          item.invoice_id = Sale_PurchaseInvoice.id
          return item
        })
      }
      // adding Item
      items = addInvoiceID(items)

      // items array and update the existing records
      for (const item of items) {
        await Sale_Purchase_item.update(item, {
          where: { id: item.id },
          transaction: trans
        })
      }

      // adding Tax
      taxData = addInvoiceID(taxData)
      // creating Tax data
      await ItemTaxdata.bulkCreate(taxData, { transaction: trans })

      // adding Total tax
      total_taxes.invoice_id = Sale_PurchaseInvoice.id
      total_taxes.customer_id = Sale_PurchaseInvoice.party
      // creating Total tax
      const totalTaxes = await Sale_Purchase_total_Tax.create(total_taxes, {
        transaction: trans
      })
      // order to invoice create that time order item delete
      if (Sale_PurchaseInvoicedata.order_reference) {
        const order = await Sale_Purchase_Invoice.findOne({
          where: {
            id: Sale_PurchaseInvoicedata.order_reference,
            is_order: 1
          },
          paranoid: false,
          include: [
            {
              model: Sale_Purchase_item,
              paranoid: false
            }
          ]
        })
        if (!order) {
          await trans.rollback()
          return RESPONSE.error(res, 8112)
        }
        // Order to invoice create
        let totalIds = order.sale_purchase_items.map(item => item.id)
        let itemIds = items.map(item => item.id)
        let remaningIds = totalIds.filter(item => !itemIds.includes(item))

        if (remaningIds.length) {
          await Sale_Purchase_item.restore({
            where: { id: { [Op.in]: remaningIds } },
            transaction: trans
          })
          const remaningItemData = await Sale_Purchase_item.findAll({
            where: {
              id: { [Op.in]: remaningIds }
            },
            paranoid: false
          })
          const newTaxdata = calculateTaxes(
            findparty?.shipping?.state,
            remaningItemData,
            Sale_PurchaseInvoicedata.cash_discount
          )

          // deleteing old tax datas
          await ItemTaxdata.destroy({
            where: { invoice_id: order.id },
            transaction: trans
          })

          //creating updated tax data
          await ItemTaxdata.bulkCreate(addInvoiceID(newTaxdata.taxData), {
            transaction: trans
          })

          // updating total taxes
          let newTotalTax = { ...newTaxdata }
          // const partyId = newTotalTax?.taxData[0].customer_id
          delete newTotalTax.taxData
          await Sale_Purchase_total_Tax.update(newTotalTax, {
            where: { invoice_id: order.id },
            transaction: trans
          })
        } else {
          await ItemTaxdata.destroy({
            where: { invoice_id: order.id },
            transaction: trans
          })
          await Sale_Purchase_total_Tax.destroy({
            where: { invoice_id: order.id },
            transaction: trans
          })
          await Sale_Purchase_item.destroy({
            where: { invoice_id: order.id },
            transaction: trans
          })
          await order.destroy({ transaction: trans })
        }
      }

      // Calculate the new outstanding amount if the invoice is not an order
      const newOutstandingAmount =
        Sale_PurchaseInvoicedata.is_order === false
          ? oldOutstandingAmount + Number(totalTaxes?.grant_total)
          : oldOutstandingAmount

      // // Update last_number field
      // const serialNumberParts = Sale_PurchaseInvoicedata.serial_number.split('-')[1];
      // const numericPart = parseInt(serialNumberParts);
      // if (isNaN(numericPart)) {
      //     await trans.rollback();
      //     return RESPONSE.error(res, 8210);
      // }

      // const updatedSerialNumber = await SerialNo_data.update(
      //     { last_number: numericPart },
      //     {
      //         where: { id: findnumberSRId.id },
      //         transaction: trans
      //     }
      // );
      // if (!updatedSerialNumber) {
      //     await trans.rollback();
      //     return RESPONSE.error(res, 8208);
      // }

      await Customer_details.update(
        {
          outstanding_amount: newOutstandingAmount,
          // ...(Sale_PurchaseInvoicedata.is_order == 0) && { outstanding_amount: (Number(findparty.outstanding_amount) + Number(totalTaxes.grant_total)) },
          billing_address: Sale_PurchaseInvoicedata.billing_address,
          shipping_address: Sale_PurchaseInvoicedata.shipping_address
        },
        {
          where: { id: Sale_PurchaseInvoicedata.party },
          transaction: trans
        }
      )

      if (
        !Sale_PurchaseInvoicedata.is_order &&
        newOutstandingAmount > creditLimit
      ) {
        const warningMsg =
          'Warning: The outstanding amount is close to the credit limit.'
        await trans.commit()
        return RESPONSE.success(
          res,
          Sale_PurchaseInvoicedata.is_order ? 8108 : 8101,
          { id: Sale_PurchaseInvoice.id, warning: warningMsg }
        )
      }
    } else if (item_for === '1') {
      const finddeliveryId = await GodownArea.findOne({
        where: {
          id: Sale_PurchaseInvoicedata.delivery_address
        }
      })
      if (!finddeliveryId) {
        await trans.rollback()
        return RESPONSE.error(res, 7306)
      }
      // creating Invoice detail
      // const Sale_PurchaseInvoice = await Sale_Purchase_Invoice.create({ ...Sale_PurchaseInvoicedata, item_for }, { transaction: trans })
      const addInvoiceID = arr => {
        return arr.map(item => {
          item.invoice_id = Sale_PurchaseInvoice.id
          ;(item.customer_id = Sale_PurchaseInvoice.party),
            (item.user_id = user_id),
            (item.item_for = item_for)
          return item
        })
      }

      // order to invoice create that time order item delete
      if (Sale_PurchaseInvoicedata.order_reference) {
        const order = await Sale_Purchase_Invoice.findOne({
          where: {
            id: Sale_PurchaseInvoicedata.order_reference,
            is_order: 1
          },
          include: [
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
        })

        if (!order) {
          await trans.rollback()
          return RESPONSE.error(res, 8112)
        }
        let stateName = findbillingId?.state
        let totalIds = order.sale_purchase_items.map(item => item.id)
        let tax_id = order.sale_purchase_taxes.map(item => item.id)
        let totalTax_id = order.totalTax.map(item => item.id)
        let payIds = items
          .map(item => item.id)
          .filter(item => item != undefined)
        let remaningIds = totalIds.filter(item => !payIds.includes(item))
        if (remaningIds.length) {
          let remainingItems = order.sale_purchase_items.filter(
            item => !payIds.includes(item.id)
          )
          // console.log(remainingItems, "remainingItems");
          let newTaxdata = calculateTaxes(stateName, remainingItems)
          const total_taxes = {
            grant_total: newTaxdata.grant_total,
            total_amount: newTaxdata.total_amount,
            total_cgst_amount: newTaxdata.total_cgst_amount,
            total_cgst_rate: newTaxdata.total_cgst_rate,
            total_igst_amount: newTaxdata.total_igst_amount,
            total_igst_rate: newTaxdata.total_igst_rate,
            total_sgst_amount: newTaxdata.total_sgst_amount,
            total_sgst_rate: newTaxdata.total_sgst_rate,
            total_gst_rate: newTaxdata.total_gst_rate,
            total_gst_amount: newTaxdata.total_gst_amount,
            round_off: newTaxdata.round_off,
            status_key: newTaxdata.status_key,
            invoice_id: order.id,
            customer_id: Sale_PurchaseInvoice.party
          }
          const addInvoiceIDs = arr => {
            return arr.map(item => {
              item.invoice_id = order.id
              ;(item.customer_id = Sale_PurchaseInvoice.party),
                (item.user_id = user_id),
                (item.item_for = item_for)
              return item
            })
          }
          // console.log(newTaxdata, "newTaxdata");
          // adding Tax
          newTaxdata = addInvoiceIDs(newTaxdata.taxData)
          await ItemTaxdata.destroy({
            where: { id: { [Op.in]: tax_id } },
            transaction: trans
          })
          // console.log(`taxdelete`, taxdelete);
          // creating Tax data
          await ItemTaxdata.bulkCreate(newTaxdata, { transaction: trans })
          // console.log(`taxcreate`, taxcreate);
          // delete total taxes
          await Sale_Purchase_total_Tax.destroy({
            where: { id: { [Op.in]: totalTax_id } },
            transaction: trans
          })
          // console.log(`tax_totalDelete`, tax_totalDelete);
          // creating Total tax
          await Sale_Purchase_total_Tax.create(total_taxes, {
            transaction: trans
          })
          // console.log(`tax_totalDelete`, tax_totalCreate);
        } else {
          await ItemTaxdata.destroy({
            where: { invoice_id: order.id },
            transaction: trans
          })
          await Sale_Purchase_total_Tax.destroy({
            where: { invoice_id: order.id },
            transaction: trans
          })
          // await Sale_Purchase_item.destroy({ where: { invoice_id: order.id }, transaction: trans })
          await order.destroy({ transaction: trans })
        }
        const updateData = async (model, updatedata) => {
          let ids = []
          for (let i of updatedata) {
            if (i.id) {
              ids.push(i.id)
              let updateId = i.id
              delete i.id
              i.invoice_id = Sale_PurchaseInvoice.id
              // delete i.invoice_id
              await model.update(i, {
                where: { id: updateId },
                transaction: trans
              })
            } else {
              // creating new data
              i.item_for = item_for
              i.user_id = user_id
              i.customer_id = Sale_PurchaseInvoicedata.party
              i.invoice_id = Sale_PurchaseInvoice.id
              await model.create(i, { transaction: trans })
            }
          }
          // if (ids.length) {
          //     await model.destroy({ where: { invoice_id: order.id, id: { [Op.in]: ids } }, transaction: trans })

          // }
        }
        await updateData(Sale_Purchase_item, items)
        // const stateName = findbillingId?.state
        let taxData1 = calculateTaxes(stateName, items)
        const total_taxes = {
          grant_total: taxData1.grant_total,
          total_amount: taxData1.total_amount,
          total_cgst_amount: taxData1.total_cgst_amount,
          total_cgst_rate: taxData1.total_cgst_rate,
          total_igst_amount: taxData1.total_igst_amount,
          total_igst_rate: taxData1.total_igst_rate,
          total_sgst_amount: taxData1.total_sgst_amount,
          total_sgst_rate: taxData1.total_sgst_rate,
          total_gst_rate: taxData1.total_gst_rate,
          total_gst_amount: taxData1.total_gst_amount,
          round_off: taxData1.round_off,
          status_key: taxData1.status_key,
          invoice_id: Sale_PurchaseInvoice.id,
          customer_id: Sale_PurchaseInvoice.party
        }

        // adding Tax
        taxData1 = addInvoiceID(taxData1.taxData)
        // creating Tax data
        await ItemTaxdata.bulkCreate(taxData1, { transaction: trans })
        // console.log(`invoicetax`, invoicetax);
        // creating Total tax
        await Sale_Purchase_total_Tax.create(total_taxes, {
          transaction: trans
        })
        // Calculate the new outstanding amount if the invoice is not an order
        const newOutstandingAmount =
          Sale_PurchaseInvoicedata.is_order === false
            ? oldOutstandingAmount + Number(total_taxes?.grant_total)
            : oldOutstandingAmount

        await Customer_details.update(
          {
            outstanding_amount: newOutstandingAmount,
            // ...(Sale_PurchaseInvoicedata.is_order == 0) && { outstanding_amount: (Number(findparty.outstanding_amount) + Number(totalTaxes.grant_total)) },
            billing_address: Sale_PurchaseInvoicedata.billing_address,
            delivery_address: Sale_PurchaseInvoicedata.delivery_address
          },
          {
            where: { id: Sale_PurchaseInvoicedata.party },
            transaction: trans
          }
        )
      } else {
        items = addInvoiceID(items)
        let newItems = items.map(item => {
          let newItem = { ...item }
          delete newItem.id
          return newItem
        })
        // creating Items
        await Sale_Purchase_item.bulkCreate(newItems, { transaction: trans })
        // const itemData = items
        const stateName = findbillingId?.state
        let taxData1 = calculateTaxes(stateName, items)
        const total_taxes = {
          grant_total: taxData1.grant_total,
          total_amount: taxData1.total_amount,
          total_cgst_amount: taxData1.total_cgst_amount,
          total_cgst_rate: taxData1.total_cgst_rate,
          total_igst_amount: taxData1.total_igst_amount,
          total_igst_rate: taxData1.total_igst_rate,
          total_sgst_amount: taxData1.total_sgst_amount,
          total_sgst_rate: taxData1.total_sgst_rate,
          total_gst_rate: taxData1.total_gst_rate,
          total_gst_amount: taxData1.total_gst_amount,
          round_off: taxData1.round_off,
          status_key: taxData1.status_key,
          invoice_id: Sale_PurchaseInvoice.id,
          customer_id: Sale_PurchaseInvoice.party
        }

        // adding Tax
        taxData1 = addInvoiceID(taxData1.taxData)
        // creating Tax data
        await ItemTaxdata.bulkCreate(taxData1, { transaction: trans })

        // // adding Total tax
        // total_taxes.invoice_id = Sale_PurchaseInvoice.id
        // total_taxes.customer_id = Sale_PurchaseInvoice.party
        // creating Total tax
        let totalTaxes = await Sale_Purchase_total_Tax.create(total_taxes, {
          transaction: trans
        })
        // Calculate the new outstanding amount if the invoice is not an order
        const newOutstandingAmount =
          Sale_PurchaseInvoicedata.is_order === false
            ? oldOutstandingAmount + Number(totalTaxes?.grant_total)
            : oldOutstandingAmount

        await Customer_details.update(
          {
            outstanding_amount: newOutstandingAmount,
            // ...(Sale_PurchaseInvoicedata.is_order == 0) && { outstanding_amount: (Number(findparty.outstanding_amount) + Number(totalTaxes.grant_total)) },
            billing_address: Sale_PurchaseInvoicedata.billing_address,
            delivery_address: Sale_PurchaseInvoicedata.delivery_address
          },
          {
            where: { id: Sale_PurchaseInvoicedata.party },
            transaction: trans
          }
        )
      }
    }
    await trans.commit()
    return RESPONSE.success(
      res,
      Sale_PurchaseInvoicedata.is_order ? 8108 : 8101,
      { id: Sale_PurchaseInvoice.id }
    )
  } catch (error) {
    await trans.rollback()
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

const addSalesInvoice = async (req, res) => {
  let validation = new Validator(req.body, {
    // date: "date",
    "Sale_PurchaseInvoicedata.*.item_for": "required||in:0,1"    // 0 = sale && 1 = purchase,
    // item_for: 'required|in:0,1'
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  const trans = await db.sequelize.transaction()
  try {
    let {
      user: { id: user_id },
      body: {
        // item_for,
        Sale_PurchaseInvoicedata,
        sale_purchase_items,
        sale_purchase_taxes,
        totalTax
      },
      // query: { item_for }
    } = req
    let item_for = Sale_PurchaseInvoicedata.item_for ;
    if (sale_purchase_items?.length < 1 || sale_purchase_taxes?.length < 1) {
      await trans.rollback()
      return RESPONSE.error(res, 8110)
    }
    // check billing_address Id
    const findbillingId = await Customer_address.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.billing_address
      }
    })
    if (!findbillingId) {
      await trans.rollback()
      return RESPONSE.error(res, 8309)
    }
    //  check sale person
    const findsalePerson = await Users.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.sales_person
      }
    })
    if (!findsalePerson) {
      await trans.rollback()
      return RESPONSE.error(res, 1008)
    }
    // check shipping_address Id
    const findshippingId = await Customer_address.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.shipping_address
      }
    })
    if (!findshippingId) {
      await trans.rollback()
      return RESPONSE.error(res, 8310)
    }

    // Check Serial Number
    const findnumberSRId = await SerialNo_data.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.number_series
      }
    })
    if (!findnumberSRId) {
      await trans.rollback()
      return RESPONSE.error(res, 8208)
    }
    // Check Party
    const findparty = await Customer_details.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.party
      },
      include: [
        {
          model: Customer_address,
          as: 'shipping',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        },
        {
          model: Customer_other_details
          //    as:"other details"
        },
        {
          model: Customer_address,
          as: 'billing',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        }
      ]
    })
    if (!findparty) {
      await trans.rollback()
      return RESPONSE.error(res, 8311)
    }
    // Check account
    const findaccount = await partyAccount.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.account
      }
    })
    if (!findaccount) {
      await trans.rollback()
      return RESPONSE.error(res, 8312)
    }

    // Check if serial number is repeated within the same number_series
    const duplicateSerialNumber = await Sale_Purchase_Invoice.findOne({
      where: {
        number_series: Sale_PurchaseInvoicedata.number_series,
        serial_number: Sale_PurchaseInvoicedata.serial_number
      }
    })

    if (duplicateSerialNumber) {
      await trans.rollback()
      return RESPONSE.error(res, 8209)
    }

    // Update last_number field
    const serialNumberParts =
      Sale_PurchaseInvoicedata.serial_number.split('-')[1]
    const numericPart = parseInt(serialNumberParts)
    if (isNaN(numericPart)) {
      await trans.rollback()
      return RESPONSE.error(res, 8210)
    }

    const updatedSerialNumber = await SerialNo_data.update(
      { last_number: numericPart },
      {
        where: { id: findnumberSRId.id },
        transaction: trans
      }
    )
    if (!updatedSerialNumber) {
      await trans.rollback()
      return RESPONSE.error(res, 8208)
    }
    
    // creating Invoice detail
    const Sale_PurchaseInvoice = await Sale_Purchase_Invoice.create(
      { ...Sale_PurchaseInvoicedata, item_for },
      { transaction: trans }
    )

    // old Outstanding(don"t move that part)
    const oldOutstandingAmount = Number(findparty?.outstanding_amount)
    let creditLimit = Number(findparty?.customer_other_details[0].credit_limit)
    if (oldOutstandingAmount > creditLimit) {
      await trans.commit()
      return RESPONSE.error(res, 8118)
    }
    const addInvoiceID = arr => {
      return arr.map(item => {
        item.invoice_id = Sale_PurchaseInvoice.id
        // item.customer_id = Sale_PurchaseInvoice.party,
        ;(item.user_id = user_id), (item.item_for = item_for)
        return item
      })
    }
    if (Sale_PurchaseInvoicedata.order_reference) {
      const order = await Sale_Purchase_Invoice.findOne({
        where: {
          id: Sale_PurchaseInvoicedata.order_reference,
          is_order: 1
        },
        include: [
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
      })

      if (!order) {
        await trans.rollback()
        return RESPONSE.error(res, 8112)
      }

      let OrderItemIds = order.sale_purchase_items.map(item => item.item_id)
      let tax_id = order.sale_purchase_taxes.map(item => item.id)
      let totalTax_id = order.totalTax.map(item => item.id)
      let itemIds = sale_purchase_items.map(item => item.item_id)
      let remaningIds = OrderItemIds.filter(item => !itemIds.includes(item))
      if (remaningIds.length) {
        await Sale_Purchase_item.destroy({
          where: { item_id: { [Op.not]: remaningIds }, invoice_id: order.id },
          transaction: trans
        })
        let remainingItems = order.sale_purchase_items.filter(
          item => !itemIds.includes(item.item_id)
        )
        let newTaxdata = calculateTaxes(
          findparty?.shipping?.state,
          remainingItems
        )
        const total_taxes = {
          grant_total: newTaxdata.grant_total,
          total_amount: newTaxdata.total_amount,
          total_cgst_amount: newTaxdata.total_cgst_amount,
          total_cgst_rate: newTaxdata.total_cgst_rate,
          total_igst_amount: newTaxdata.total_igst_amount,
          total_igst_rate: newTaxdata.total_igst_rate,
          total_sgst_amount: newTaxdata.total_sgst_amount,
          total_sgst_rate: newTaxdata.total_sgst_rate,
          total_gst_rate: newTaxdata.total_gst_rate,
          total_gst_amount: newTaxdata.total_gst_amount,
          round_off: newTaxdata.round_off,
          status_key: newTaxdata.status_key,
          invoice_id: order.id,
          customer_id: Sale_PurchaseInvoice.party
        }
        const addInvoiceIDs = arr => {
          return arr.map(item => {
            item.invoice_id = order.id
            ;(item.customer_id = Sale_PurchaseInvoice.party),
              (item.user_id = user_id),
              (item.item_for = item_for)
            return item
          })
        }
        // adding Tax
        newTaxdata = addInvoiceIDs(newTaxdata.taxData)
        await ItemTaxdata.destroy({
          where: { id: { [Op.in]: tax_id } },
          transaction: trans
        })
        // creating Tax data
        await ItemTaxdata.bulkCreate(newTaxdata, { transaction: trans })
        // delete total taxes
        await Sale_Purchase_total_Tax.destroy({
          where: { id: { [Op.in]: totalTax_id } },
          transaction: trans
        })
        // creating Total tax
        await Sale_Purchase_total_Tax.create(total_taxes, {
          transaction: trans
        })
      } else {
        await ItemTaxdata.destroy({
          where: { invoice_id: order.id },
          transaction: trans
        })
        await Sale_Purchase_total_Tax.destroy({
          where: { invoice_id: order.id },
          transaction: trans
        })
        await Sale_Purchase_item.destroy({
          where: { invoice_id: order.id },
          transaction: trans
        })
        await order.destroy({ transaction: trans })
      }
    }

    // adding Item
    sale_purchase_items = addInvoiceID(sale_purchase_items)
    await Sale_Purchase_item.bulkCreate(sale_purchase_items, {
      transaction: trans
    })

    // adding Tax
    sale_purchase_taxes = addInvoiceID(sale_purchase_taxes)
    // creating Tax data
    await ItemTaxdata.bulkCreate(sale_purchase_taxes, { transaction: trans })

    // adding Total tax
    totalTax.invoice_id = Sale_PurchaseInvoice.id
    // creating Total tax
    const totalTaxes = await Sale_Purchase_total_Tax.create(totalTax, {
      transaction: trans
    })

    const newOutstandingAmount =
      Sale_PurchaseInvoicedata.is_order === false
        ? oldOutstandingAmount + Number(totalTaxes?.grant_total)
        : oldOutstandingAmount

    await Customer_details.update(
      {
        outstanding_amount: newOutstandingAmount,
        // ...(Sale_PurchaseInvoicedata.is_order == 0) && { outstanding_amount: (Number(findparty.outstanding_amount) + Number(totalTaxes.grant_total)) },
        billing_address: Sale_PurchaseInvoicedata.billing_address,
        shipping_address: Sale_PurchaseInvoicedata.shipping_address
      },
      {
        where: { id: Sale_PurchaseInvoicedata.party },
        transaction: trans
      }
    )
    if (
      !Sale_PurchaseInvoicedata.is_order &&
      newOutstandingAmount > creditLimit
    ) {
      const warningMsg =
        'Warning: The outstanding amount is close to the credit limit.'
      await trans.commit()
      return RESPONSE.success(
        res,
        Sale_PurchaseInvoicedata.is_order ? 8108 : 8101,
        { id: Sale_PurchaseInvoice.id, warning: warningMsg }
      )
    }

    await trans.commit()
    return RESPONSE.success(
      res,
      Sale_PurchaseInvoicedata.is_order ? 8108 : 8101,
      { id: Sale_PurchaseInvoice.id }
    )
  } catch (error) {
    await trans.rollback()
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}
// Get Invoicedata
const getInvoice = async (req, res) => {
  let validation = new Validator(req.query, {
    is_order: 'required',
    item_for: 'required|in:0,1' // 0 = sale && 1 = purchase
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      query: { id, is_order, search, party, item_for }
    } = req

    let conditionWhere = { is_return: false }
    let conditionOffset = {}

    // Pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit)
    const offset = (page - 1) * limit
    // Search By  partyname and  serial_number
    if (search) {
      conditionWhere = {
        [Op.or]: {
          serial_number: {
            [Op.like]: `%${search}%`
          },
          '$customer_detail.firm_name$': {
            [Op.like]: `%${search}%`
          }
        },
        is_return: false,
        item_for: item_for
      }
    }

    // Search by Id
    if (is_order) {
      conditionWhere.is_order = is_order
    }
    // Search by id
    if (id) {
      conditionWhere.id = id
    }
    // serch by customer id
    if (party) {
      conditionWhere.party = party
    }
    // serch by refrence of sale purchase
    if (item_for) {
      conditionWhere.item_for = item_for
    }
    let excludeattributes = []
    let userattributes = []
    if (item_for === '0') {
      excludeattributes = [
        'purchase_manager',
        'purchase_invoice_number',
        'delivery_address'
      ]
      userattributes = ['id', 'email', 'mobile_number', 'role', 'name']
    } else if (item_for === '1') {
      excludeattributes = ['sales_person']
      userattributes = ['id', 'email', 'mobile_number', 'role', 'name']
    }
    // Offset condition
    if (limit && page) {
      conditionOffset.limit = limit
      conditionOffset.offset = offset
    }
    const Sale_PurchaseInvoicecount =
      await Sale_Purchase_Invoice.findAndCountAll({
        // where: {
        //     is_order,
        //     ...(id) && { id },
        // },
        where: conditionWhere,
        // attributes: { exclude: excludeattributes },
        include: [
          {
            model: Customer_details,
            required: true,
            include: [
              {
                model: Customer_address,
                as: 'billing'
              },
              {
                model: Customer_address,
                as: 'shipping'
              },
              {
                model: Customer_parters
              },
              {
                model: Customer_other_details
              }
            ]
          },
          {
            model: SerialNo_data
          },
          {
            model: Sale_Purchase_item,
            include: [
              {
                model: stock_Unit,
                attributes: [
                  'id',
                  'unit_of_measurement',
                  'uom_fullName',
                  'qty_deci_places'
                ]
              },
              {
                model: Hsns,
                attributes: ['id', 'hsn_code']
              }
            ]
          },
          {
            model: ItemTaxdata
          },
          {
            model: Sale_Purchase_total_Tax,
            as: 'totalTax'
          },
          {
            model: GodownArea,
            as: 'delivery',
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
          },
          item_for === '0'
            ? {
                model: Users,
                as: 'salesperson',
                attributes: userattributes,
                required: false
              }
            : {
                model: Users,
                as: 'purchaseManager',
                attributes: userattributes,
                required: false
              }
          // {
          //     ...(item_for === "0") && {
          //         model: Users,
          //         as: 'salesperson',
          //         attributes: userattributes,
          //         required: false
          //     }
          // },
          // {
          //     ...(item_for === "1") && {
          //         model: Users,
          //         as: 'purchaseManager',
          //         attributes: userattributes,
          //         required: false
          //     }
          // }
        ],
        order: [['createdAt', 'DESC']],
        ...conditionOffset,
        distinct: true
      })
    // const Sale_PurchaseInvoice = await Sale_Purchase_Invoice.findAll({
    //     // where: {
    //     //     is_order,
    //     //     ...(id) && { id },
    //     // },
    //     where: conditionWhere,
    //     // attributes: { exclude: excludeattributes },
    //     include: [
    //         {
    //             model: Customer_details,
    //             required: true,
    //             include: [
    //                 {
    //                     model: Customer_address,
    //                     as: 'billing',
    //                 },
    //                 {
    //                     model: Customer_address,
    //                     as: 'shipping',
    //                 },
    //                 {
    //                     model: Customer_parters
    //                 },
    //                 {
    //                     model: Customer_other_details,
    //                 }
    //             ]

    //         },
    //         {
    //             model: SerialNo_data,

    //         },
    //         {
    //             model: Sale_Purchase_item,
    //             include: [
    //                 {
    //                     model: stock_Unit,
    //                     attributes: ['id', 'unit_of_measurement', 'uom_fullName', 'qty_deci_places'],
    //                 },
    //                 {
    //                     model: Hsns,
    //                     attributes: ['id', 'hsn_code'],
    //                 }
    //             ]

    //         },
    //         {
    //             model: ItemTaxdata,
    //         },
    //         {
    //             model: Sale_Purchase_total_Tax,
    //             as: 'totalTax'
    //         },
    //         {
    //             model: GodownArea,
    //             as: 'delivery',
    //             attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
    //         },
    //         // item_for === "0" ? {
    //         //     model: Users,
    //         //     as: 'salesperson',
    //         //     attributes: userattributes,
    //         //     required: false
    //         // } : {
    //         //     model: Users,
    //         //     as: 'purchaseManager',
    //         //     attributes: userattributes,
    //         //     required: false
    //         // }
    //         // {
    //         //     ...(item_for === "0") && {
    //         //         model: Users,
    //         //         as: 'salesperson',
    //         //         attributes: userattributes,
    //         //         required: false
    //         //     }
    //         // },
    //         // {
    //         //     ...(item_for === "1") && {
    //         //         model: Users,
    //         //         as: 'purchaseManager',
    //         //         attributes: userattributes,
    //         //         required: false
    //         //     }
    //         // }
    //     ],
    //     order: [['createdAt', 'DESC']],
    //     // ...conditionOffset,
    //     // distinct: true
    // })
    if (id) {
      return RESPONSE.success(res, 8103, Sale_PurchaseInvoicecount.rows)
    }
    let responseData = {
      chatData: Sale_PurchaseInvoicecount.rows,
      page_information: {
        totalrecords: Sale_PurchaseInvoicecount.count,
        lastpage: Math.ceil(Sale_PurchaseInvoicecount.count / limit),
        currentpage: page,
        previouspage: 0 + (page - 1),
        nextpage:
          page < Math.ceil(Sale_PurchaseInvoicecount.count / limit)
            ? page + 1
            : 0
      }
    }
    return RESPONSE.success(res, is_order == 0 ? 8103 : 8107, responseData)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

// update  Account
const updateInvoice = async (req, res) => {
  let validation = new Validator(req.query, {
    // is_order: "required",
    item_for: 'required|in:0,1' // 0 = sale && 1 = purchase
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  const trans = await db.sequelize.transaction()
  try {
    let {
      user: { id: user_id },
      body: { Sale_PurchaseInvoicedata, items, taxData, total_taxes },
      query: { id: invoiceId, item_for }
    } = req
    // body.user_id = user_id;

    if (items?.length < 1 || taxData?.length < 1) {
      await trans.rollback()
      return RESPONSE.error(res, 8110)
    }
    const existingInvoice = await Sale_Purchase_Invoice.findOne({
      where: {
        id: invoiceId,
        // is_order: is_order,
        item_for: item_for,
        is_submitted: false
      },
      include: [
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
    })

    if (!existingInvoice) {
      await trans.rollback()
      return RESPONSE.error(res, 8111)
    }

    // const findtaxTotal = await Sale_Purchase_total_Tax.findOne({
    //     where: {
    //         invoice_id: invoiceId,
    //     },
    // })
    // const findtaxTotalAll = await Sale_Purchase_total_Tax.findAll({
    //     where: {
    //         invoice_id: invoiceId,
    //         deleted_at: { [Op.ne]: null },
    //         customer_id: Sale_PurchaseInvoicedata.party,
    //     },
    //     order: [['id', 'DESC']],
    //     paranoid: false,
    // })
    // console.log('existingInvoice', existingInvoice.totalTax[0].toJSON())
    let findtaxTotal = existingInvoice.totalTax[0].toJSON()
    let out_standing =
      Number(findtaxTotal?.grant_total) -
      Number(existingInvoice?.payment_received)

    if (out_standing == 0) {
      await trans.rollback()
      return RESPONSE.error(res, 8121)
    }
    // Check Party
    const findparty = await Customer_details.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.party
      },
      include: [
        {
          model: Customer_address,
          as: 'shipping',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        },
        {
          model: Customer_other_details
        }
      ]
    })
    if (!findparty) {
      await trans.rollback()
      return RESPONSE.error(res, 8311)
    }
    // check billing_address Id
    const findbillingId = await Customer_address.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.billing_address
      }
    })
    if (!findbillingId) {
      return RESPONSE.error(res, 8309)
    }
    // check serial number
    const findnumberSRId = await SerialNo_data.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.number_series
      }
    })

    if (!findnumberSRId) {
      await trans.rollback()
      return RESPONSE.error(res, 8208)
    }

    // check account
    const Isaccount = await partyAccount.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.account
      }
    })

    if (!Isaccount) {
      await trans.rollback()
      return RESPONSE.error(res, 8602)
    }
    const duplicateSerialNumber = await Sale_Purchase_Invoice.findOne({
      where: {
        number_series: Sale_PurchaseInvoicedata.number_series,
        serial_number: Sale_PurchaseInvoicedata.serial_number,
        id: {
          [Op.not]: invoiceId // Exclude the current invoiceId
        }
      }
    })

    if (duplicateSerialNumber) {
      await trans.rollback()
      return RESPONSE.error(res, 8209)
    }

    // Update Invoice data
    await existingInvoice.update(Sale_PurchaseInvoicedata, {
      transaction: trans
    })

    if (item_for === '0') {
      // check shipping_address Id
      const findshippingId = await Customer_address.findOne({
        where: {
          id: Sale_PurchaseInvoicedata.shipping_address
        }
      })
      if (!findshippingId) {
        await trans.rollback()
        return RESPONSE.error(res, 8310)
      }

      const addInvoiceID = (arr, user_id) => {
        return arr.map(item => {
          item.invoice_id = invoiceId
          item.user_id = user_id
          // item.item_for = item_for;
          // item.customer_id =Sale_PurchaseInvoicedata.party
          return item
        })
      }

      // Delete existing Sale_Purchase_total_Tax, ItemTaxdata, and Sale_Purchase_item records
      await Sale_Purchase_total_Tax.destroy({
        where: { invoice_id: invoiceId },
        transaction: trans
      })
      await ItemTaxdata.destroy({
        where: { invoice_id: invoiceId },
        transaction: trans
      })
      let updateIds = items.map(item => item.id)

      await db.Sale_Purchase_Item.update(
        { invoice_id: invoiceId },
        { where: { id: { [Op.in]: updateIds } }, transaction: trans }
      )

      await ItemTaxdata.bulkCreate(addInvoiceID(taxData), {
        transaction: trans
      })
      // adding Total tax
      total_taxes.invoice_id = invoiceId
      total_taxes.customer_id = Sale_PurchaseInvoicedata.party
      await Sale_Purchase_total_Tax.create(total_taxes, { transaction: trans })

      // await Sale_Purchase_item.bulkCreate(addInvoiceID(items, user_id), { transaction: trans })
      // Calculate the new outstanding amount if the invoice is not an order
      let creditLimit = Number(
        findparty?.customer_other_details[0].credit_limit
      )
      const newOutstandingAmount =
        Sale_PurchaseInvoicedata.is_order === false
          ? Number(findparty?.outstanding_amount) +
            Number(total_taxes?.grant_total) -
            Number(findtaxTotal?.grant_total)
          : Number(findparty?.outstanding_amount)

      await Customer_details.update(
        {
          ...(Sale_PurchaseInvoicedata.is_order == false && {
            outstanding_amount:
              Number(findparty.outstanding_amount) +
              Number(total_taxes?.grant_total) -
              Number(findtaxTotal?.grant_total)
          }),
          billing_address: Sale_PurchaseInvoicedata.billing_address,
          shipping_address: Sale_PurchaseInvoicedata.shipping_address
        },
        {
          where: { id: Sale_PurchaseInvoicedata.party },
          transaction: trans
        }
      )

      if (
        Sale_PurchaseInvoicedata.is_order == false &&
        Number(newOutstandingAmount) > creditLimit
      ) {
        const warningMsg =
          'Warning: The outstanding amount is close to the credit limit.'
        await trans.commit()
        return RESPONSE.success(
          res,
          Sale_PurchaseInvoicedata.is_order == false ? 8104 : 8114,
          { id: invoiceId, warning: warningMsg }
        )
      }
    } else if (item_for === '1') {
      const finddeliveryId = await GodownArea.findOne({
        where: {
          id: Sale_PurchaseInvoicedata.delivery_address
        }
      })
      if (!finddeliveryId) {
        await trans.rollback()
        return RESPONSE.error(res, 7306)
      }
      const addInvoiceIDs = (arr, user_id) => {
        return arr.map(item => {
          item.invoice_id = invoiceId
          item.user_id = user_id
          item.item_for = item_for
          item.customer_id = Sale_PurchaseInvoicedata.party
          return item
        })
      }
      // Update existing items and their related tax calculations
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
            await model.update(i, {
              where: { id: updateId },
              transaction: trans
            })
          } else {
            // creating new data
            i.item_for = item_for
            i.user_id = user_id
            i.customer_id = Sale_PurchaseInvoicedata.party
            await model.create(
              { ...i, invoice_id: invoiceId },
              { transaction: trans }
            )
          }
        }
        // let totalIds = order.sale_purchase_items.map(item => item.id)
        // let itemIds = items.map(item => item.id)
        let remaningIds = olddata.filter(item => !ids.includes(item))
        if (remaningIds.length) {
          await model.destroy({
            where: { invoice_id: invoiceId, id: { [Op.in]: remaningIds } },
            transaction: trans
          })
        }
        // if (ids.length) {
        //     await model.destroy({ where: { invoice_id: order.id, id: { [Op.in]: ids } }, transaction: trans })

        // }
      }

      // updateing Itemdata
      await updatedata(Sale_Purchase_item, items, items_ids)

      // Update tax calculations
      const stateName = findbillingId?.state
      let taxData1 = calculateTaxes(stateName, items)
      const total_Taxes = {
        grant_total: taxData1.grant_total,
        total_amount: taxData1.total_amount,
        total_cgst_amount: taxData1.total_cgst_amount,
        total_cgst_rate: taxData1.total_cgst_rate,
        total_igst_amount: taxData1.total_igst_amount,
        total_igst_rate: taxData1.total_igst_rate,
        total_sgst_amount: taxData1.total_sgst_amount,
        total_sgst_rate: taxData1.total_sgst_rate,
        total_gst_rate: taxData1.total_gst_rate,
        total_gst_amount: taxData1.total_gst_amount,
        round_off: taxData1.round_off,
        status_key: taxData1.status_key,
        invoice_id: invoiceId,
        customer_id: Sale_PurchaseInvoicedata.party
      }
      // Delete existing tax records for this invoice
      await ItemTaxdata.destroy({
        where: { invoice_id: invoiceId },
        transaction: trans
      })
      await Sale_Purchase_total_Tax.destroy({
        where: { invoice_id: invoiceId },
        transaction: trans
      })
      // adding Tax
      taxData1 = addInvoiceIDs(taxData1.taxData)
      // creating Tax data
      await ItemTaxdata.bulkCreate(taxData1, { transaction: trans })
      // await updatedata(ItemTaxdata, taxData1.taxData)
      // Total_tax delete and create

      await Sale_Purchase_total_Tax.create(total_Taxes, { transaction: trans })

      // await Sale_Purchase_item.bulkCreate(addInvoiceID(items, user_id), { transaction: trans })
      // // Calculate the new outstanding amount if the invoice is not an order
      // let creditLimit = Number(findparty?.customer_other_details[0].credit_limit)
      // const newOutstandingAmount = Sale_PurchaseInvoicedata.is_order === false
      //     ? Number(findparty?.outstanding_amount) + Number(total_taxes?.grant_total) - Number(findtaxTotal?.grant_total)
      //     : Number(findparty?.outstanding_amount);
      // console.log(`findparty.outstanding_amount`, findparty.outstanding_amount);
      // console.log(`total_taxes?.grant_total`, total_taxes?.grant_total);
      // console.log(`findtaxTotal?.grant_total`, findtaxTotal?.grant_total);
      await Customer_details.update(
        {
          ...(Sale_PurchaseInvoicedata.is_order == false && {
            outstanding_amount:
              Number(findparty.outstanding_amount) +
              Number(total_taxes?.grant_total) -
              Number(findtaxTotal?.grant_total)
          }),
          billing_address: Sale_PurchaseInvoicedata.billing_address,
          delivery_address: Sale_PurchaseInvoicedata.delivery_address
        },
        {
          where: { id: Sale_PurchaseInvoicedata.party },
          transaction: trans
        }
      )
      //   throw "eef"
    }

    await trans.commit()
    return RESPONSE.success(
      res,
      Sale_PurchaseInvoicedata.is_order == false ? 8104 : 8114,
      { id: invoiceId }
    )
  } catch (error) {
    await trans.rollback()
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

const updateSaleInvoice = async (req, res) => {
  let validation = new Validator(req.query, {
    // is_order: "required",
    item_for: 'required|in:0,1' // 0 = sale && 1 = purchase
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  const trans = await db.sequelize.transaction()
  try {
let {
  user: { id: user_id },
  body: {
    Sale_PurchaseInvoicedata,
    sale_purchase_items,
    sale_purchase_taxes,
    totalTax
  },
  query: { item_for }
} = req
if (sale_purchase_items?.length < 1 || sale_purchase_taxes?.length < 1) {
  await trans.rollback()
  return RESPONSE.error(res, 8110)
}

    const existingInvoice = await Sale_Purchase_Invoice.findOne({
      where: {
        id: invoiceId,
        // is_order: is_order,
        item_for: item_for,
        is_submitted: false
      },
      include: [
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
    })

    if (!existingInvoice) {
      await trans.rollback()
      return RESPONSE.error(res, 8111)
    }

    let findtaxTotal = existingInvoice.totalTax[0].toJSON()
    let out_standing =
      Number(findtaxTotal?.grant_total) -
      Number(existingInvoice?.payment_received)

    if (out_standing == 0) {
      await trans.rollback()
      return RESPONSE.error(res, 8121)
    }
    // Check Party
    const findparty = await Customer_details.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.party
      },
      include: [
        {
          model: Customer_address,
          as: 'shipping',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        },
        {
          model: Customer_other_details
        }
      ]
    })
    if (!findparty) {
      await trans.rollback()
      return RESPONSE.error(res, 8311)
    }
    // check billing_address Id
    const findbillingId = await Customer_address.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.billing_address
      }
    })
    if (!findbillingId) {
      return RESPONSE.error(res, 8309)
    }
    // check serial number
    const findnumberSRId = await SerialNo_data.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.number_series
      }
    })

    if (!findnumberSRId) {
      await trans.rollback()
      return RESPONSE.error(res, 8208)
    }

    // check account
    const Isaccount = await partyAccount.findOne({
      where: {
        id: Sale_PurchaseInvoicedata.account
      }
    })

    if (!Isaccount) {
      await trans.rollback()
      return RESPONSE.error(res, 8602)
    }
    // const duplicateSerialNumber = await Sale_Purchase_Invoice.findOne({
    //     where: {
    //         number_series: Sale_PurchaseInvoicedata.number_series,
    //         serial_number: Sale_PurchaseInvoicedata.serial_number,
    //         id: {
    //             [Op.not]: invoiceId, // Exclude the current invoiceId
    //         },
    //     }
    // });

    // if (duplicateSerialNumber) {
    //     await trans.rollback();
    //     return RESPONSE.error(res, 8209);
    // }

    // Update Invoice data
    await existingInvoice.update(Sale_PurchaseInvoicedata, {
      transaction: trans
    })

    if (item_for === '0') {
      // check shipping_address Id
      const findshippingId = await Customer_address.findOne({
        where: {
          id: Sale_PurchaseInvoicedata.shipping_address
        }
      })
      if (!findshippingId) {
        await trans.rollback()
        return RESPONSE.error(res, 8310)
      }

      const addInvoiceID = (arr, user_id) => {
        return arr.map(item => {
          item.invoice_id = invoiceId
          item.user_id = user_id
          // item.item_for = item_for;
          // item.customer_id =Sale_PurchaseInvoicedata.party
          return item
        })
      }
      let items_ids = existingInvoice.sale_purchase_items.map(item => item.id)

      const updatedata = async (model, updatedata, olddata) => {
        let ids = []
        for (let i of updatedata) {
          if (i.id) {
            ids.push(i.id)
            let updateId = i.id
            delete i.id
            // i.invoice_id = existingInvoice.id
            // delete i.customer_id
            await model.update(i, {
              where: { id: updateId },
              transaction: trans
            })
          } else {
            // creating new data
            i.item_for = item_for
            i.user_id = user_id
            i.customer_id = Sale_PurchaseInvoicedata.party
            await model.create(
              { ...i, invoice_id: invoiceId },
              { transaction: trans }
            )
          }
        }
        // let totalIds = order.sale_purchase_items.map(item => item.id)
        // let itemIds = items.map(item => item.id)
        let remaningIds = olddata.filter(item => !ids.includes(item))
        if (remaningIds.length) {
          await model.destroy({
            where: { invoice_id: invoiceId, id: { [Op.in]: remaningIds } },
            transaction: trans
          })
        }
        // if (ids.length) {
        //     await model.destroy({ where: { invoice_id: order.id, id: { [Op.in]: ids } }, transaction: trans })

        // }
      }

      // updateing Itemdata
      await updatedata(Sale_Purchase_item, items, items_ids)

      // // Delete existing Sale_Purchase_total_Tax, ItemTaxdata, and Sale_Purchase_item records
      // await Sale_Purchase_total_Tax.destroy({ where: { invoice_id: invoiceId }, transaction: trans });
      // await ItemTaxdata.destroy({ where: { invoice_id: invoiceId }, transaction: trans });
      // let updateIds = items.map(item => item.id)

      // await db.Sale_Purchase_Item.update({ invoice_id: invoiceId }, { where: { id: { [Op.in]: updateIds } }, transaction: trans })

      // await ItemTaxdata.bulkCreate(addInvoiceID(taxData), { transaction: trans });
      // // adding Total tax
      // total_taxes.invoice_id = invoiceId;
      // total_taxes.customer_id = Sale_PurchaseInvoicedata.party;
      // await Sale_Purchase_total_Tax.create(total_taxes, { transaction: trans });

      // // await Sale_Purchase_item.bulkCreate(addInvoiceID(items, user_id), { transaction: trans })
      // // Calculate the new outstanding amount if the invoice is not an order
      // let creditLimit = Number(findparty?.customer_other_details[0].credit_limit)
      // const newOutstandingAmount = Sale_PurchaseInvoicedata.is_order === false
      //     ? Number(findparty?.outstanding_amount) + Number(total_taxes?.grant_total) - Number(findtaxTotal?.grant_total)
      //     : Number(findparty?.outstanding_amount);

      // await Customer_details.update(
      //     {
      //         ...(Sale_PurchaseInvoicedata.is_order == false) && { outstanding_amount: (Number(findparty.outstanding_amount) + Number(total_taxes?.grant_total) - Number(findtaxTotal?.grant_total)) },
      //         billing_address: Sale_PurchaseInvoicedata.billing_address,
      //         shipping_address: Sale_PurchaseInvoicedata.shipping_address
      //     },
      //     {
      //         where: { id: Sale_PurchaseInvoicedata.party },
      //         transaction: trans
      //     },
      // )

      if (
        Sale_PurchaseInvoicedata.is_order == false &&
        Number(newOutstandingAmount) > creditLimit
      ) {
        const warningMsg =
          'Warning: The outstanding amount is close to the credit limit.'
        await trans.commit()
        return RESPONSE.success(
          res,
          Sale_PurchaseInvoicedata.is_order == false ? 8104 : 8114,
          { id: invoiceId, warning: warningMsg }
        )
      }
    } else if (item_for === '1') {
      const finddeliveryId = await GodownArea.findOne({
        where: {
          id: Sale_PurchaseInvoicedata.delivery_address
        }
      })
      if (!finddeliveryId) {
        await trans.rollback()
        return RESPONSE.error(res, 7306)
      }
      const addInvoiceIDs = (arr, user_id) => {
        return arr.map(item => {
          item.invoice_id = invoiceId
          item.user_id = user_id
          item.item_for = item_for
          item.customer_id = Sale_PurchaseInvoicedata.party
          return item
        })
      }
      // Update existing items and their related tax calculations
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
            await model.update(i, {
              where: { id: updateId },
              transaction: trans
            })
          } else {
            // creating new data
            i.item_for = item_for
            i.user_id = user_id
            i.customer_id = Sale_PurchaseInvoicedata.party
            await model.create(
              { ...i, invoice_id: invoiceId },
              { transaction: trans }
            )
          }
        }
        // let totalIds = order.sale_purchase_items.map(item => item.id)
        // let itemIds = items.map(item => item.id)
        let remaningIds = olddata.filter(item => !ids.includes(item))
        if (remaningIds.length) {
          await model.destroy({
            where: { invoice_id: invoiceId, id: { [Op.in]: remaningIds } },
            transaction: trans
          })
        }
        // if (ids.length) {
        //     await model.destroy({ where: { invoice_id: order.id, id: { [Op.in]: ids } }, transaction: trans })

        // }
      }

      // updateing Itemdata
      await updatedata(Sale_Purchase_item, items, items_ids)

      // Update tax calculations
      const stateName = findbillingId?.state
      let taxData1 = calculateTaxes(stateName, items)
      const total_Taxes = {
        grant_total: taxData1.grant_total,
        total_amount: taxData1.total_amount,
        total_cgst_amount: taxData1.total_cgst_amount,
        total_cgst_rate: taxData1.total_cgst_rate,
        total_igst_amount: taxData1.total_igst_amount,
        total_igst_rate: taxData1.total_igst_rate,
        total_sgst_amount: taxData1.total_sgst_amount,
        total_sgst_rate: taxData1.total_sgst_rate,
        total_gst_rate: taxData1.total_gst_rate,
        total_gst_amount: taxData1.total_gst_amount,
        round_off: taxData1.round_off,
        status_key: taxData1.status_key,
        invoice_id: invoiceId,
        customer_id: Sale_PurchaseInvoicedata.party
      }
      // Delete existing tax records for this invoice
      await ItemTaxdata.destroy({
        where: { invoice_id: invoiceId },
        transaction: trans
      })
      await Sale_Purchase_total_Tax.destroy({
        where: { invoice_id: invoiceId },
        transaction: trans
      })
      // adding Tax
      taxData1 = addInvoiceIDs(taxData1.taxData)
      // creating Tax data
      await ItemTaxdata.bulkCreate(taxData1, { transaction: trans })
      // await updatedata(ItemTaxdata, taxData1.taxData)
      // Total_tax delete and create

      await Sale_Purchase_total_Tax.create(total_Taxes, { transaction: trans })

      // await Sale_Purchase_item.bulkCreate(addInvoiceID(items, user_id), { transaction: trans })
      // // Calculate the new outstanding amount if the invoice is not an order
      // let creditLimit = Number(findparty?.customer_other_details[0].credit_limit)
      // const newOutstandingAmount = Sale_PurchaseInvoicedata.is_order === false
      //     ? Number(findparty?.outstanding_amount) + Number(total_taxes?.grant_total) - Number(findtaxTotal?.grant_total)
      //     : Number(findparty?.outstanding_amount);
      // console.log(`findparty.outstanding_amount`, findparty.outstanding_amount);
      // console.log(`total_taxes?.grant_total`, total_taxes?.grant_total);
      // console.log(`findtaxTotal?.grant_total`, findtaxTotal?.grant_total);
      await Customer_details.update(
        {
          ...(Sale_PurchaseInvoicedata.is_order == false && {
            outstanding_amount:
              Number(findparty.outstanding_amount) +
              Number(total_taxes?.grant_total) -
              Number(findtaxTotal?.grant_total)
          }),
          billing_address: Sale_PurchaseInvoicedata.billing_address,
          delivery_address: Sale_PurchaseInvoicedata.delivery_address
        },
        {
          where: { id: Sale_PurchaseInvoicedata.party },
          transaction: trans
        }
      )
    }

    await trans.commit()
    return RESPONSE.success(
      res,
      Sale_PurchaseInvoicedata.is_order == false ? 8104 : 8114,
      { id: invoiceId }
    )
  } catch (error) {
    await trans.rollback()
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}
// Delete  Account
const deleteInvoice = async (req, res) => {
  let validation = new Validator(req.query, {
    // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
    id: 'required',
    is_order: 'required',
    item_for: 'required|in:0,1' // 0 = sale && 1 = purchase
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  const trans = await db.sequelize.transaction()
  try {
    const {
      query: { id, is_order, item_for }
    } = req

    const Invoicedata = await Sale_Purchase_Invoice.findOne({
      where: {
        id,
        is_order,
        item_for
      },
      include: [
        {
          model: Sale_Purchase_total_Tax,
          as: 'totalTax'
        }
      ]
    })

    if (!Invoicedata) {
      await trans.rollback()
      return RESPONSE.error(res, is_order == 0 ? 8111 : 8112, 404)
    }

    // Check Party
    const findparty = await Customer_details.findOne({
      where: {
        id: Invoicedata.party
      }
    })
    if (!findparty) {
      await trans.rollback()
      return RESPONSE.error(res, 8311)
    }
    let finalCancled = 0
    // Delete Invoicedata item
    if (
      (item_for === '0' && is_order === '1') ||
      (item_for === '1' && Invoicedata.payment_received === '0.00')
    ) {
      // Delete order
      await Sale_Purchase_Invoice.destroy({
        where: { id, is_order },
        transaction: trans
      })

      await ItemTaxdata.destroy({
        where: { invoice_id: Invoicedata.id },
        transaction: trans
      })
      await Sale_Purchase_total_Tax.destroy({
        where: { invoice_id: Invoicedata.id },
        transaction: trans
      })
      await Sale_Purchase_item.destroy({
        where: { invoice_id: Invoicedata.id },
        transaction: trans
      })

      if (
        item_for === '1' &&
        is_order === '0' &&
        Invoicedata.payment_received === '0.00'
      ) {
        await Customer_details.update(
          {
            outstanding_amount:
              Number(findparty.outstanding_amount) -
              (Number(Invoicedata.totalTax[0]?.grant_total) +
                Number(Invoicedata.payment_received))
          },
          {
            where: { id: Invoicedata.party },
            transaction: trans
          }
        )
      }
    } else if (item_for === '0' && is_order === '0') {
      if (Invoicedata.payment_received === '0.00') {
        await Sale_Purchase_Invoice.update(
          { is_cancel: true },
          { where: { id, is_order, payment_received: 0.0 }, transaction: trans }
        )
        await Customer_details.update(
          {
            outstanding_amount:
              Number(findparty.outstanding_amount) -
              (Number(Invoicedata.totalTax[0]?.grant_total) +
                Number(Invoicedata.payment_received))
          },
          {
            where: { id: Invoicedata.party },
            transaction: trans
          }
        )
        finalCancled = 1
      }
    }

    await trans.commit()
    // return RESPONSE.success(res, is_order == 0 && Invoicedata.is_cancel == true ? 8105 : is_order == 0 && Invoicedata.is_cancel == false ? 8116 : 8115);
    return RESPONSE.success(
      res,
      is_order == 0 && Invoicedata.payment_received === '0.00'
        ? finalCancled == 1
          ? 8105
          : 8116
        : is_order == 0
        ? 8120
        : 8115
    )
  } catch (error) {
    await trans.rollback()
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

const revertData = async (req, res) => {
  try {
    const { id, item_for } = req.query
    const revertData = await Sale_Purchase_Invoice.findOne({
      where: { id: id, is_order: 0, item_for },
      include: [
        {
          model: Sale_Purchase_total_Tax,
          as: 'totalTax'
        },
        {
          model: Customer_details
        }
      ]
    })
    if (!revertData) {
      return RESPONSE.error(res, 8111)
    }
    await revertData.update({ is_cancel: false })
    await Customer_details.update(
      {
        outstanding_amount:
          Number(revertData.customer_detail.outstanding_amount) +
          (Number(revertData?.totalTax[0]?.grant_total) -
            Number(revertData.payment_received))
      },
      {
        where: { id: revertData.party }
      }
    )
    return RESPONSE.success(res, 8117)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

const ItemUpdatepriceList = async (req, res) => {
  let validation = new Validator(req.query, {
    price_list_id: 'required'
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      query: {
        price_list_id,
        invoice_id,
        item_for,
        customer_id,
        cash_discount
      },
      user: { id: user_id }
    } = req
    const isPriceListdata = await Prise_list_data.findOne({
      where: {
        id: price_list_id,
        is_price_enable: true
      },
      include: [
        {
          model: Price_list_Item,
          include: [
            {
              model: ItemData
            }
          ]
        }
      ]
    })
    if (!isPriceListdata) {
      return RESPONSE.error(res, 7105)
    }
    // Check Customer
    const findCustomer = await Customer_details.findOne({
      where: {
        id: customer_id
      },
      include: [
        {
          model: Customer_address,
          as: 'shipping',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        },
        {
          model: Customer_other_details
        }
      ]
    })
    if (!findCustomer) {
      return RESPONSE.error(res, 8311)
    }
    let ids = invoice_id.split(',')[1]
    let old_ids = invoice_id.split(',')
    let invoice_ids = {
      [Op.or]: [{ [Op.eq]: ids }, { [Op.is]: null }]
    }
    const SaleitemData = await Sale_Purchase_item.findAll({
      where: {
        customer_id: customer_id,
        item_for: item_for,
        invoice_id: invoice_ids
      }
    })
    if (!SaleitemData) {
      return RESPONSE.error(res, 8806)
    }
    const responseDataList = []
    for (const SaleitemDataList of SaleitemData) {
      const item_name = SaleitemDataList.item_name
      const quantity = SaleitemDataList.billing_quantity
      const itemData = await ItemData.findOne({
        where: {
          item_name: item_name,
          item_for: item_for,
          user_id
        }
      })
      if (!itemData) {
        return RESPONSE.error(res, 8806)
      }
      const responseData = await priceCalculation(
        itemData,
        isPriceListdata,
        quantity,
        item_name /*, cashDiscount*/
      )
      const data = {
        item_name,
        shipping_quantity: responseData.shipping_quantity,
        billing_quantity: quantity,
        rate: responseData.rate,
        net_rate: responseData.net_rate,
        amount: responseData.amount,
        taxed_amount: responseData.taxed_amount,
        discount_scheme: responseData.discount_scheme,
        free_scheme: responseData.free_scheme
      }

      const updatedData = await SaleitemDataList.update(data)
      responseDataList.push(updatedData)
    }
    // const updateItem = await Promise.all(SaleitemData.map((SaleitemDataList, index) => {
    //     return SaleitemDataList.update(responseDataList[index]);
    // }));
    const ItemId = responseDataList.map(item => item.id)
    const remaningItemData = await Sale_Purchase_item.findAll({
      where: {
        id: { [Op.in]: ItemId },
        invoice_id: invoice_ids,
        customer_id: customer_id
      }
    })

    let newTaxdata = calculateTaxes(
      findCustomer?.shipping?.state,
      remaningItemData,
      cash_discount
    )
    // console.log("newTaxdata ===   ", newTaxdata);
    // Delete Item Tax data
    await ItemTaxdata.destroy({
      where: {
        invoice_id: invoice_ids,
        customer_id: customer_id == 0 ? null : customer_id
      }
    })
    await Sale_Purchase_total_Tax.destroy({
      where: {
        invoice_id: invoice_ids,
        customer_id: customer_id == 0 ? null : customer_id
      }
    })
    //creating updated tax data
    let InvoiceId = old_ids.length == 1 ? null : old_ids[1]
    // Invoice_id Store  in new Tax data
    newTaxdata.taxData.forEach(item => {
      item.invoice_id = InvoiceId
    })
    // console.log("newTaxdata.taxData ===   ", newTaxdata.taxData);
    // await ItemTaxdata.bulkCreate(newTaxdata.taxData, { where: { invoice_id: invoice_ids, customer_id: customer_id } })
    await ItemTaxdata.bulkCreate(newTaxdata.taxData)

    // updating total taxes
    // console.log("newTaxdata ===   ", newTaxdata);
    let newTotalTax = { ...newTaxdata }
    delete newTotalTax.taxData
    newTotalTax.customer_id = customer_id
    newTotalTax.invoice_id = ids || null
    // console.log("newTotalTax ===   ", newTotalTax);
    // await Sale_Purchase_total_Tax.update(newTotalTax, { where: { invoice_id: invoice_ids, customer_id: customer_id == 0 ? null : customer_id } })
    await Sale_Purchase_total_Tax.create(newTotalTax)

    return RESPONSE.success(res, 7005)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

const FinalSubbmitted = async (req, res) => {
  let validation = new Validator(req.query, {
    invoice_id: 'required'
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      query: { invoice_id }
    } = req
    const invoiceData = await Sale_Purchase_Invoice.findOne({
      where: {
        id: invoice_id,
        is_submitted: false
      },
      include: [
        {
          model: Sale_Purchase_total_Tax,
          as: 'totalTax'
        },
        {
          model: Customer_details
        }
      ]
    })
    if (!invoiceData) {
      return RESPONSE.error(res, 8111)
    }
    invoiceData.is_submitted = true
    await invoiceData.save()

    // console.log(`invoiceData?.totalTax[0]?.grant_total`,invoiceData?.totalTax[0]?.grant_total );
    // console.log(`invoiceData?.customer_detail?.outstanding_amount`, invoiceData?.customer_detail?.outstanding_amount);
    // console.log(`invoiceData?.payment_received`, invoiceData?.payment_received);
    await Customer_details.update(
      {
        outstanding_amount:
          Number(invoiceData?.customer_detail?.outstanding_amount) +
          Number(invoiceData?.totalTax[0]?.grant_total) -
          Number(invoiceData?.payment_received)
      },
      {
        where: {
          id: invoiceData.party
        }
      }
    )
    return RESPONSE.success(res, 8119)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

const ReturnInvoice = async (req, res) => {
  try {
    const {
      query: { invoiceId, item_for }
    } = req

    const returnInvoice = await Sale_Purchase_Invoice.findOne({
      where: { id: invoiceId, item_for: item_for }
    })
    if (!returnInvoice) {
      return RESPONSE.error(res, 'Invoice not exist')
    }

    if (item_for === '0') {
    } else if (item_for === '1') {
      const ReturnItem = await Sale_Purchase_item.findAll({
        where: {
          invoice_id: invoiceId,
          item_for: 1,
          customer_id: returnInvoice.party
        }
      })
      console.log(`ReturnItem`, ReturnItem)
      for (const i of ReturnItem) {
        console.log(`i`, i.id)
      }
    }
    return RESPONSE.success(res, 'Return Item Sucessfully')
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

module.exports = {
  addInvoice,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  revertData,
  ItemUpdatepriceList,
  FinalSubbmitted,
  ReturnInvoice,
  addSalesInvoice
}
