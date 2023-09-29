const Sequelize = require('sequelize')
const config = require('./config')
const { request } = require('express')
// database connection
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    dialect: config.database.dialect,
    operatorsAliases: 0,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    ...(config.node_mode === 'server' && {
      dialectOptions: {
        socketPath: '/var/run/mysqld/mysqld.sock'
      }
    }),
    // "define": {
    //   "underscored": true
    // }
    logging: false
  }
)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.api_logs = require('../models/api_logs.model.js')(sequelize, Sequelize)

// import models
db.admin = require('../models/Auth/admin.models.js')(sequelize, Sequelize)
db.admin_session = require('../models/Auth/admin_sessions.model.js')(
  sequelize,
  Sequelize
)

db.user = require('../models/Auth/user.model.js')(sequelize, Sequelize)
db.user_session = require('../models/Auth/user_sessions.model.js')(
  sequelize,
  Sequelize
)

//product Model
db.products = require('../models/products/product.model.js')(
  sequelize,
  Sequelize
)

// retail customer model
db.retail_customer = require('../models/customers/retail_customer.model.js')(
  sequelize,
  Sequelize
)

// Customer model
db.customer_details =
  require('../models/customers/customer/customer_details.model.js')(
    sequelize,
    Sequelize
  )
db.customer_parters =
  require('../models/customers/customer/customer_partner.model.js')(
    sequelize,
    Sequelize
  )
db.customer_gst = require('../models/customers/customer/customer_gst.model.js')(
  sequelize,
  Sequelize
)
db.customer_pan = require('../models/customers/customer/customer_pan.model.js')(
  sequelize,
  Sequelize
)
db.customer_emails =
  require('../models/customers/customer/customer_email.model.js')(
    sequelize,
    Sequelize
  )
db.customer_address =
  require('../models/customers/customer/customer_address.model.js')(
    sequelize,
    Sequelize
  )
db.customer_bank_details =
  require('../models/customers/customer/customer_bank_details.model.js')(
    sequelize,
    Sequelize
  )
db.customer_other_details =
  require('../models/customers/customer/customer_other_details.model.js')(
    sequelize,
    Sequelize
  )

// retail order model
db.retail_order = require('../models/order/reatil_order.model.js')(
  sequelize,
  Sequelize
)
db.retail_order_item = require('../models/order/retail_order_items.model.js')(
  sequelize,
  Sequelize
)

// distributor order Model
db.distributor_order = require('../models/order/distributor_order.js')(
  sequelize,
  Sequelize
)
db.distributor_order_item =
  require('../models/order/distributor_order_items.js')(sequelize, Sequelize)

// report model
db.daily_report = require('../models/reports/daily_report.js')(
  sequelize,
  Sequelize
)

// unit_measurement model
db.unit_measurement = require('../models/items/uom.model.js')(
  sequelize,
  Sequelize
)

// hsn model
db.hsn_data = require('../models/items/hsn.model.js')(sequelize, Sequelize)

// Stock Category
db.stock_category = require('../models/items/stock_category.model.js')(
  sequelize,
  Sequelize
)

// Item Mode
db.item_data = require('../models/items/item.model.js')(sequelize, Sequelize)

//********************************** SALE PURCHASE *********************************   //
db.Sale_Purchase_serialNo =
  require('../models/Sale_Purchase/Sale_Purchase_serialNO.model.js')(
    sequelize,
    Sequelize
  )
db.Sale_Purchase_currency =
  require('../models/Sale_Purchase/Sale_Purchase_currency.model.js')(
    sequelize,
    Sequelize
  )
db.Sale_Purchase_account =
  require('../models/Sale_Purchase/Sale_Purchase_account.model.js')(
    sequelize,
    Sequelize
  )
db.Sale_Purchase_invoice =
  require('../models/Sale_Purchase/Sale_Purchase_Invoice.model.js')(
    sequelize,
    Sequelize
  )
db.Sale_Purchase_Item =
  require('../models/Sale_Purchase/Sale_Purchase_item.model.js')(
    sequelize,
    Sequelize
  )
db.Sale_Purchase_Tax =
  require('../models/Sale_Purchase/Sale_Purchase_Tax.model.js')(
    sequelize,
    Sequelize
  )
