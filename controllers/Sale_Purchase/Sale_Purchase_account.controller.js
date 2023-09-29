const db = require("../../config/db.config");
const AccountData = db.Sale_Purchase_account;
const Validator = require("validatorjs");

//Add Account
const addAccount = async (req, res) => {
  let validation = new Validator(req.body, {
    // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
    account_name:"string",
    account_type: "required|in:Accumulated depreciation,Bank,Cash,Chargeable,Cost of Goods,Sold,Payable,Tax,Stock",
    root_type: "required|in:Asset,Liability,Equity,Income,Expense",
    parent_account: "required|in:Loans,Duties and Taxes,Stock Liabilities,Accounts Payable,Current Liabilities,Capital Account,Source of Funds(Liabilities)",
  });
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(firstMessage));
  }
  try {
    const {
      body: {account_name,parent_account,root_type,account_type,is_group },
    } = req;
    const accountdata = await AccountData.create({ account_name,parent_account,root_type,account_type,is_group });

    return RESPONSE.success(res, 8601, accountdata);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

//Get Account
const getAccount = async (req, res) => {
  try {
    const {
      query: { id },
    } = req;

    let conditionWhere = {};

    // Search by Id
    if (id) {
      conditionWhere.id = id;
    }

    const accountdata = await AccountData.findAll({
      where: conditionWhere,
    });
    // if (accountdata.length === 0) {
    //   return RESPONSE.error(res, 8003, 404);
    // }
    if (id) {
      return RESPONSE.success(res, 8603, accountdata);
    }

    return RESPONSE.success(res, accountdata.length? 8603 :8003, accountdata);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

// update  Account
const updateAccount = async (req, res) => {
  let validation = new Validator(req.body, {
    account_name:"string",
    account_type: "in:Accumulated depreciation,Bank,Cash,Chargeable,Cost of Goods,Sold,Payable,Tax,Stock",
    root_type: "in:Asset,Liability,Equity,Income,Expense",
    parent_account: "in:Loans,Duties and Taxes,Stock Liabilities,Accounts Payable,Current Liabilities,Capital Account,Source of Funds(Liabilities)",
    // id: "required",
  });
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(firstMessage));
  }
  try {
    const {
      body: { account_name,parent_account,root_type,account_type,is_group},query:{id}
    } = req;

    const accountdata = await AccountData.findOne({ where: { id } });
    if (!accountdata) {
      return RESPONSE.error(res, 8003, 404);
    }
    // update
    await accountdata.update({ account_name,parent_account,root_type,account_type,is_group });

    return RESPONSE.success(res, 8604);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

// Delete  Account
const deleteAccount = async (req, res) => {
  try {
    const {
      query: { id },
    } = req;

    const accountdata = await AccountData.findOne({ where: { id } });

    if (!accountdata) {
      return RESPONSE.error(res, 8003, 404);
    }

    // Delete
    await accountdata.destroy();

    return RESPONSE.success(res, 8605);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

module.exports = {
  addAccount,
  getAccount,
  updateAccount,
  deleteAccount,
};