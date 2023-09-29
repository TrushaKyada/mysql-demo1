const express = require("express");
const router = express.Router();
// Auth
const { userAuth, authPermission } = require('../../middleware/checkAuth');

// For Invoice
const InvoiceController = require('../../controllers/Sale_Purchase/Sale_Purchase_invoice_order.controller')
const ReturnInvoice = require('../../controllers/Sale_Purchase/return.controller')

// For Serial Number
const SerialNumberController = require('../../controllers/Sale_Purchase/Sale_Purchase_serialNo.controller')

//For customer  Data
const customerData = require('../../controllers/customer/Sale_purchase.contoller')
const customerAddresss = require("../../controllers/customer/Sale_purchase_address_controller")

// currency
const currency = require('../../controllers/Sale_Purchase/Sale_Purchase_currency.controller')

// Account
const accountController = require('../../controllers/Sale_Purchase/Sale_Purchase_account.controller')

// Payment
const paymentController = require('../../controllers/Sale_Purchase/Sale_Purchase_payment.controller')

// Sale Purchase Item 
const ItemController = require('../../controllers/Sale_Purchase/Sale_Purchase_item.controller')

// Sale Purchase Tax 
const ItemTaxController = require('../../controllers/Sale_Purchase/Sale_Purchase_Tax.controller')

// For Serial Number
router.post('/add-serial-number', userAuth, authPermission('Admin'), SerialNumberController.addSerialNo);
router.get('/get-serial-number', userAuth, authPermission('Admin'), SerialNumberController.getSerialNo);
router.patch('/update-serial-number', userAuth, authPermission('Admin'), SerialNumberController.updateSerialNo);
router.delete('/delete-serial-number', userAuth, authPermission('Admin'), SerialNumberController.deleteSerialNo)

// For Currency
router.post('/add-currency', userAuth, authPermission('Admin'), currency.addCurrency);
router.get('/get-currency', userAuth, authPermission('Admin'), currency.getCurrency);
router.patch('/update-currency', userAuth, authPermission('Admin'), currency.updateCurrency);
router.delete('/delete-currency', userAuth, authPermission('Admin'), currency.deleteCurrency);

// For Account
router.post('/add-account', userAuth, authPermission('Admin'), accountController.addAccount);
router.get('/get-account', userAuth, authPermission('Admin'), accountController.getAccount);
router.patch('/update-account', userAuth, authPermission('Admin'), accountController.updateAccount);
router.delete('/delete-account', userAuth, authPermission('Admin'), accountController.deleteAccount);


//Payment
router.post('/add-payment', userAuth, authPermission('Admin'), paymentController.addPayment);
router.get('/get-payment', userAuth, authPermission('Admin'), paymentController.getPayment);
router.patch('/update-payment', userAuth, authPermission('Admin'), paymentController.updatePayment);
router.delete('/delete-payment', userAuth, authPermission('Admin'), paymentController.deletePayment);
router.post('/received-payment', userAuth, authPermission('Admin'), paymentController.receivePayment)

// Invoice
router.post('/add-invoice', userAuth, authPermission('Admin'), InvoiceController.addInvoice);
router.post('/add-sale-invoice', userAuth, authPermission('Admin'), InvoiceController.addSalesInvoice);
router.get('/get-invoice', userAuth, authPermission('Admin'), InvoiceController.getInvoice);
router.patch('/update-invoice', userAuth, authPermission('Admin'), InvoiceController.updateInvoice);
router.delete('/delete-invoice', userAuth, authPermission('Admin'), InvoiceController.deleteInvoice);
router.patch('/revert-invoice-data', userAuth, authPermission('Admin'), InvoiceController.revertData)
router.patch('/price-list-update-item', userAuth, authPermission('Admin'), InvoiceController.ItemUpdatepriceList)
router.patch('/final-submitted', userAuth, authPermission('Admin'), InvoiceController.FinalSubbmitted)
// router.patch('/return-item',userAuth, authPermission('Admin'),InvoiceController.ReturnInvoice)

// Ruturn Invoice
router.post('/add-return-invoice', userAuth, authPermission('Admin'), ReturnInvoice.addReturn)
router.get('/get-return-invoice', userAuth, authPermission('Admin'), ReturnInvoice.getReturn)
router.patch('/edit-return-invoice', userAuth, authPermission('Admin'), ReturnInvoice.updateReturn)
router.delete('/delete-return-invoice', userAuth, authPermission('Admin'), ReturnInvoice.deleteReturn)

// Sale Purchase Item
router.post('/add-sp-item', userAuth, authPermission('Admin'), ItemController.addSale_PurchaseItem);
router.get('/get-sp-item', userAuth, authPermission('Admin'), ItemController.getSale_PurchaseItem);
router.patch('/update-sp-item', userAuth, authPermission('Admin'), ItemController.updateSale_PurchaseItem);
router.delete('/delete-sp-item', userAuth, authPermission('Admin'), ItemController.deleteSale_PurchaseItem);
router.post('/add-sale-item', userAuth, authPermission('Admin'), ItemController.addSaleItem);

// Sale Purchase Tax 
router.post('/add-taxdata', userAuth, authPermission('Admin'), ItemTaxController.addTaxData);
router.get('/get-taxdata', userAuth, authPermission('Admin'), ItemTaxController.getTaxData);


// sale purchase customer
router.post('/add-customer-data-sp', userAuth, authPermission('Admin'), customerData.addCustomer);
router.get('/get-customer-data-sp', userAuth, authPermission('Admin'), customerData.getCustomer)
router.delete('/delete-customer-data-sp', userAuth, authPermission('Admin'), customerData.deleteCustomer)
router.patch('/update-customer-data-sp', userAuth, authPermission('Admin'), customerData.updateCustomer)

// sale purchase customer address
router.post('/add-customer-address', userAuth, authPermission('Admin'), customerAddresss.addAddress);



module.exports = router