db.Sale_Purchase_total_tax =
  require('../models/Sale_Purchase/Sale_Purchase_total.model.js')(
    sequelize,
    Sequelize
  )
db.Sale_Purchase_payment =
  require('../models/Sale_Purchase/Sale_Purchase_payment.model.js')(
    sequelize,
    Sequelize
  )
db.Received_payment =
  require('../models/Sale_Purchase/Receive_Payment.model.js')(
    sequelize,
    Sequelize
  )
db.Item_stock = require('../models/items/item_stock.model')(
  sequelize,
  Sequelize
)

// *****************************    COMMON DATA    ********************************* //
// Price List Detail and Item
db.Price_List_Detail =
  require('../models/Common_Data/Price_List/Price_List_Detail.model.js')(
    sequelize,
    Sequelize
  )
db.Price_List_Item =
  require('../models/Common_Data/Price_List/Price_List_Item.model.js')(
    sequelize,
    Sequelize
  )

// company details
db.company_details =
  require('../models/Common_Data/company_details/company_details.model.js')(
    sequelize,
    Sequelize
  )
db.company_term_conditions =
  require('../models/Common_Data/company_details/terms.model.js')(
    sequelize,
    Sequelize
  )

// transporter details
db.transporter_details = require('../models/Common_Data/transporter_details/transporter_details.model.js')(
    sequelize,
    Sequelize
)

// ***********************************   MANUFACTURE   ******************************//
//Formula
db.formula = require('../models/manufacture/formula/formula.model')(
  sequelize,
  Sequelize
)
db.formula_material =
  require('../models/manufacture/formula/formula_material.model')(
    sequelize,
    Sequelize
  )

// Mfg Order Processing
db.godown_address =
  require('../models/manufacture/mfg_order_process/godown_address.model')(
    sequelize,
    Sequelize
  )
db.mfg_order_process =
  require('../models/manufacture/mfg_order_process/mfg_process_order.model')(
    sequelize,
    Sequelize
  )
db.storage_room =
  require('../models/manufacture/mfg_order_process/storage_room.model')(
    sequelize,
    Sequelize
  )
// db.room_data = required("../models/manufacture/mfg_order_process/room/room_data.model.js")(sequelize, Sequelize)

// Inventory
db.material_receive =
  require('../models/manufacture/inventory/material_receive.model')(
    sequelize,
    Sequelize
  )
db.material_item =
  require('../models/manufacture/inventory/material_item.model')(
    sequelize,
    Sequelize
  )
db.ready_to_deliver =
  require('../models/manufacture/inventory/ready_to_deliver.model')(
    sequelize,
    Sequelize
  )
db.delivery_item =
  require('../models/manufacture/inventory/deliver_item.model')(
    sequelize,
    Sequelize
  )
db.item_receive_data = require('../models/dispatch/item_receive/item_receive_data.model')(
  sequelize,
  Sequelize
)
db.items_receive_voucher = require('../models/dispatch/item_receive/items_receive_voucher.model')(
  sequelize,
  Sequelize
)
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$ ************** define relationships ***************  $$$$$$$$$$$$$$$$$$$$$ //

// company details
db.company_details.hasMany(db.company_term_conditions, {
  foreignKey: 'company_id'
})
db.company_term_conditions.belongsTo(db.company_details, {
  foreignKey: 'company_id'
})

// admin
db.admin.hasMany(db.admin_session, { foreignKey: 'admin_id' })
db.admin_session.belongsTo(db.admin, { foreignKey: 'admin_id' })

//*********************************USER *************************************//
db.user.hasMany(db.user_session, { foreignKey: 'user_id' })
db.user_session.belongsTo(db.user_session, { foreignKey: 'user_id' })

//user and retail customer
db.user.hasMany(db.retail_customer, { foreignKey: 'user_id' })
db.retail_customer.belongsTo(db.user, { foreignKey: 'user_id' })

//user and distributor
db.user.hasMany(db.customer_details, { foreignKey: 'user_id' })
db.customer_details.belongsTo(db.user, { foreignKey: 'user_id' })

