const db = require('../../config/db.config')
const User = db.user
const Product = db.products
const DistributorOrder = db.distributor_order
const DistributorOrderItem = db.distributor_order_item



const Op = db.Sequelize.Op

const Validator = require('validatorjs')



const createDistOrder = async (req, res) => {
    let validation = new Validator(req.body, {
        distributor_id: 'required',
        total_price: 'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const t = await db.sequelize.transaction();
    try {
        const { body: { distributor_id, total_price, items }, user: { id: user_id } } = req
        if (items.length < 1) {
            await t.rollback();
            return RESPONSE.error(res, 3003)
        }


        // saving data in distributor order table
        const distributorOrder = await DistributorOrder.create({ distributor_id, total_price, user_id }, { transaction: t })

        // get product bas on id
        const product = await Product.findAll({
            where: { id: items.map(item => item.product_id) },
            attributes: ['distributor_moq', 'id']
        })

        for (i of items) {
            const checkMoq = product.some(item => i.product_id == item.id && i.product_quantity < item.distributor_moq)
            if (checkMoq) {
                await t.rollback();
                return RESPONSE.error(res, 4003)
            }
            i.user_id = user_id
            i.distributor_order_id = distributorOrder.id
        }

        //saveing data in distributor order item table
        await DistributorOrderItem.bulkCreate(items, { transaction: t })
        await t.commit();
        return RESPONSE.success(res, 4002)
    } catch (error) {
        await t.rollback();
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// get today's order item 

module.exports = { createDistOrder }