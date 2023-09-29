const db = require("../../config/db.config");
const { Sequelize, Op } = require('sequelize');
const CurrencyData = db.Sale_Purchase_currency;
const Validator = require("validatorjs");

//Add currency
const addCurrency = async (req, res) => {
  let validation = new Validator(req.body, {
    // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
    currency_name: "required|string",
    symbol: "required|string",
  });
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(firstMessage));
  }
  try {
    const {
      body: { symbol, currency_name },
    } = req;
    const existsymbol = await CurrencyData.findOne({
        where:{
            symbol
        }
    })
    if(existsymbol){
        return RESPONSE.error(res,8502) 
    }
    const existcurrencyname = await CurrencyData.findOne({
        where:{
            currency_name
        }
    })
    if(existcurrencyname){
        return RESPONSE.error(res,8506)
    }
    const currencydata = await CurrencyData.create({ symbol, currency_name });

    return RESPONSE.success(res, 8501, currencydata);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

//Get currency
const getCurrency = async (req, res) => {
  // let validation = new Validator(req.query, {
  //     // reference_type: "in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
  // });
  // if (validation.fails()) {
  //     firstMessage = Object.keys(validation.errors.all())[0];
  //     return RESPONSE.error(res, validation.errors.first(firstMessage))
  // }
  try {
    const {
      query: { id },
    } = req;

    let conditionWhere = {};

    // Search by Id
    if (id) {
      conditionWhere.id = id;
    }

    const currencydata = await CurrencyData.findAll({
      where: conditionWhere,
    });
    // if (currencydata.length === 0) {
    //   return RESPONSE.error(res, 8003, 404);
    // }
    if (id) {
      return RESPONSE.success(res, 7003, currencydata);
    }

    return RESPONSE.success(res, currencydata.length ? 8503 :8003, currencydata);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

// update  currency
const updateCurrency = async (req, res) => {
  let validation = new Validator(req.body, {
    // id: "required",
    currency_name: "required|string",
    symbol: "required|string",
  });
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(firstMessage));
  }
  try {
    const {
      body: {symbol, currency_name },query:{id}
    } = req;

    const currencydata = await CurrencyData.findOne({ where: { id } });
    if (!currencydata) {
      return RESPONSE.error(res, 8003, 404);
    }
    const existsymbol = await CurrencyData.findOne({
        where:{
            symbol,
            id: {
              [Op.not]: id,
            },
        }
    })
    if(existsymbol){
        return RESPONSE.error(res,8502) 
    }
    const existcurrencyname = await CurrencyData.findOne({
        where:{
            currency_name,
            id: {
              [Op.not]: id,
            },
        }
    })
    if(existcurrencyname){
        return RESPONSE.error(res,8506)
    }
    // update
    await currencydata.update({ symbol, currency_name });

    return RESPONSE.success(res, 8504);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

// Delete  currency
const deleteCurrency = async (req, res) => {
  try {
    const {
      query: { id },
    } = req;

    const currencydata = await CurrencyData.findOne({ where: { id } });

    if (!currencydata) {
      return RESPONSE.error(res, 8003, 404);
    }

    // Delete
    await currencydata.destroy();

    return RESPONSE.success(res, 8505);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

module.exports = {
  addCurrency,
  getCurrency,
  updateCurrency,
  deleteCurrency,
};