// user and daily report
db.user.hasMany(db.daily_report, { foreignKey: 'user_id' })
db.daily_report.belongsTo(db.user, { foreignKey: 'user_id' })

// user and retail order
db.user.hasMany(db.retail_order, { foreignKey: 'user_id' })
db.retail_order.belongsTo(db.user, { foreignKey: 'user_id' })

// Sale person and user
db.user.hasMany(db.Sale_Purchase_invoice, {
  foreignKey: 'sales_person',
  as: 'salesperson'
})
db.Sale_Purchase_invoice.belongsTo(db.user, {
  foreignKey: 'sales_person',
  as: 'salesperson'
})

// Purchase Manager and user
db.user.hasMany(db.Sale_Purchase_invoice, {
  foreignKey: 'purchase_manager',
  as: 'purchaseManager'
})
db.Sale_Purchase_invoice.belongsTo(db.user, {
  foreignKey: 'purchase_manager',
  as: 'purchaseManager'
})

// user and retail order items
db.user.hasMany(db.retail_order_item, { foreignKey: 'user_id' })
db.retail_order_item.belongsTo(db.user, { foreignKey: 'user_id' })

// user and distributor order
db.user.hasMany(db.distributor_order, { foreignKey: 'user_id' })
db.distributor_order.belongsTo(db.user, { foreignKey: 'user_id' })

// user and distributor order items
db.user.hasMany(db.distributor_order_item, { foreignKey: 'user_id' })
db.distributor_order_item.belongsTo(db.user, { foreignKey: 'user_id' })

// Customer and user
db.user.hasMany(db.customer_details, {
  foreignKey: 'sales_person',
  as: 'salesPerson'
})
db.customer_details.belongsTo(db.user, {
  foreignKey: 'sales_person',
  as: 'salesPerson'
})

// **********************************customer details*************************//

//customer details and partners
db.customer_details.hasMany(db.customer_parters, { foreignKey: 'customer_id' })
db.customer_parters.belongsTo(db.customer_details, {
  foreignKey: 'customer_id'
})

//customer details and gst number
db.customer_details.hasMany(db.customer_gst, { foreignKey: 'customer_id' })
db.customer_gst.belongsTo(db.customer_details, { foreignKey: 'customer_id' })

//customer details and pan number
db.customer_details.hasMany(db.customer_pan, { foreignKey: 'customer_id' })
db.customer_pan.belongsTo(db.customer_details, { foreignKey: 'customer_id' })

//customer details and address
db.customer_details.hasMany(db.customer_address, { foreignKey: 'customer_id' })
db.customer_address.belongsTo(db.customer_details, {
  foreignKey: 'customer_id'
})

//customer details and banks details
db.customer_details.hasMany(db.customer_bank_details, {
  foreignKey: 'customer_id'
})
db.customer_bank_details.belongsTo(db.customer_details, {
  foreignKey: 'customer_id'
})

db.customer_details.hasMany(db.Sale_Purchase_invoice, { foreignKey: 'party' })
db.Sale_Purchase_invoice.belongsTo(db.customer_details, { foreignKey: 'party' })

//customer details and other details
db.customer_details.hasMany(db.customer_other_details, {
  foreignKey: 'customer_id'
})
db.customer_other_details.belongsTo(db.customer_details, {
  foreignKey: 'customer_id'
})

//customer details and emails
db.customer_details.hasMany(db.customer_emails, { foreignKey: 'customer_id' })
db.customer_emails.belongsTo(db.customer_details, { foreignKey: 'customer_id' })

//customer details and taxes
db.customer_details.hasMany(db.Sale_Purchase_Tax, { foreignKey: 'customer_id' })
db.Sale_Purchase_Tax.belongsTo(db.customer_details, {
  foreignKey: 'customer_id'
})

//customer details and  total taxes
db.customer_details.hasMany(db.Sale_Purchase_total_tax, {
  foreignKey: 'customer_id'
})
db.Sale_Purchase_total_tax.belongsTo(db.customer_details, {
  foreignKey: 'customer_id'
})

//customer details and emails
db.customer_details.hasMany(db.Sale_Purchase_payment, { foreignKey: 'party' })
db.Sale_Purchase_payment.belongsTo(db.customer_details, { foreignKey: 'party' })

