const db = require('../../config/db.config')
const { Sequelize, Op } = require('sequelize')
const Sale_PurchaseItem = db.Sale_Purchase_Item
// const Sale_Purchasedummy = db.Sale_Purchase_dummy
const ItemData = db.item_data
const stock_Unit = db.unit_measurement
const Sale_Purchase_item = db.Sale_Purchase_Item
const Hsns = db.hsn_data
const Customer_other_details = db.customer_other_details
const Prise_list_data = db.Price_List_Detail
const Price_list_Item = db.Price_List_Item
const Customer_address = db.customer_address
const Sale_Purchase_Invoice = db.Sale_Purchase_invoice
const Item_Stock = db.Item_stock

const Validator = require('validatorjs')
const { calculateTaxes } = require('./Sale_Purchase_Tax.controller')

const FreeScheme = (quantity, freeScheme) => {
  if (!freeScheme) {
    return quantity
  }
  let [baseQuantity, freeQuantity] = freeScheme.split('+').map(Number)
  let totalQuantity =
    Number(quantity) +
    Number(Math.floor(quantity / baseQuantity) * freeQuantity)
  return totalQuantity
}

const priceCalculation = async (
  itemData,
  isPriceListdata,
  quantity,
  item_name /*, cashDiscount = 0*/
) => {
  // console.log('itemData', itemData)
  let matchedPriceListItem
  // Find the matching item data based on the provided item_name in isPriceListdata
  if (isPriceListdata) {
    for (const priceListItem of isPriceListdata?.price_list_items) {
      if (priceListItem.item_data.item_name === item_name) {
        // if (priceListItem.item_name_text === item_name) {
        matchedPriceListItem = priceListItem
        break
      }
    }
  }
  let itemRate, discountScheme, freeScheme
  let Cost_rate = itemData.current_cost
  if (matchedPriceListItem) {
    // itemRate = matchedPriceListItem.rate;
    // discountScheme = matchedPriceListItem.discount_scheme;
    // freeScheme = matchedPriceListItem.free_scheme;
    // if (!itemRate || !discountScheme || !freeScheme) {
    //     itemRate = itemRate || itemData.rate;
    //     discountScheme = discountScheme || itemData.discount_scheme;
    //     freeScheme = freeScheme || itemData.free_scheme;
    // }
    itemRate = matchedPriceListItem.rate || itemData?.rate
    discountScheme =
      matchedPriceListItem.discount_scheme || itemData?.discount_scheme
    freeScheme = matchedPriceListItem.free_scheme || itemData?.free_scheme
  } else {
    // Item does not exist in Price_list_Item, use the data from ItemData
    itemRate = itemData?.rate
    discountScheme = itemData?.discount_scheme
    freeScheme = itemData?.free_scheme
  }
  let net_rate = itemRate
  discountScheme?.split('+').forEach(item => {
    let dis_rate = (net_rate * item) / 100
    net_rate = Number((net_rate - dis_rate).toFixed(2))
  })
  let max_rate = Math.max(net_rate, Cost_rate)
  // Check if the item scheme is valid based on the scheme_date
  const currentDate = new Date()
  const schemeDate = new Date(itemData.scheme_valid_by_date)
  let shipping_quantity

  if (currentDate <= schemeDate) {
    shipping_quantity = FreeScheme(quantity, freeScheme)
  } else {
    shipping_quantity = quantity
  }
  // GST Calculation

  const tax1 = parseFloat(itemData?.tax_category.split('-')?.[1] || 0)
  const amount = (quantity * max_rate).toFixed(2)
  // const Cash_Discount = Number(((amount * (cashDiscount / 100))).toFixed(2))
  // const cash_discount = Number(amount) - Number(Cash_Discount.toFixed(2))
  const taxed_amount =
    Number(amount) + Number((amount * (tax1 / 100)).toFixed(2))
  return {
    tax: itemData.tax_category,
    shipping_quantity: shipping_quantity,
    billing_quantity: quantity,
    item_name,
    mrp: itemData.mrp,
    rate: itemRate,
    net_rate: max_rate,
    stock_unit: itemData.unit_of_measurement,
    hsn: itemData.hsn,
    description: itemData.invoice_description,
    amount: amount,
    // cash_discount_amount: cash_discount,
    taxed_amount: taxed_amount,
    scheme_date: schemeDate,
    discount_scheme: discountScheme,
    free_scheme: freeScheme,
    item_id: itemData.id
  }
}

