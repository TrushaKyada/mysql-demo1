const { Op, Model } = require('sequelize')
const db = require('../../config/db.config')

const AccountData = db.Sale_Purchase_account
const Customer = db.customer_details
const Customer_partner = db.customer_parters
const Customer_pan = db.customer_pan
const Customer_gst = db.customer_gst
const Customer_email = db.customer_emails
const Customer_address = db.customer_address
const Customer_bank = db.customer_bank_details
const Customer_other = db.customer_other_details
const Price_listData = db.Price_List_Detail
const Validator = require('validatorjs')


const addCustomer = async (req, res) => {
    let validation = new Validator(req.body, {
        personal_details: 'required',
        partner_details: 'required',
        pan_nums: 'required',
        // gst_nums: 'required',
        emails: 'required',
        address: 'required',
        bank_details: 'required',
        // other_details: 'required',
        // "address.*.type_of_address": 'requiredcustomer, Shipping Address',
        // shipping_address:'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const t = await db.sequelize.transaction();
    try {

        const { id: user_id } = req.user
        let { personal_details, partner_details, pan_nums, gst_nums, emails, address: maltiAddress, bank_details, other_details } = req.body
        let { item_for } = req.query
        if (partner_details.length < 1 || pan_nums.length < 1 || emails.length < 1 || maltiAddress.length < 1 || bank_details.length < 1) {
            await t.rollback();
            return RESPONSE.error(res, 5006)
        }
        // Check Email 
        const email = emails.map(item => (item.email))
        // Check for duplicate email addresses within the batch
        const uniqueEmails = new Set(email);
        
        if (uniqueEmails.size !== email.length) {
            await t.rollback();
            return RESPONSE.error(res, 8411);
        }

        if (await Customer_email.isExistField('email', email)) {
            await t.rollback();
            return RESPONSE.error(res, 8406)
        }

        // check Partner Mobile number
        const partner_mobile = partner_details.map(item => (item.partner_mobile))

        // Check for duplicate partner mobile number within the batch
        const uniquePartnerMobile = new Set(partner_mobile);

        if (uniquePartnerMobile.size !== partner_mobile.length) {
            await t.rollback();
            return RESPONSE.error(res, 8412);
        }
        if (await Customer_partner.isExistField('partner_mobile', partner_mobile)) {
            await t.rollback();
            return RESPONSE.error(res, 8407)
        }
        // Check Landline number
        if (personal_details.landline_num_1 === personal_details.landline_num_2) {
            await t.rollback();
            return RESPONSE.error(res, 8410);
        }
        if (await Customer.isExistField('landline_num_1', personal_details.landline_num_1)) {
            await t.rollback();
            return RESPONSE.error(res, 8408)
        }
        if (await Customer.isExistField('landline_num_2', personal_details.landline_num_2)) {
            await t.rollback();
            return RESPONSE.error(res, 8409)
        }

        // Find customer
        if (await Customer.isExistField('firm_name', personal_details.firm_name)) {
            return RESPONSE.error(res, 5008)
        }

        // const isCustomer = await Customer.findOne({
        //     where: { firm_name: personal_details.firm_name, item_for: item_for }
        // })

        // if (isCustomer) {
        //     await t.rollback();
        //     return RESPONSE.error(res, 5008)
        // }
        if (personal_details.account) {

            const isAccount = await AccountData.findOne({
                where: { id: personal_details.account }
            })

            if (!isAccount) {
                await t.rollback();
                return RESPONSE.error(res, 8602)
            }
        }

        // adding user id to personal details
        personal_details.user_id = user_id

        // creatind distributor details
        const customer = await Customer.create({ ...personal_details, item_for }, { transaction: t })

        const addDistID = (arr) => {
            return arr.map(item => {
                item.customer_id = customer.id
                return item
            })
        }

        // adding distributor id to parter details
        partner_details = addDistID(partner_details)
        // creating partners
        await Customer_partner.bulkCreate(partner_details, { transaction: t })

        // adding distributor id to pan numbers
        pan_nums = addDistID(pan_nums)
        // creating pans
        await Customer_pan.bulkCreate(pan_nums, { transaction: t })

        if (gst_nums.length) {
            // adding distributor id to gst numbers
            gst_nums = addDistID(gst_nums)
            // creating gst
            await Customer_gst.bulkCreate(gst_nums, { transaction: t })
        }

        // adding distributor id to email
        emails = addDistID(emails)
        // creating email
        await Customer_email.bulkCreate(emails, { transaction: t })

        // adding distributor id to address
        maltiAddress = addDistID(maltiAddress)

        // creating address
        const data = await Customer_address.bulkCreate(maltiAddress, { transaction: t })
        const billingAddress = data.find((address) => address.type_of_address === 'Billing Address');
        const shippingAddress = data.find((address) => address.type_of_address === 'Shipping Address');
        const deliveryAddress = data.find((address) => address.type_of_address === 'Delivery Address')
        const bothAddress = data.find((address) => address.type_of_address === 'Both');

        // adding distributor id to bank details
        bank_details = addDistID(bank_details)
        // creating bank details
        await Customer_bank.bulkCreate(bank_details, { transaction: t })

        if (other_details) {
            // adding distributor id to other details
            other_details.customer_id = customer.id
            // creating other details
            await Customer_other.create(other_details, { transaction: t })
        }

        //  update customer_detail with billing_address and shipping_address
        if (bothAddress) {
            customer.billing_address = bothAddress.id;
            customer.shipping_address = bothAddress.id;
        } else {
            customer.billing_address = billingAddress ? billingAddress.id : shippingAddress.id;
            customer.shipping_address = shippingAddress ? shippingAddress.id : billingAddress.id;
            customer.delivery_address = deliveryAddress ? deliveryAddress.id : deliveryAddress.id;
        }
        await customer.save({ transaction: t });


        await t.commit();

        return RESPONSE.success(res, 4002)
    } catch (error) {
        await t.rollback();
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

const getCustomer = async (req, res) => {
    let validation = new Validator(req.query, {
        // item_for:"required",
        // id:"required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id, search, is_active, outstanding, item_for } } = req;

        // let conditionWhere = {};
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

        const customer = await Customer.findAndCountAll({
            where: {
                ...(id) && { id },
                ...(item_for) && { item_for },
                ...(search) && { firm_name: { [Op.like]: `%${search}%` } },
                ...(outstanding) && { outstanding_amount: { [Op.gt]: 0 } }
                // outstanding_amount: { [Op.gt]: 0 }

            },

            include: [
                {
                    model: Customer_partner,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    ...(is_active == '0') && { where: { is_active: false } },
                    ...(is_active == '1') && { where: { is_active: true } },
                    required: false

                },
                {
                    model: Customer_pan,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    ...(is_active == '0') && { where: { is_active: false } },
                    ...(is_active == '1') && { where: { is_active: true } },
                    required: false
                },
                {
                    model: Customer_gst,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    ...(is_active == '0') && { where: { is_active: false } },
                    ...(is_active == '1') && { where: { is_active: true } },
                    required: false
                },
                {
                    model: Customer_email,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    ...(is_active == '0') && { where: { is_active: false } },
                    ...(is_active == '1') && { where: { is_active: true } },
                    required: false
                },
                {
                    model: Customer_address,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    ...(is_active == '0') && { where: { is_active: false } },
                    ...(is_active == '1') && { where: { is_active: true } },
                    required: false
                },
                {
                    model: Customer_bank,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    ...(is_active == '0') && { where: { is_active: false } },
                    ...(is_active == '1') && { where: { is_active: true } },
                    required: false
                },
                {
                    model: Customer_other,
                    include: [
                        { model: Price_listData }
                    ],
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    ...(is_active == '0') && { where: { is_active: false } },
                    ...(is_active == '1') && { where: { is_active: true } },
                    required: false
                },
            ],
            // subQuery: false,
            ...conditionOffset,
            distinct: true,
        })

        if (id) {
            return RESPONSE.success(res, customer.rows.length ? 8103 : 8311, customer.rows);
        }
        let Data = {
            chatData: customer.rows,
            page_information: {
                totalrecords: customer.count,
                lastpage: Math.ceil(customer.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(customer.count / limit) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, Data.length ? 8303 : 8311, Data);

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};

const deleteCustomer = async (req, res) => {
    let validation = new Validator(req.query, {
        id: 'required',
        item_for: 'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const t = await db.sequelize.transaction();
    try {
        const { query: { id, item_for } } = req;

        const customer = await Customer.findOne({
            where: {
                id,
                item_for
            }
        })
        if (!customer) {
            await t.rollback();
            return RESPONSE.error(res, 5008)
        }

        await customer.destroy({ transaction: t })
        await Customer_partner.destroy({ where: { customer_id: id } }, { transaction: t })
        await Customer_pan.destroy({ where: { customer_id: id } }, { transaction: t })
        await Customer_gst.destroy({ where: { customer_id: id } }, { transaction: t })
        await Customer_email.destroy({ where: { customer_id: id } }, { transaction: t })
        await Customer_address.destroy({ where: { customer_id: id } }, { transaction: t })
        await Customer_bank.destroy({ where: { customer_id: id } }, { transaction: t })
        await Customer_other.destroy({ where: { customer_id: id } }, { transaction: t })

        await t.commit();
        return RESPONSE.success(res, 8305);

    } catch (error) {
        console.log(error);
        await t.rollback();
        return RESPONSE.error(res, 9999);
    }
};
const updateCustomer = async (req, res) => {
    let validation = new Validator(req.query, {
        id: 'required',
        item_for: 'required'
        // is_active:"0"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const t = await db.sequelize.transaction();
    try {
        const { query: { id, item_for } } = req;
        let { personal_details, partner_details, pan_nums, gst_nums, emails, address: maltiAddress, bank_details, other_details } = req.body
        if (partner_details.length < 1 || pan_nums.length < 1 || emails.length < 1 || maltiAddress.length < 1 || bank_details.length < 1) {
            await t.rollback();
            return RESPONSE.error(res, 5006)
        }
        const customer = await Customer.findOne({
            where: {
                id: id,
                item_for: item_for
            }
        })
        if (!customer) {
            await t.rollback();
            return RESPONSE.error(res, 5009)
        }
        // updateing personal details
        customer.update(personal_details, { transaction: t })

        const updatedata = async (model, updatedata) => {
            let removeIds = []
            for (let i of updatedata) {
                if (i.id) {
                    removeIds.push(i.id)
                    let updateId = i.id
                    delete i.id
                    // delete i.customer_id
                    await model.update(i, { where: { id: updateId }, transaction: t })
                } else {
                    // creating new data 
                    await model.create({ ...i, is_active: true, customer_id: customer.id }, { transaction: t })
                }
            }
            await model.update({ is_active: false }, { where: { customer_id: customer.id, id: { [Op.notIn]: removeIds } }, transaction: t })
        }

        // updateing parter details
        await updatedata(Customer_partner, partner_details)
        // updateing pan details
        await updatedata(Customer_pan, pan_nums)
        // updateing gst details
        await updatedata(Customer_gst, gst_nums)
        // updateing emails details
        await updatedata(Customer_email, emails)
        // updateing address details
        await updatedata(Customer_address, maltiAddress)
        // updateing bank details
        await updatedata(Customer_bank, bank_details)
        if (other_details) {
            if (other_details.id) {
                let updateId = other_details.id
                delete other_details.id
                // delete other_details.customer_id
                await Customer_other.update(other_details, { where: { id: updateId }, transaction: t })
            } else {
                await Customer_other.create({ ...other_details, customer_id: customer.id }, { transaction: t })
            }
        }

        await t.commit();
        return RESPONSE.success(res, 8304);

    } catch (error) {
        console.log(error);
        await t.rollback();
        return RESPONSE.error(res, 9999);
    }
};

module.exports = {
    addCustomer,
    getCustomer,
    deleteCustomer,
    updateCustomer
}