// customer  and retailers
db.customer_details.hasMany(db.retail_customer, {
  foreignKey: 'distributor_id'
})
db.retail_customer.belongsTo(db.customer_details, {
  foreignKey: 'distributor_id'
})

// Shipping Address
db.customer_address.hasMany(db.customer_details, {
  foreignKey: 'shipping_address',
  as: 'shipping'
})
db.customer_details.belongsTo(db.customer_address, {
  foreignKey: 'shipping_address',
  as: 'shipping'
})

db.customer_address.hasMany(db.customer_details, {
  foreignKey: 'billing_address',
  as: 'billing'
})
db.customer_details.belongsTo(db.customer_address, {
  foreignKey: 'billing_address',
  as: 'billing'
})

// db.godown_address.hasMany(db.customer_details, { foreignKey: 'delivery_address', as: 'delivery' });
// db.customer_details.belongsTo(db.godown_address, { foreignKey: 'delivery_address', as: 'delivery' });

//distributor details and daily reports
db.customer_details.hasMany(db.daily_report, { foreignKey: 'distributor_id' })
db.daily_report.belongsTo(db.customer_details, { foreignKey: 'distributor_id' })

//**************************************** Retial Data ************************************//
//retail order
db.retail_order.hasMany(db.retail_order_item, { foreignKey: 'retail_order_id' })
db.retail_order_item.belongsTo(db.retail_order, {
  foreignKey: 'retail_order_id'
})

//retailer and retail order
db.retail_customer.hasMany(db.retail_order, { foreignKey: 'retailer_id' })
db.retail_order.belongsTo(db.retail_customer, { foreignKey: 'retailer_id' })

//retail order items and products
db.products.hasMany(db.retail_order_item, { foreignKey: 'product_id' })
db.retail_order_item.belongsTo(db.products, { foreignKey: 'product_id' })

//distributor order items and products
db.products.hasMany(db.distributor_order_item, { foreignKey: 'product_id' })
db.distributor_order_item.belongsTo(db.products, { foreignKey: 'product_id' })

// ************************************** SALES/PURCHASE******************************************//
// salesInvoice and Serial Number relation
db.Sale_Purchase_serialNo.hasMany(db.Sale_Purchase_invoice, {
  foreignKey: 'number_series'
})
db.Sale_Purchase_invoice.belongsTo(db.Sale_Purchase_serialNo, {
  foreignKey: 'number_series'
})

// billing address and sale purchase invoice
db.customer_address.hasMany(db.Sale_Purchase_invoice, {
  foreignKey: 'billing_address',
  as: 'Billing'
})
db.Sale_Purchase_invoice.belongsTo(db.customer_address, {
  foreignKey: 'billing_address',
  as: 'Billing'
})

// Shipping address and sale purchase invoice
db.customer_address.hasMany(db.Sale_Purchase_invoice, {
  foreignKey: 'shipping_address',
  as: 'Shipping'
})
db.Sale_Purchase_invoice.belongsTo(db.customer_address, {
  foreignKey: 'shipping_address',
  as: 'Shipping'
})
// Receive_payment  and payment
db.Sale_Purchase_payment.hasMany(db.Received_payment, {
  foreignKey: 'payment_id',
  as: 'reference'
})
db.Received_payment.belongsTo(db.Sale_Purchase_payment, {
  foreignKey: 'payment_id',
  as: 'reference'
})

//Invoice and Items data
db.Sale_Purchase_invoice.hasMany(db.Sale_Purchase_Item, {
  foreignKey: 'invoice_id'
})
db.Sale_Purchase_Item.belongsTo(db.Sale_Purchase_invoice, {
  foreignKey: 'invoice_id'
})

// Invoice and Tax
db.Sale_Purchase_invoice.hasMany(db.Sale_Purchase_Tax, {
  foreignKey: 'invoice_id'
})
db.Sale_Purchase_Tax.belongsTo(db.Sale_Purchase_invoice, {
  foreignKey: 'invoice_id'
})

