require('dotenv').config();
require('./helpers/global');
const express = require('express');
const path = require('path')
const cors = require('cors')
const app = express();
const config = require('./config/config')

// importing middleware
const APILogger = require('./middleware/logger')


//defining middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

if (config.node_env == 'development') {
    app.use(APILogger)
}

// imporing routes
const adminRoutes = require('./routes/admin.routes')
const userRoutes = require('./routes/user.routes')
const productRoutes = require('./routes/product/product.routes')
const orderRoutes = require('./routes/order/order.routes')
const customerRoutes = require('./routes/customer/customer.routes')
const dailyreportsRoutes = require('./routes/reports/daily_reports.routes')
const itemRoutes = require('./routes/item/item.routes');
const universalpropertyRoutes = require('./routes/universal-property.routes')
const salePurchaseRoutes = require('./routes/sale_purchase/Sale_Purchase.routes')
const priceListdata = require('./routes/common/Price_List/price_list.routes.js')
const companyDetailsdata = require('./routes/common/company_details/company_details.routes.js')
const manufactureRoutes = require('./routes/manufacture/manufacture.routes')
const dispatchRoutes = require('./routes/dispatch/items_receive_voucher.routes')
const transportsRoutes = require('./routes/common/transporter_details/transporter_details.routes')

// defining routes
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/product', productRoutes)
app.use('/api/v1/order', orderRoutes)
app.use('/api/v1/customer', customerRoutes)
app.use('/api/v1/report', dailyreportsRoutes)
app.use('/api/v1/item', itemRoutes);
app.use('/api/v1/universal',universalpropertyRoutes)
app.use('/api/v1/sale-purchase',salePurchaseRoutes)
app.use('/api/v1/price-list',priceListdata)
app.use('/api/v1/company',companyDetailsdata)
app.use('/api/v1/manufacture',manufactureRoutes)
app.use('/api/v1/dispatch',dispatchRoutes)
app.use('/api/v1/transporter-details',transportsRoutes)
module.exports = app