// const calculateTaxes = (stateName, itemData, cashDiscount = 0) => {
//     // const stateName = customerdata?.shipping?.state
//     let taxData = [];

//     let grant_total = 0, total_sgst_rate = 0, total_cgst_rate = 0, total_sgst_amount = 0, total_cgst_amount = 0, total_igst_amount = 0, total_igst_rate = 0, total_discount = 0, total_amount = 0;
//     itemData.forEach((item) => {
//         let Party = item.customer_id
//         const itemName = item.item_name;
//         const itemTax = item?.tax;
//         const itemAmount = Number(item.amount).toFixed(2);
//         const quantity = item.billing_quantity || item.quantity
//         // const itemRate = item.rate;
//         let taxPercentage = parseFloat(itemTax?.split('-')?.[1]);
//         taxPercentage = isNaN(taxPercentage) ? 0 : taxPercentage
//         const Cash_Discount = Number(((itemAmount * (cashDiscount / 100))).toFixed(2))
//         const cash_discount = Number(itemAmount) - Number(Cash_Discount.toFixed(2))
//         let sgst_amount = 0, cgst_amount = 0, igst_amount = 0, sgst_rate = 0, cgst_rate = 0, taxedAmount = 0, igst_rate = 0;
//         if (stateName?.toUpperCase() === 'GUJARAT-24') {
//             sgst_rate = Number((taxPercentage / 2).toFixed(2));
//             cgst_rate = Number((taxPercentage / 2).toFixed(2));
//             sgst_amount = Number((((Number(cash_discount)) * sgst_rate) / 100).toFixed(2));
//             cgst_amount = Number((((Number(cash_discount)) * cgst_rate) / 100).toFixed(2));
//             taxedAmount = Number((Number(cash_discount) + Number(sgst_amount) + Number(cgst_amount))).toFixed(2);
//             total_sgst_rate += sgst_rate;
//             total_cgst_rate += cgst_rate;
//             total_sgst_amount += sgst_amount;
//             total_cgst_amount += cgst_amount;

//         } else {
//             igst_rate = Number(taxPercentage.toFixed(2))
//             igst_amount = Number((((Number(cash_discount)) * taxPercentage) / 100).toFixed(2))
//             taxedAmount = Number((Number(cash_discount) + Number(igst_amount)).toFixed(2));
//             total_igst_rate += igst_rate;
//             total_igst_amount += igst_amount;
//         }

//         taxData.push({
//             customer_id: Party,
//             item_name: itemName,
//             total_gst: taxPercentage,
//             tax: itemTax,
//             amount: (Number(itemAmount)),
//             discounted_amount: (Number(cash_discount)),
//             sgst_rate: sgst_rate,
//             cgst_rate: cgst_rate,
//             sgst_amount: sgst_amount,
//             cgst_amount: cgst_amount,
//             igst_rate: igst_rate,
//             igst_amount: igst_amount,
//             taxed_amount: taxedAmount,
//             quantity: quantity
//         });
//         total_amount += Number(itemAmount)
//         total_discount += Number(Cash_Discount);
//         grant_total += Number(taxedAmount);

