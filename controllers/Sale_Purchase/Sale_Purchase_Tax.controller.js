const db = require("../../config/db.config");
const { Sequelize, Op, Model, NUMBER } = require('sequelize');
const ItemTaxdata = db.Sale_Purchase_Tax
const Sale_PurchaseItem = db.Sale_Purchase_Item;
// const Sale_Purchasedummy = db.Sale_Purchase_dummy
const CustomerData = db.customer_details
const CustomerAddress = db.customer_address
const Validator = require("validatorjs");

// Add Tax data
const addTaxData = async (req, res) => {
  let validation = new Validator(req.query, {
    // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
    invoice_id: "required"
  });
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(firstMessage));
  }
  try {
    const { body: { party_id, shipping_address, cash_discount }, query: { invoice_id } } = req

    const customerdata = await CustomerData.findOne({
      where: { id: party_id },
      include: [
        {
          model: CustomerAddress,
          as: 'shipping',
          attributes: ['id', 'state'],
        }
      ]
    })
    if (!customerdata) {
      return RESPONSE.error(res, 8311, 404);
    }
    const shipping_state = await CustomerAddress.findOne({
      where: {
        id: shipping_address,
        customer_id: party_id
      }
    })
    let ids = invoice_id.split(',')[1]
    let itemData = await Sale_PurchaseItem.findAll({
      where: {
        customer_id: party_id,
        invoice_id: {
          [Op.or]: [
            { [Op.eq]: ids },
            { [Op.is]: null }
          ]
        }
      },
    });

    if (!itemData.length) {
      return RESPONSE.error(res, 8806, 404);
    }
    const stateName = shipping_state?.state
    const responseData = calculateTaxes(stateName, itemData, cash_discount)

    return RESPONSE.success(res, 8901, responseData);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

const getTaxData = async (req, res) => {
  try {
    const ItemTaxData = await ItemTaxdata.findAll()
    // if (!ItemTaxData.length) {
    //   return RESPONSE.error(res, 8903, 404);
    // }

    return RESPONSE.success(res, ItemTaxData.length ? 8902 : 8903, ItemTaxData);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
}

const calculateTaxes = (stateName, itemData, cashDiscount = 0) => {
  // const stateName = customerdata?.shipping?.state
  let taxData = [];

  let grant_total = 0, total_sgst_rate = 0, total_cgst_rate = 0, total_sgst_amount = 0, total_cgst_amount = 0, total_igst_amount = 0, total_igst_rate = 0, total_discount = 0, total_amount = 0;
  itemData.forEach((item) => {
    let Party = item?.customer_id
    const itemName = item.item_name;
    const itemTax = item?.tax;
    const itemAmount = Number(item.amount).toFixed(2);
    const quantity = item.billing_quantity || item.quantity
    // const itemRate = item.rate;
    let taxPercentage = parseFloat(itemTax?.split('-')?.[1]);
    taxPercentage = isNaN(taxPercentage) ? 0 : taxPercentage
    const Cash_Discount = Number(((itemAmount * (cashDiscount / 100))).toFixed(2))
    const cash_discount = Number(itemAmount) - Number(Cash_Discount.toFixed(2))
    let sgst_amount = 0, cgst_amount = 0, igst_amount = 0, sgst_rate = 0, cgst_rate = 0, taxedAmount = 0, igst_rate = 0;
    if (stateName?.toUpperCase() === 'GUJARAT-24') {
      sgst_rate = Number((taxPercentage / 2).toFixed(2));
      cgst_rate = Number((taxPercentage / 2).toFixed(2));
      sgst_amount = Number((((Number(cash_discount)) * sgst_rate) / 100).toFixed(2));
      cgst_amount = Number((((Number(cash_discount)) * cgst_rate) / 100).toFixed(2));
      taxedAmount = Number((Number(cash_discount) + Number(sgst_amount) + Number(cgst_amount))).toFixed(2);
      total_sgst_rate += sgst_rate;
      total_cgst_rate += cgst_rate;
      total_sgst_amount += sgst_amount;
      total_cgst_amount += cgst_amount;

    } else {
      igst_rate = Number(taxPercentage.toFixed(2))
      igst_amount = Number((((Number(cash_discount)) * taxPercentage) / 100).toFixed(2))
      taxedAmount = Number((Number(cash_discount) + Number(igst_amount)).toFixed(2));
      total_igst_rate += igst_rate;
      total_igst_amount += igst_amount;
    }

    taxData.push({
      customer_id: Party,
      item_name: itemName,
      total_gst: taxPercentage,
      tax: itemTax,
      amount: (Number(itemAmount)),
      discounted_amount: (Number(cash_discount)),
      sgst_rate: sgst_rate,
      cgst_rate: cgst_rate,
      sgst_amount: sgst_amount,
      cgst_amount: cgst_amount,
      igst_rate: igst_rate,
      igst_amount: igst_amount,
      taxed_amount: taxedAmount,
      quantity: quantity
    });
  
    total_amount += Number(itemAmount)
    total_discount += Number(Cash_Discount);
    grant_total += Number(taxedAmount);
    
  });
  // Calculate the rounded grant_total
  // let roundedGrantTotal = Math.round(grant_total * 2) / 2;
  let roundedGrantTotal = Number(grant_total).toFixed(2)
  // Get the Round off value by  fraction part
  let fractionalPart = (roundedGrantTotal % 1).toFixed(2);
  // If the fractional part is 0.49 or less, round down; otherwise, round up
  let round_off = fractionalPart <= 0.49 ? Number(fractionalPart) : Number(fractionalPart) - 1;
  // If the fractional part is 0.49 or less, round down (minus); otherwise, round up (plus)
  roundedGrantTotal = fractionalPart <= 0.49 ? Math.floor(roundedGrantTotal) : Math.ceil(roundedGrantTotal);
  return {
    taxData,
    round_off: (-Number(round_off.toFixed(2))),
    grant_total: roundedGrantTotal.toFixed(2),
    total_discount: total_discount.toFixed(2),
    total_amount: total_amount.toFixed(2),
    total_gst_rate: Number(stateName.toUpperCase() === 'GUJARAT-24' ? (total_sgst_rate + total_cgst_rate) : total_igst_rate).toFixed(2),
    total_gst_amount: Number(stateName.toUpperCase() === 'GUJARAT-24' ? (total_sgst_amount + total_cgst_amount) : total_igst_amount).toFixed(2),
    total_sgst_rate: total_sgst_rate.toFixed(2),
    total_cgst_rate: total_cgst_rate.toFixed(2),
    total_sgst_amount: total_sgst_amount.toFixed(2),
    total_cgst_amount: total_cgst_amount.toFixed(2),
    total_igst_rate: total_igst_rate.toFixed(2),
    total_igst_amount: total_igst_amount.toFixed(2),
    status_key: stateName.toUpperCase() === 'GUJARAT-24'
  };
}
// const calculateTaxes = (stateName, itemData) => {
//   // const stateName = customerdata?.shipping?.state
//   let taxData = [];

//   let grant_total = 0, total_sgst_rate = 0, total_cgst_rate = 0, total_sgst_amount = 0, total_cgst_amount = 0, total_igst_amount = 0, total_igst_rate = 0;
//   itemData.forEach((item) => {
//     let Party = item.customer_id
//     const itemName = item.item_name;
//     const itemTax = item?.tax;
//     const itemAmount = Number(item.amount).toFixed(2);
//     const quantity = item.billing_quantity || item.quantity
//     // const itemRate = item.rate;
//     const taxPercentage = parseFloat(itemTax?.split('-')?.[1] || 0);

//     let sgst_amount = 0, cgst_amount = 0, igst_amount = 0, sgst_rate = 0, cgst_rate = 0, taxedAmount = 0, igst_rate = 0;
//     if (stateName?.toUpperCase() === 'GUJARAT-24') {
//       sgst_rate = Number((taxPercentage / 2).toFixed(2));
//       cgst_rate = Number((taxPercentage / 2).toFixed(2));
//       sgst_amount = Number((((Number(itemAmount)) * sgst_rate) / 100).toFixed(2));
//       cgst_amount = Number((((Number(itemAmount)) * cgst_rate) / 100).toFixed(2));
//       taxedAmount = Number((Number(itemAmount) + Number(sgst_amount) + Number(cgst_amount))).toFixed(2);
//       total_sgst_rate += sgst_rate;
//       total_cgst_rate += cgst_rate;
//       total_sgst_amount += sgst_amount;
//       total_cgst_amount += cgst_amount;

//     } else {
//       igst_rate = Number(taxPercentage.toFixed(2))
//       igst_amount = Number((((Number(itemAmount)) * taxPercentage) / 100).toFixed(2))
//       taxedAmount = Number((Number(itemAmount) + Number(igst_amount)).toFixed(2));
//       total_igst_rate += igst_rate;
//       total_igst_amount += igst_amount;
//     }

//     taxData.push({
//       customer_id: Party,
//       item_name: itemName,
//       total_gst: taxPercentage,
//       tax: itemTax,
//       amount: (Number(itemAmount)),
//       sgst_rate: sgst_rate,
//       cgst_rate: cgst_rate,
//       sgst_amount: sgst_amount,
//       cgst_amount: cgst_amount,
//       igst_rate: igst_rate,
//       igst_amount: igst_amount,
//       taxed_amount: taxedAmount,
//       quantity: quantity
//     });

//     grant_total += Number(taxedAmount);

//   });

//   // Calculate the rounded grant_total
//   // let roundedGrantTotal = Math.round(grant_total * 2) / 2;
//   let roundedGrantTotal = Number(grant_total).toFixed(2)
//   // Get the Round off value by  fraction part
//   let fractionalPart = (roundedGrantTotal % 1).toFixed(2);
//   // If the fractional part is 0.49 or less, round down; otherwise, round up
//   let round_off = fractionalPart <= 0.49 ? Number(fractionalPart) : Number(fractionalPart) - 1;
//   // If the fractional part is 0.49 or less, round down (minus); otherwise, round up (plus)
//   roundedGrantTotal = fractionalPart <= 0.49 ? Math.floor(roundedGrantTotal) : Math.ceil(roundedGrantTotal);
//   return {
//     taxData,
//     round_off: round_off,
//     grant_total: roundedGrantTotal.toFixed(2),
//     total_gst_rate: Number(stateName.toUpperCase() === 'GUJARAT-24' ? (total_sgst_rate + total_cgst_rate) : total_igst_rate).toFixed(2),
//     total_gst_amount: Number(stateName.toUpperCase() === 'GUJARAT-24' ? (total_sgst_amount + total_cgst_amount) : total_igst_amount).toFixed(2),
//     total_sgst_rate,
//     total_cgst_rate,
//     total_sgst_amount,
//     total_cgst_amount,
//     total_igst_rate,
//     total_igst_amount,
//     status_key: stateName.toUpperCase() === 'GUJARAT-24'
//   };
// }

// Update Tax data
// const updateTaxdata = async (req, res) => {
//   let validation = new Validator(req.body, {
//     // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
//     //  id:"required"
//   });
//   if (validation.fails()) {
//     firstMessage = Object.keys(validation.errors.all())[0];
//     return RESPONSE.error(res, validation.errors.first(firstMessage));
//   }
//   try {

//   } catch (error) {
//     console.log(error);
//     return RESPONSE.error(res, 9999);
//   }
// }










module.exports = {
  addTaxData,
  getTaxData,
  // updateTaxdata,
  calculateTaxes
}