// Invoice and Total Tax
db.Sale_Purchase_invoice.hasMany(db.Sale_Purchase_total_tax, {
  foreignKey: 'invoice_id',
  as: 'totalTax'
})
db.Sale_Purchase_total_tax.belongsTo(db.Sale_Purchase_invoice, {
  foreignKey: 'invoice_id',
  as: 'totalTax'
})

// serial number and Payment
db.Sale_Purchase_serialNo.hasMany(db.Sale_Purchase_payment, {
  foreignKey: 'number_series',
  as: 'pay-sr-no'
})
db.Sale_Purchase_payment.belongsTo(db.Sale_Purchase_serialNo, {
  foreignKey: 'number_series',
  as: 'pay-sr-no'
})

// currency and Customer
db.Sale_Purchase_currency.hasMany(db.customer_details, {
  foreignKey: 'currency'
})
db.customer_details.belongsTo(db.Sale_Purchase_currency, {
  foreignKey: 'currency'
})

// Account and Customer
db.Sale_Purchase_account.hasMany(db.customer_details, { foreignKey: 'account' })
db.customer_details.belongsTo(db.Sale_Purchase_account, {
  foreignKey: 'account'
})

// delivery Address
db.godown_address.hasMany(db.Sale_Purchase_invoice, {
  foreignKey: 'delivery_address',
  as: 'delivery'
})
db.Sale_Purchase_invoice.belongsTo(db.godown_address, {
  foreignKey: 'delivery_address',
  as: 'delivery'
})

// *************************************** Universal Data ***************************************//
// self Relation of stock_category
db.stock_category.belongsTo(db.stock_category, {
  foreignKey: 'parent_id',
  as: 'parent'
})

// Sale_Purchase item and stock_unit relation
db.unit_measurement.hasMany(db.Sale_Purchase_Item, { foreignKey: 'stock_unit' })
db.Sale_Purchase_Item.belongsTo(db.unit_measurement, {
  foreignKey: 'stock_unit'
})

db.hsn_data.hasMany(db.Sale_Purchase_Item, { foreignKey: 'hsn' })
db.Sale_Purchase_Item.belongsTo(db.hsn_data, { foreignKey: 'hsn' })

//Item property and raw materials and Finished Goods
/*Foreign key is  unit_of_measurement */
db.unit_measurement.hasMany(db.item_data, {
  foreignKey: 'unit_of_measurement',
  as: 'unitofmeasurement'
})
db.item_data.belongsTo(db.unit_measurement, {
  foreignKey: 'unit_of_measurement',
  as: 'unitofmeasurement'
})

/*Foreign key is stock_category_name */
db.stock_category.hasMany(db.item_data, {
  foreignKey: 'stock_category',
  as: 'category'
})
db.item_data.belongsTo(db.stock_category, {
  foreignKey: 'stock_category',
  as: 'category'
})

db.stock_category.hasMany(db.item_data, {
  foreignKey: 'parent_category',
  as: 'parentCategory'
})
db.item_data.belongsTo(db.stock_category, {
  foreignKey: 'parent_category',
  as: 'parentCategory'
})

// Hsn and Raw material And finished goods
db.hsn_data.hasMany(db.item_data, { foreignKey: 'hsn' })
db.item_data.belongsTo(db.hsn_data, { foreignKey: 'hsn' })

// Item data and Godown name
db.godown_address.hasMany(db.item_data, { foreignKey: 'godown_name' })
db.item_data.belongsTo(db.godown_address, { foreignKey: 'godown_name' })

// Item data and material location
db.storage_room.hasMany(db.item_data, { foreignKey: 'material_location' })
db.item_data.belongsTo(db.storage_room, { foreignKey: 'material_location' })

// Item data and item stock
db.item_data.hasMany(db.Item_stock, { foreignKey: 'item_id' })
db.Item_stock.belongsTo(db.item_data, { foreignKey: 'item_id' })

// ******************************* Received payment *****************************//
db.customer_details.hasMany(db.Received_payment, { foreignKey: 'customer_id' })
db.Received_payment.belongsTo(db.customer_details, {
  foreignKey: 'customer_id'
})

db.Sale_Purchase_invoice.hasMany(db.Received_payment, {
  foreignKey: 'invoice_id'
})
db.Received_payment.belongsTo(db.Sale_Purchase_invoice, {
  foreignKey: 'invoice_id'
})