//     });
//     // Calculate the rounded grant_total
//     // let roundedGrantTotal = Math.round(grant_total * 2) / 2;
//     let roundedGrantTotal = Number(grant_total).toFixed(2)
//     // Get the Round off value by  fraction part
//     let fractionalPart = (roundedGrantTotal % 1).toFixed(2);
//     // If the fractional part is 0.49 or less, round down; otherwise, round up
//     let round_off = fractionalPart <= 0.49 ? Number(fractionalPart) : Number(fractionalPart) - 1;
//     // If the fractional part is 0.49 or less, round down (minus); otherwise, round up (plus)
//     roundedGrantTotal = fractionalPart <= 0.49 ? Math.floor(roundedGrantTotal) : Math.ceil(roundedGrantTotal);
//     return {
//         taxData,
//         round_off: (-Number(round_off.toFixed(2))),
//         grant_total: roundedGrantTotal.toFixed(2),
//         total_discount: total_discount.toFixed(2),
//         total_amount: total_amount.toFixed(2),
//         total_gst_rate: Number(stateName.toUpperCase() === 'GUJARAT-24' ? (total_sgst_rate + total_cgst_rate) : total_igst_rate).toFixed(2),
//         total_gst_amount: Number(stateName.toUpperCase() === 'GUJARAT-24' ? (total_sgst_amount + total_cgst_amount) : total_igst_amount).toFixed(2),
//         total_sgst_rate: total_sgst_rate.toFixed(2),
//         total_cgst_rate: total_cgst_rate.toFixed(2),
//         total_sgst_amount: total_sgst_amount.toFixed(2),
//         total_cgst_amount: total_cgst_amount.toFixed(2),
//         total_igst_rate: total_igst_rate.toFixed(2),
//         total_igst_amount: total_igst_amount.toFixed(2),
//         status_key: stateName.toUpperCase() === 'GUJARAT-24'
//     };
// }

