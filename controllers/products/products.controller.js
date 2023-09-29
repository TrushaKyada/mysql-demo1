const db = require('../../config/db.config')
const Product = db.products
const Validator = require('validatorjs')

const addProduct = async (req, res) => {
    let validation = new Validator(req.body, {
        product_name: 'required',
        product_mrp: 'required',
        retail_price: 'required',
        distributor_price: 'required',
        distributor_moq: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        // const { product_name, product_mrp, product_quantity, retail_price, retail_scheme, distributor_price, distributor_moq } = req.body
        const product = await Product.create(req.body)
        return RESPONSE.success(res, 3001)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}
const getAllProductList = async (req, res) => {
    try {
        const products = await Product.findAll({})
        return RESPONSE.success(res, 3002, products)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

module.exports = { addProduct, getAllProductList }