// *****************************    PRICE LIST ******************** //
db.Price_List_Detail.hasMany(db.Price_List_Item, {
  foreignKey: 'price_list_id'
})
db.Price_List_Item.belongsTo(db.Price_List_Detail, {
  foreignKey: 'price_list_id'
})

// db.customer_details.hasMany(db.Price_List_Detail,{foreignKey:'customer_id'})
// db.Price_List_Detail.belongsTo(db.customer_details, { foreignKey: 'customer_id' })

db.Price_List_Detail.hasMany(db.customer_other_details, {
  foreignKey: 'price_list_id'
})
db.customer_other_details.belongsTo(db.Price_List_Detail, {
  foreignKey: 'price_list_id'
})

db.item_data.hasMany(db.Price_List_Item, { foreignKey: 'item_name' })
db.Price_List_Item.belongsTo(db.item_data, { foreignKey: 'item_name' }),
  db.item_data.hasMany(db.Sale_Purchase_Item, { foreignKey: 'item_id' })
db.Sale_Purchase_Item.belongsTo(db.item_data, { foreignKey: 'item_id' })

// ***********************************   MANUFACTURE   ******************************//

// Formula
// Formula and Unit of Measurement
db.unit_measurement.hasMany(db.formula, { foreignKey: 'unit_of_measurement' })
db.formula.belongsTo(db.unit_measurement, { foreignKey: 'unit_of_measurement' })

// Formula and item data/finish product name
db.item_data.hasMany(db.formula, { foreignKey: 'finish_product_name' })
db.formula.belongsTo(db.item_data, { foreignKey: 'finish_product_name' })

// Formula and Formula Material/Bill of Material
db.formula.hasMany(db.formula_material, {
  foreignKey: 'formula_id',
  as: 'bill_of_material'
})
db.formula_material.belongsTo(db.formula, {
  foreignKey: 'formula_id',
  as: 'bill_of_material'
})

// Formula and Formula Material/Packing of Material
db.formula.hasMany(db.formula_material, {
  foreignKey: 'formula_id',
  as: 'packing_of_material'
})
db.formula_material.belongsTo(db.formula, {
  foreignKey: 'formula_id',
  as: 'packing_of_material'
})

// Formula Material and item_data/material
db.item_data.hasMany(db.formula_material, { foreignKey: 'material_id' })
db.formula_material.belongsTo(db.item_data, { foreignKey: 'material_id' })

// Mfg Process && Order

// Mfg Process && Order and Bom Name
db.formula.hasMany(db.mfg_order_process, {
  foreignKey: 'bom_name',
  as: 'Bill_of_material'
})
db.mfg_order_process.belongsTo(db.formula, {
  foreignKey: 'bom_name',
  as: 'Bill_of_material'
})

// Mfg Process && Order and Godown Address
db.godown_address.hasMany(db.mfg_order_process, {
  foreignKey: 'godown_area',
  as: 'GodownArea'
})
db.mfg_order_process.belongsTo(db.godown_address, {
  foreignKey: 'godown_area',
  as: 'GodownArea'
})

// Mfg Process && Order and Godown Address
db.Sale_Purchase_serialNo.hasMany(db.mfg_order_process, {
  foreignKey: 'mfg_order_number'
})
db.mfg_order_process.belongsTo(db.Sale_Purchase_serialNo, {
  foreignKey: 'mfg_order_number'
})

// Mfg Process && Order and Storage Location
db.storage_room.hasMany(db.mfg_order_process, {
  foreignKey: 'material_location',
  as: 'Material_location'
})
db.mfg_order_process.belongsTo(db.storage_room, {
  foreignKey: 'material_location',
  as: 'Material_location'
})

//*************************************** */ Inventory/* *************************************************//

// Material Receive
// Material Receive Item and Material location/Storage Room
db.storage_room.hasMany(db.material_item, {
  foreignKey: 'material_location',
  as: 'materialLocation'
})
db.material_item.belongsTo(db.storage_room, {
  foreignKey: 'material_location',
  as: 'materialLocation'
})