const addSale_PurchaseItem = async (req, res) => {
  let validation = new Validator(req.body, {
    // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
    // item_for: "required|in:0,1",
    item_name: 'required',
    quantity: 'required'
    // price_list_id:"required",
    // customer: "required",
    // scheme_date: 'date',
    // mrp:"required"
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      user: { id: user_id },
      body: { quantity, item_name, price_list_id },
      query: { item_for, customer, invoice_id, cashDiscount }
    } = req
    // const  = req.query
    // const { quantity, item_name, price_list_id } = body;
    // body.user_id = user_id;
    // checking customer
    const isCustomer = await Customer_other_details.findOne({
      where: {
        customer_id: customer
      }
    })
    if (!isCustomer) {
      return RESPONSE.error(res, 8311)
    }
    let ids = invoice_id.split(',')[1]
    let invoice_ids = {
      [Op.or]: [{ [Op.eq]: ids }, { [Op.is]: null }]
    }
    // Item_name can"t repeat for same Item_for
    const existingItem = await Sale_PurchaseItem.findOne({
      where: {
        item_name: item_name,
        item_for: item_for,
        invoice_id: invoice_ids,
        customer_id: customer
      }
    })
    if (existingItem) {
      return RESPONSE.error(res, 8802)
    }
    let isPriceListdata
    if (price_list_id) {
      isPriceListdata = await Prise_list_data.findOne({
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
    }

    // Find the data in Main Model of item
    const itemData = await ItemData.findOne({
      where: {
        item_name: item_name,
        item_for: { [Op.in]: [item_for, 2] },
        user_id
      }
    })
    if (!itemData) {
      return RESPONSE.error(res, 8806)
    }
    if (quantity < itemData.distributor_moq) {
      return RESPONSE.error(res, 7108)
    }
    const responseData = await priceCalculation(
      itemData,
      isPriceListdata,
      quantity,
      item_name /*, cashDiscount*/
    )
    const data = {
      user_id,
      customer_id: customer,
      shipping_quantity: responseData.shipping_quantity,
      billing_quantity: quantity,
      item_name,
      mrp: itemData.mrp,
      item_for,
      tax: itemData.tax_category,
      rate: responseData.rate,
      net_rate: responseData.net_rate,
      stock_unit: itemData.unit_of_measurement,
      hsn: itemData.hsn,
      description: itemData.invoice_description,
      amount: responseData.amount,
      taxed_amount: responseData.taxed_amount,
      scheme_date: responseData.scheme_date,
      discount_scheme: responseData.discount_scheme,
      free_scheme: responseData.free_scheme
    }

    const itemForItem = await Sale_PurchaseItem.create({ ...data, item_for })

    return RESPONSE.success(res, 8801, itemForItem)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}
const addSaleItem = async (req, res) => {
  // let validation = new Validator(req.body, {
  //     item_name: "required",
  //     quantity: "required",
  // });
  // if (validation.fails()) {
  //     firstMessage = Object.keys(validation.errors.all())[0];
  //     return RESPONSE.error(res, validation.errors.first(firstMessage));
  // }
  try {
    let {
      user: { id: user_id },
      body: {
        billing_address,
        item_for,
        order_reference,
        party,
        shipping_address,
        price_list_id,
        cash_discount,
        items
      }
    } = req
    const isCustomer = await Customer_other_details.findOne({
      where: {
        customer_id: party
      }
    })
    if (!isCustomer) {
      return RESPONSE.error(res, 8311)
    }
    let isPriceListdata
    if (price_list_id) {
      isPriceListdata = await Prise_list_data.findOne({
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
    }
    // check billing_address Id
    const findbillingId = await Customer_address.findOne({
      where: {
        id: billing_address
      }
    })
    if (!findbillingId) {
      return RESPONSE.error(res, 8309)
    }
    // check shipping_address Id
    const findshippingId = await Customer_address.findOne({
      where: {
        id: shipping_address
      }
    })
    if (!findshippingId) {
      return RESPONSE.error(res, 8310)
    }

    // if (order_reference) {
    //     const order = await Sale_Purchase_Invoice.findOne({
    //         where: {
    //             id: order_reference,
    //             is_order: 1,
    //         },
    //         include: [
    //             {
    //                 model: Sale_Purchase_item,
    //             }

    //         ]
    //     });

    //     if (!order) {
    //         return RESPONSE.error(res, 8112);
    //     }

    // let orderItems = order.sale_purchase_items.map(item => { return { item_id: item.item_id, quantity: item.billing_quantity  }})
    // items = items?.length ? items : orderItems
    // }
    const order = order_reference
      ? await Sale_Purchase_Invoice.findOne({
        where: {
          id: order_reference,
          is_order: 1
        },
        include: [
          {
            model: Sale_Purchase_item
          }
        ]
      })
      : null

    // if (!order) {
    //     return RESPONSE.error(res, 8112);
    // }

    items = items?.length
      ? items
      : (order?.sale_purchase_items?.map(item => ({
        item_id: item.item_id,
        quantity: item.billing_quantity
      })) || [])

    if (!items.length) {
      let response = {
        sale_purchase_items: [],
        sale_purchase_taxes: [],
        totalTax: {}
      }
      return RESPONSE.success(res, "Please add one item", response)
    }
    let calculatedItems = []
    let lessQtyError = '';
    for (let item of items) {
      // Find the data in Main Model of item
      let itemData = await ItemData.findOne({
        where: {
          id: item.item_id,
          item_for: { [Op.in]: [item_for, 2] }
        }
      })
      if (!itemData) {
        return RESPONSE.error(res, 8806)
      }
      if (item.quantity < itemData.distributor_moq) {
        return RESPONSE.error(res, 7108)
      }
      const ItemStock = await Item_Stock.findAll({
        where: {
          item_id: item.item_id,
          item_name: itemData.item_name,
          available_quantity: { [Op.gt]: 0 }
          //   batch_number
        }
      })
      let available_quantity = ItemStock.reduce(
        (total, num) => total + num.available_quantity,
        0
      )

      if (item.quantity <= available_quantity) {
        // Calculate the price and other details for the item
        let responseData = await priceCalculation(
          itemData.toJSON(),
          isPriceListdata,
          item.quantity,
          itemData.item_name
        )
        responseData.customer_id = party
        calculatedItems.push(responseData)
      } else {
        lessQtyError += `${itemData.item_name} available quantity is ${available_quantity}, `
      }
    }

    const stateName = findshippingId?.state || findbillingId?.state
    let taxedData = calculateTaxes(stateName, calculatedItems, cash_discount)
    let total_Tax = {
      grant_total: taxedData.grant_total,
      total_amount: taxedData.total_amount,
      total_discount: taxedData.total_discount,
      total_cgst_amount: taxedData.total_cgst_amount,
      total_cgst_rate: taxedData.total_cgst_rate,
      total_igst_amount: taxedData.total_igst_amount,
      total_igst_rate: taxedData.total_igst_rate,
      total_sgst_amount: taxedData.total_sgst_amount,
      total_sgst_rate: taxedData.total_sgst_rate,
      total_gst_rate: taxedData.total_gst_rate,
      total_gst_amount: taxedData.total_gst_amount,
      round_off: taxedData.round_off,
      status_key: taxedData.status_key,
      customer_id: party
    }
    let response = {
      sale_purchase_items: calculatedItems,
      sale_purchase_taxes: taxedData.taxData,
      totalTax: total_Tax
    }
    return RESPONSE.success(res, lessQtyError ? lessQtyError : 'item add successfully', response)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}
//Get Item
const getSale_PurchaseItem = async (req, res) => {
  let validation = new Validator(req.query, {
    // reference_type: "in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
    item_for: 'in:0,1' // 0-sale ,1-purchase
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      query: { id, item_for, item_name, invoice_id, customer }
    } = req

    let conditionWhere = {}

    // Search by Id
    if (id) {
      conditionWhere.id = id
    }
    // Search by Item_for
    if (item_for) {
      conditionWhere.item_for = item_for
    }

    // Search by Item_name
    if (item_name) {
      conditionWhere.item_name = item_name
    }
    // Search by Customer data
    if (customer) {
      conditionWhere.customer_id = customer
    }
    // Search by Invoice_id

    if (invoice_id) {
      let ids = invoice_id.split(',')[1]
      conditionWhere.invoice_id = {
        [Op.or]: [{ [Op.eq]: ids }, { [Op.is]: null }]
      }
    }
    const itemForItem = await Sale_PurchaseItem.findAll({
      where: conditionWhere,
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
          attributes: ['id', 'hsn_code', 'hsn_description']
        }
      ]
    })
    // if (itemForItem.length === 0) {
    //     return RESPONSE.error(res, 8003, 404);
    // }
    if (id) {
      return RESPONSE.success(res, 8803, itemForItem)
    }

    return RESPONSE.success(res, 8803, itemForItem)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

// update  Item
const updateSale_PurchaseItem = async (req, res) => {
  let validation = new Validator(req.query, {
    // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
    id: 'required',
    item_for: 'required|in:0,1',
    scheme_date: 'date'
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      body: {
        /*  tax,  description, hsn, stock_unit, account,*/ item_name,
        billing_quantity,
        price_list_id,
        shipping_quantity
      },
      query: { id, item_for, invoice_id, customer, cashDiscount }
    } = req
    // checking customer

    const isCustomer = await Customer_other_details.findOne({
      where: {
        customer_id: customer
      }
    })

    if (!isCustomer) {
      return RESPONSE.error(res, 8311)
    }

    // //   check Hsn Id
    // const findhsnid = await Hsns.findOne({
    //     where: {
    //         id: hsn
    //     }
    // })

    // if (!findhsnid) {
    //     return RESPONSE.error(res, 8085)
    // }

    // // Check stock_unit Id
    // const findUOMId = await stock_Unit.findOne({
    //     where: {
    //         id: stock_unit
    //     }
    // })

    // if (!findUOMId) {
    //     return RESPONSE.error(res, 8807)
    // }

    const itemForItem = await Sale_PurchaseItem.findOne({ where: { id } })
    if (!itemForItem) {
      return RESPONSE.error(res, 8003, 404)
    }

    // Item_name can"t repeat for same Item_for
    if (item_name) {
      const existingItem = await Sale_PurchaseItem.findOne({
        where: {
          item_name: item_name,
          customer_id: customer,
          item_for: { [Op.in]: [item_for, 2] },
          invoice_id: invoice_id == 0 ? null : invoice_id,
          id: {
            [Op.not]: id
          }
        }
      })

      if (existingItem) {
        return RESPONSE.error(res, 8802)
      }

      itemForItem.item_name = item_name
    }
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
    // if (!isPriceListdata) {
    //     return RESPONSE.error(res, 7105);
    // }

    const itemData = await ItemData.findOne({
      where: {
        item_name: item_name,
        item_for: { [Op.in]: [item_for, 2] }
      }
    })

    if (!itemData) {
      return RESPONSE.error(res, 8806)
    }
    if (billing_quantity < itemData.distributor_moq) {
      return RESPONSE.error(res, 7108)
    }

    const responseData = await priceCalculation(
      itemData,
      isPriceListdata,
      billing_quantity,
      item_name /*, cashDiscount*/
    )

    // let net_rate = itemData.rate
    // let min_rate = itemData.current_cost
    // isCustomer?.discount_scheme?.split('+').forEach(item => {
    //     let dis_rate = (net_rate * item) / 100
    //     net_rate = Number((net_rate - dis_rate).toFixed(2))
    // })
    // let max_rate = Math.max(net_rate, min_rate);
    // // Check if the item scheme is valid based on the scheme_date
    // const currentDate = new Date();
    // const schemeDate = new Date(itemData?.scheme_valid_by_date);

    // let shipping_quantity1;
    // let quantity = billing_quantity;
    // if (currentDate <= schemeDate) {
    //     shipping_quantity1 = FreeScheme(quantity, itemData.free_scheme);
    // } else {
    //     shipping_quantity1 = quantity;
    // }
    // // GST Calculation
    // const tax1 = parseFloat(itemData.tax_category.match(/\d+(?:\.\d+)?/)[0]);
    // const amount = billing_quantity * max_rate;
    // const taxed_amount = (amount * (tax1 / 100)) + (amount)
    // // const responseData = priceCalculation(itemData, isPriceListdata, quantity, item_name);

    // update
    await itemForItem.update({
      taxed_amount: responseData.taxed_amount,
      amount: responseData.amount,
      billing_quantity,
      shipping_quantity: responseData.shipping_quantity,
      net_rate: responseData.net_rate
    })

    return RESPONSE.success(res, 8804)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

// Delete  Item
// const deleteSale_PurchaseItem = async (req, res) => {
//     try {
//         const {user: { id: user_id },
//             query: { id ,invoice_id},
//         } = req;

//              // Convert the IDs to an array
//              const itemIds = id.split(',');

//             const deletionQuery = {
//                 id: { [Op.in]: itemIds },
//                 user_id: user_id,
//             };

//             if (invoice_id) {
//                 deletionQuery.invoice_id = invoice_id;
//             }
//              // Find the items for deletion
//              const itemsForDeletion = await Sale_PurchaseItem.findAll({ where: deletionQuery });

//              if (itemsForDeletion.length === 0) {
//                  return RESPONSE.error(res, 8003, 404);
//              }

//              // Delete the items
//              await Sale_PurchaseItem.destroy({ where: deletionQuery });

//         return RESPONSE.success(res, 8805);
//     } catch (error) {
//         console.log(error);
//         return RESPONSE.error(res, 9999);
//     }
// };

const deleteSale_PurchaseItem = async (req, res) => {
  try {
    const {
      // user: { id: user_id },
      query: { id, invoice_id, customer }
    } = req

    const isCustomer = await Customer_other_details.findOne({
      where: {
        customer_id: customer
      }
    })

    if (!isCustomer) {
      return RESPONSE.error(res, 8311)
    }
    // Convert the IDs to an array
    const itemIds = id.split(',')

    const deletionQuery = {
      id: { [Op.in]: itemIds },
      // user_id: user_id,
      customer_id: customer
    }

    if (itemIds.length > 1 && !customer) {
      return RESPONSE.error(res, 8109)
    }

    // if (invoice_id) {
    //     deletionQuery.invoice_id = { [Op.is]: null }
    // }

    // Find the items for deletion
    const itemsForDeletion = await Sale_PurchaseItem.findAll({
      where: deletionQuery
    })

    if (itemsForDeletion.length === 0) {
      return RESPONSE.error(res, 8003, 404)
    }

    // Delete the items
    await Sale_PurchaseItem.destroy({ where: deletionQuery })

    return RESPONSE.success(res, 8805)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

module.exports = {
  addSale_PurchaseItem,
  getSale_PurchaseItem,
  updateSale_PurchaseItem,
  deleteSale_PurchaseItem,
  priceCalculation,
  calculateTaxes,
  addSaleItem
}
