const db = require('../../config/db.config')
const User = db.user
const RetailOrder = db.retail_order
const RetailOrderItem = db.retail_order_item
const DistributorOrderItem = db.distributor_order_item
const DailyReport = db.daily_report

const { Op } = db.Sequelize


const Validator = require('validatorjs')


// creating retail order

const createOrder = async (req, res) => {
    let validation = new Validator(req.body, {
        retailer_id: 'required',
        total_price: 'required',
        distributor_id: 'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const t = await db.sequelize.transaction();
    try {
        const { body: { retailer_id, total_price, items, distributor_id }, user: { id: user_id } } = req
        if (items.length < 1) {
            await t.rollback();
            return RESPONSE.error(res, 3003)
        }
        const retailOrder = await RetailOrder.create({ retailer_id, total_price, user_id, distributor_id }, { transaction: t })
        for (let i of items) {
            i.user_id = user_id
            i.retail_order_id = retailOrder.id
        }
        await RetailOrderItem.bulkCreate(items, { transaction: t })
        await t.commit();
        return RESPONSE.success(res, 4001)
    } catch (error) {
        await t.rollback();
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// get today's order item 
const getTodayOrderItems = async (req, res) => {
    const TODAY_START = new Date().setHours(0, 0, 0, 0);
    const NOW = new Date();

    const createdAt = {
        [Op.gt]: TODAY_START,
        [Op.lt]: NOW
    }
    try {
        const { user: { id } } = req

        let userOrderItem = await User.findOne({
            where: { id },
            attributes: { exclude: ['createdAt', 'updatedAt', 'role', 'profile_image'] },
            include: [{
                model: RetailOrderItem,
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                where: { createdAt },
                required: false,
                include: [{
                    model: db.products,
                    attributes: ['product_name'],
                }]
            }, {
                model: DistributorOrderItem,
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                where: { createdAt },
                required: false,
                include: [{
                    model: db.products,
                    attributes: ['product_name'],
                }]
            }, {
                model: DailyReport,
                where: { createdAt },
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                required: false,
                include: [{
                    model: db.customer_details,
                    attributes: ['firm_name' ,'id'],
                }]
            }]
        })

        const retailOrderCount = await RetailOrder.count({ where: { createdAt, user_id: id } })
        // const distributorOrderCount = await DistributorOrder.count({ where: { createdAt } })
        const productive_call = retailOrderCount // + distributorOrderCount



        if (!userOrderItem) {
            userOrderItem = []
        }

        const today_order_details = {
            userOrderItem,
            productive_call
        }

        return RESPONSE.success(res, 3002, today_order_details)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

module.exports = { createOrder, getTodayOrderItems }