// Material Receive Item and Materiale name (Sale Purchase Item)
db.Sale_Purchase_Item.hasMany(db.material_item, {
  foreignKey: 'material_name',
  as: 'materialName'
})
db.material_item.belongsTo(db.Sale_Purchase_Item, {
  foreignKey: 'material_name',
  as: 'materialName'
})

// Material Receive Item and Materiale Receiver data
db.material_receive.hasMany(db.material_item, {
  foreignKey: 'material_received_id'
})
db.material_item.belongsTo(db.material_receive, {
  foreignKey: 'material_received_id'
})

// // Material Receive and Purchase Invoice
db.Sale_Purchase_invoice.hasMany(db.material_receive, {
  foreignKey: 'purchase_invoice_number'
})
db.material_receive.belongsTo(db.Sale_Purchase_invoice, {
  foreignKey: 'purchase_invoice_number'
})

// // Material Receive and Godown name
db.godown_address.hasMany(db.material_receive, { foreignKey: 'godown_name' })
db.material_receive.belongsTo(db.godown_address, { foreignKey: 'godown_name' })

// Ready to Delivery
// Ready to Delivery and godown Area
db.godown_address.hasMany(db.ready_to_deliver, { foreignKey: 'godown_area' })
db.ready_to_deliver.belongsTo(db.godown_address, { foreignKey: 'godown_area' })

// Ready to Delivery and Delivery item
db.ready_to_deliver.hasMany(db.delivery_item, {
  foreignKey: 'ready_delivery_id'
})
db.delivery_item.belongsTo(db.ready_to_deliver, {
  foreignKey: 'ready_delivery_id'
})

// Ready to Delivery and Item Data
db.item_data.hasMany(db.delivery_item, {
  foreignKey: 'item_name',
  as: 'Delivery_Item'
})
db.delivery_item.belongsTo(db.item_data, {
  foreignKey: 'item_name',
  as: 'Delivery_Item'
})

// Ready to Delivery and Voucher_number
db.Sale_Purchase_serialNo.hasMany(db.ready_to_deliver, {
  foreignKey: 'voucher_number'
})
db.ready_to_deliver.belongsTo(db.Sale_Purchase_serialNo, {
  foreignKey: 'voucher_number'
})
// // Ready to Delivery and Item name / formula material
// db.formula_material.hasMany(db.ready_to_deliver, { foreignKey: "item_name" })
// db.ready_to_deliver.belongsTo(db.formula_material, { foreignKey: "item_name" })

// Material Location / Storage Room
db.godown_address.hasMany(db.storage_room, { foreignKey: 'godown_id' })
db.storage_room.belongsTo(db.godown_address, { foreignKey: 'godown_id' })

// db.storage_room.hasMany(db.storage_room, { foreignKey: "room_id" ,as:"room_data"});
db.storage_room.belongsTo(db.storage_room, {
  foreignKey: 'room_id',
  as: 'rack_data'
})

//********************************************** -dispatch- ***************************************** */

// ready to deliver and items received voucher
db.ready_to_deliver.hasMany(db.items_receive_voucher, { foreignKey: 'voucher_id', as: "Voucher_number" })
db.items_receive_voucher.belongsTo(db.ready_to_deliver, { foreignKey: 'voucher_id', as: "Voucher_number" })

//
db.item_data.hasMany(db.item_receive_data, { foreignKey: 'item_name' })
db.item_receive_data.belongsTo(db.item_data, { foreignKey: 'item_name' })


db.storage_room.hasMany(db.item_receive_data, { foreignKey: 'item_location', as: "Item_location" })
db.item_receive_data.belongsTo(db.storage_room, { foreignKey: 'item_location', as: "Item_location" })


db.godown_address.hasMany(db.items_receive_voucher, { foreignKey: 'godown_name' })
db.items_receive_voucher.belongsTo(db.godown_address, { foreignKey: 'godown_name' })


db.items_receive_voucher.hasMany(db.item_receive_data, { foreignKey: 'dispatch_item_receives_id', as: "Receive_Item" })
db.item_receive_data.belongsTo(db.items_receive_voucher, { foreignKey: 'dispatch_item_receives_id', as: "Receive_Item" })

db.sequelize.sync({ force: false })

module.exports = db
