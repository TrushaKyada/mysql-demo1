const db = require('../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const sequelize = require('sequelize')
const SerialNo_data = db.Sale_Purchase_serialNo
const CustomerData = db.customer_details;
const total_taxes = db.Sale_Purchase_total_tax
const Accountdata = db.Sale_Purchase_account
const PaymentData = db.Sale_Purchase_payment
const Invoicedata = db.Sale_Purchase_invoice
const ReceivePayment = db.Received_payment
const Validator = require('validatorjs');

// Add Payment
const addPayment = async (req, res) => {

    let validation = new Validator(req.body, {
        // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
        payment_type: "required|in:Receive,Pay",
        payment_method: "required|in:Cash,Cheque,Transfer",
        posting_date: "date",
        ref_date: "date",
        clearance_date: "date",
        reference: "required",
        party: "required",
        serial_number: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body: { number_series, serial_number, party, payment_type, posting_date, from_account, to_account, payment_method, clearance_date, cheque_no, ref_date, amount, write_off = 0, reference }, query: { item_for } } = req;

        // Check Serial Number
        const findnumberSRId = await SerialNo_data.findOne({
            where: {
                id: number_series
            }
        })
        if (!findnumberSRId) {
            return RESPONSE.error(res, 8208)
        }

        // Check Party
        const findparty = await CustomerData.findOne({
            where: {
                id: party
            },
        })
        if (!findparty) {
            return RESPONSE.error(res, 8311)
        }
        // Check account
        const findFromaccount = await Accountdata.findOne({
            where: {
                id: from_account
            }
        });
        if (!findFromaccount) {
            return RESPONSE.error(res, 8312)
        }
        const findToaccount = await Accountdata.findOne({
            where: {
                id: to_account
            }
        });
        if (!findToaccount) {
            return RESPONSE.error(res, 8313)
        }
        const duplicateSerialNumber = await PaymentData.findOne({
            where: {
                number_series: number_series,
                serial_number: serial_number
            }
        });

        if (duplicateSerialNumber) {
            return RESPONSE.error(res, 8209);
        }

        const PaymentDataFields = { number_series, serial_number, party, payment_type, posting_date, from_account, to_account, payment_method, ref_date, amount, write_off };

        // cheque_no and clearance_date is required for payment_method Transfer and Cheque. 
        if (payment_method == "Cheque" || payment_method == "Transfer") {
            if (!(cheque_no && clearance_date)) {
                return RESPONSE.error(res, 8706);
            }

            const existcheque = await PaymentData.findOne({
                where: {
                    cheque_no: cheque_no,
                    clearance_date: clearance_date,
                }
            });
            if (existcheque) {
                return RESPONSE.error(res, 8702);
            }

            PaymentDataFields.cheque_no = cheque_no;
            PaymentDataFields.clearance_date = clearance_date;
        }
        // Update last_number field
        const serialNumberParts = serial_number.split('-')[1];
        const numericPart = parseInt(serialNumberParts);
        if (isNaN(numericPart)) {
            return RESPONSE.error(res, 8210);
        }

        const updatedSerialNumber = await SerialNo_data.update(
            { last_number: numericPart },
            {
                where: { id: findnumberSRId.id }
            }
        );
        if (!updatedSerialNumber) {
            return RESPONSE.error(res, 8208);
        }

        const Paymentdata = await PaymentData.create({ ...PaymentDataFields, item_for });
        let listpayment = []
        if (reference) {
            const invoiceId = reference.map(ref => ref.id);
            // await Invoicedata.bulkCreate(reference.map(ref => ({
            //     payment_received: ref.invoice_payment
            // }), {
            //     updateOnDuplicate: ["payment_received"], // To handle duplicates if any
            //     where: {
            //         id: invoiceId,
            //         party: party
            //     }
            // }));
            const invoices = await Invoicedata.findAll({
                where: {
                    id: invoiceId,
                    party: party,
                    is_cancel: 0
                }
            });

            reference.forEach(ref => {
                const invoice_id = ref.id;
                const payment_received = ref.payment_received
                const last_Payment = ref.last_Payment
                const serial_number = ref.serial_number
                const date = ref.date
                let invoice_payment = ref.invoice_payment
                const total_amount = ref.totalTax[0].grant_total
                let writOff = ref.write_off || 0
                const invoiceToUpdate = invoices.find(invoice => invoice.id === ref.id);
                if (invoiceToUpdate) {
                    // Update the payment_received key in the invoice data
                    const total = Number(invoice_payment) + Number(last_Payment) + Number(writOff)
                    invoiceToUpdate.payment_received = Number(total.toFixed(2));
                }
                listpayment.push({
                    invoice_id: invoice_id,
                    serial_number: serial_number,
                    customer_id: party,
                    date: date,
                    item_for: item_for,
                    invoice_payment: invoice_payment,
                    total_amount: total_amount, //grant_total
                    write_off: writOff,
                    payment_id: Paymentdata.id
                })
            });

            await ReceivePayment.bulkCreate(listpayment)
            const totalPaymentReceived = reference.reduce(
                (acc, ref) => acc + Number(ref.invoice_payment),
                0
            )
            // console.log(totalPaymentReceived, "totalPaymentReceived");
            // let totalAmountwithWritoff = Number(totalPaymentReceived) + Number(write_off)
            let totalAmountwithWritoff = Number(amount) + Number(write_off)

            // console.log(totalAmountwithWritoff, "totalAmountwithWritoff");
            if (Number(findparty.outstanding_amount) >= Number(totalAmountwithWritoff)) {
                // Subtract the total payment received from the customer's outstanding amount
                // console.log("findparty.outstanding_amount", findparty.outstanding_amount);
                const newOutstandingAmount =
                    Number(findparty?.outstanding_amount) - Number(totalAmountwithWritoff.toFixed(2))
                // console.log(newOutstandingAmount, "newOutstandingAmount");
                // Update the customer's "outstanding_amount" 
                await CustomerData.update(
                    { outstanding_amount: newOutstandingAmount },
                    { where: { id: party } }
                );
            }

            // Save the updated invoice data
            await Promise.all(invoices.map(invoice => invoice.save()));

        }

        return RESPONSE.success(res, 8701, Paymentdata);

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}


// Get Payment
const getPayment = async (req, res) => {
    // let validation = new Validator(req.query, {
    //     // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt"
    // });
    // if (validation.fails()) {
    //     firstMessage = Object.keys(validation.errors.all())[0];
    //     return RESPONSE.error(res, validation.errors.first(firstMessage))
    // }
    try {
        const { query: { id, item_for, search } } = req;

        let conditionWhere = {};
        let conditionOffset = {};

        // Pagination
        const page = Number(req.query.page) || 0;
        const limit = Number(req.query.limit);
        const offset = (page - 1) * limit;

        //  Filter by reference_type
        // if (reference_type) {
        //     conditionWhere.reference_type = reference_type
        // }

        // Search by Id 
        if (id) {
            conditionWhere.id = id;
        }

        // Serch payment or sale
        // Search by Id 
        if (item_for) {
            conditionWhere.item_for = item_for;
        }
        // if (search) {
        //     conditionWhere = {
        //         '$customer_detail.outstanding_amount$': {
        //           [Op.ne]: 0 
        //         }
        //       };
        // }
        // conditionWhere = {
        //     ...conditionWhere,
        //     '$customer_detail.outstanding_amount$': {
        //       [Op.ne]: 0 
        //     }
        //   };

        // Offset condition
        if (limit && page) {
            conditionOffset.limit = limit;
            conditionOffset.offset = offset;
        }
        const payment_datas = await PaymentData.findAndCountAll({
            where: conditionWhere,
            include: [
                {
                    model: CustomerData
                },
                {
                    model: SerialNo_data,
                    as: 'pay-sr-no',
                    attributes: ['id', /*'address_key'*/ 'reference_type', 'number_length', 'start', 'prefix'],
                },
                {
                    model: ReceivePayment,
                    as: "reference"
                }
            ],
            order: [['createdAt', 'DESC']],
            ...conditionOffset,
            distinct: true,
        });

        if (id) {
            return RESPONSE.success(res, 8703, payment_datas.rows);
        }

        let Data = {
            chatData: payment_datas.rows,
            page_information: {
                totalrecords: payment_datas.count,
                lastpage: Math.ceil(payment_datas.count/ limit),
                currentpage: page,
                previouspage: 0 + page,
                nextpage: page < Math.ceil(payment_datas.count / limit) ? page + 1 : 0
            }
        };

        return RESPONSE.success(res, 8703, Data);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// Update Payment
const updatePayment = async (req, res) => {
    let validation = new Validator(req.body, {
        // reference_type: "required|in:Sales Invoice,Purchase Invoice,Sales Order,Purchase Order,Payment,Journal Entry,Stock Movement,Purchase Receipt",
        // id: "required",
        payment_type: "in:Receive,Pay",
        payment_method: "in:Cash,Cheque,Transfer",
        posting_date: "date",
        ref_date: "date",
        clearance_date: "date"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body: { number_series, serial_number, payment_type, posting_date, from_account, to_account, payment_method, clearance_date, cheque_no, ref_date, amount, write_off, reference }, query: { id, item_for, party } } = req;
        // Check Serial Number
        const findnumberSRId = await SerialNo_data.findOne({
            where: {
                id: number_series
            }
        })
        if (!findnumberSRId) {
            return RESPONSE.error(res, 8208)
        }
        // Check Party
        const findparty = await CustomerData.findOne({
            where: {
                id: party
            }
        })
        if (!findparty) {
            return RESPONSE.error(res, 8311)
        }

        // Check account
        const findFromaccount = await Accountdata.findOne({
            where: {
                id: from_account
            }
        });
        if (!findFromaccount) {
            return RESPONSE.error(res, 8312)
        }
        const findToaccount = await Accountdata.findOne({
            where: {
                id: to_account
            }
        });
        if (!findToaccount) {
            return RESPONSE.error(res, 8312)
        }
        const payment_datas = await PaymentData.findOne({ where: { id, item_for, party } })
        if (!payment_datas) {
            return RESPONSE.error(res, 8003, 404)
        }
        const duplicateSerialNumber = await PaymentData.findOne({
            where: {
                number_series: number_series,
                serial_number: serial_number,
                id: {
                    [Op.not]: id, // Exclude the current Id
                },
            }
        });

        if (duplicateSerialNumber) {
            return RESPONSE.error(res, 8209);
        }
        const paymentDataFields = { number_series, serial_number, payment_type, posting_date, from_account, to_account, payment_method, clearance_date, cheque_no, ref_date, amount, write_off };
        // cheque_no and clearance_date is required for payment_method Transfer and Cheque. 
        if (payment_method === "Cheque" || payment_method === "Transfer") {
            if (!(cheque_no && clearance_date)) {
                return RESPONSE.error(res, 8706);
            }

            const existcheque = await PaymentData.findOne({
                where: {
                    cheque_no: cheque_no,
                    clearance_date: clearance_date,
                    id: {
                        [Op.not]: id,
                    },
                }
            });
            if (existcheque) {
                return RESPONSE.error(res, 8702);
            }

            paymentDataFields.cheque_no = cheque_no;
            paymentDataFields.clearance_date = clearance_date;
        }


        let listpayment = []
        if (reference) {
            const invoiceId = reference.map(ref => ref.id);
            // await Invoicedata.bulkCreate(reference.map(ref => ({
            //     payment_received: ref.invoice_payment
            // }), {
            //     updateOnDuplicate: ["payment_received"], // To handle duplicates if any
            //     where: {
            //         id: invoiceId,
            //         party: party
            //     }
            // }));
            const invoices = await Invoicedata.findAll({
                where: {
                    id: invoiceId,
                    party: party,
                    is_cancel: 0
                }
            });

            reference.forEach(ref => {
                const invoice_id = ref.id;
                const serial_number = ref.serial_number
                const date = ref.date
                const invoice_payment = ref.invoice_payment
                const total_amount = ref.totalTax[0].grant_total
                const writOff = ref.write_off
                const invoiceToUpdate = invoices.find(invoice => invoice.id === ref.id);
                if (invoiceToUpdate) {
                    // Update the payment_received key in the invoice data
                    invoiceToUpdate.payment_received = ref.invoice_payment;
                }
                listpayment.push({
                    invoice_id: invoice_id,
                    serial_number: serial_number,
                    customer_id: party,
                    date: date,
                    item_for: item_for,
                    invoice_payment: invoice_payment,
                    total_amount: total_amount, //grant_total
                    write_off: writOff,
                    payment_id: payment_datas.id
                })
            });
            for (const paymentData of listpayment) {
                const { payment_id, customer_id, invoice_id, serial_number, ...updateData } = paymentData;
                await ReceivePayment.update(updateData, { where: { payment_id, customer_id, invoice_id, serial_number } });
            }
            const totalPaymentReceived = reference.reduce(
                (acc, ref) => acc + Number(ref.invoice_payment),
                0
            );
            let totalAmountwithWritoff = Number(totalPaymentReceived) + Number(write_off)
            if (findparty.outstanding_amount >= totalAmountwithWritoff) {
                // Subtract the total payment received from the customer's outstanding amount
                const newOutstandingAmount =
                    Number(findparty.outstanding_amount) - Number(totalAmountwithWritoff.toFixed(2))
                // Update the customer's "outstanding_amount" 
                await CustomerData.update(
                    { outstanding_amount: newOutstandingAmount },
                    { where: { id: party } }
                );
            }

            // Save the updated invoice data
            await Promise.all(invoices.map(invoice => invoice.save()));

        }
        // update
        await payment_datas.update(paymentDataFields)
        return RESPONSE.success(res, 8704)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

// Delete  Payment
const deletePayment = async (req, res) => {
    const trans = await db.sequelize.transaction();
    try {
        const { query: { id } } = req

        const payment_datas = await PaymentData.findOne({
            where: { id: id },
            include: [
                {
                    model: ReceivePayment,
                    as: "reference",
                    include: [
                        {
                            model: Invoicedata
                        }
                    ]

                },
                {
                    model: CustomerData
                }
            ]
        })

        if (!payment_datas) {
            await trans.rollback()
            return RESPONSE.error(res, 8707)
        }

        const ReceviedData = payment_datas?.reference

        for (let Payment of ReceviedData) {
            // let PaymentId = Payment.payment_id;
            let last_Payment = Payment.invoice_payment;
            // let write_off = Payment.write_off;
            // let total_amount = Payment.last_Payment
            let InvoiceId = Payment.invoice_id
            let payment_received = Payment.sale_purchase_Invoice.payment_received
            // Update invoice's payment_received
            if (Number(last_Payment) <= Number(payment_received)) {
                await Invoicedata.update(
                    { payment_received: sequelize.literal(`payment_received - ${last_Payment}`) },
                    { where: { id: InvoiceId } , transaction: trans}
                );
            }else{
                await trans.rollback()
                return RESPONSE.error(res, "This Payment not Deleted")
            }
           

        }
        //   Delete
        await payment_datas.destroy({transaction:trans})
        await CustomerData.update(
            { outstanding_amount: sequelize.literal(`outstanding_amount + ${payment_datas.amount}`) },
            {
                where: { id: payment_datas.party },
                transaction: trans
            })
            
        await ReceivePayment.destroy({where:{payment_id:id}, transaction: trans})
        await trans.commit()
        return RESPONSE.success(res, 8705)
    } catch (error) {
        await trans.rollback()
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

const receivePayment = async (req, res) => {
    let validation = new Validator(req.body, {
        party: "required",
        amount: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        let { body: { party, amount, write_off }, query: { item_for } } = req
        const InvoiceData = await Invoicedata.findAll({
            where: {
                party: party,
                is_order: false,
                item_for: item_for,
                is_cancel: false
            },
            include: [
                {
                    model: total_taxes,
                    as: 'totalTax',
                    attributes: ['invoice_id', 'id', 'grant_total']
                }
            ],
            attributes: ['id', 'payment_received', 'serial_number', 'date', 'item_for', 'is_cancel'],
            order: [['createdAt', 'ASC']]
        })
        let receivedAmount = amount;
        let WriteOff = write_off;

        const paidInvoices = [];
        const totalInvoiceAmount = InvoiceData.reduce((total, invoice) => {
            const invoiceAmount = invoice.totalTax[0].grant_total;
            const paymentReceived = invoice.payment_received || 0;
            let remainingamount = Number(invoiceAmount) - Number(paymentReceived);
            if (remainingamount > 0) {
                return total + Number(remainingamount);
            } else {
                return total;
            }
        }, 0);
        if (totalInvoiceAmount < receivedAmount) {
            return RESPONSE.error(res, `Received amount not greater than total amount ${totalInvoiceAmount.toFixed(2)}`);
        }
        let writeOffForLastInvoice = 0;
        for (let invoice of InvoiceData) {
            invoice = invoice.toJSON()
            let invoiceAmount = invoice.totalTax[0].grant_total;
            let paymentReceived = invoice.payment_received || 0;
            let remainingAmount = Number(invoiceAmount) - Number(paymentReceived);
            if (remainingAmount > 0 && receivedAmount > 0) {
                const paymentAmount = Math.min(remainingAmount, receivedAmount);
                receivedAmount -= paymentAmount;
                // const received_Amount = receivedAmount
                // invoice.received_amount = received_Amount.toFixed(2) 
                // invoice.invoice_payment = Number(paymentReceived) + Number(paymentAmount.toFixed(2))
                if (receivedAmount <= 0) {
                    // For the last invoice, store the remaining WriteOff amount and set write_off to zero for the invoice
                    invoice.write_off = WriteOff;
                    writeOffForLastInvoice = WriteOff;
                    WriteOff = 0;
                } else {
                    // For other invoices, set write_off to zero
                    invoice.write_off = 0;
                }
                // const invoice_Payment = Number(paymentReceived) + Number(paymentAmount.toFixed(2))
                const last_Payment = Number(paymentReceived)
                const invoice_Payment = Number(paymentAmount.toFixed(2))
                invoice.last_Payment = last_Payment.toFixed(2)
                invoice.invoice_payment = invoice_Payment.toFixed(2)
                paidInvoices.push(invoice);

                // await ReceivePayment.create({
                //     invoice_id: invoice.id,
                //     serial_number: invoice.serial_number,
                //     customer_id: party,
                //     date: invoice.date,
                //     item_for: item_for,
                //     invoice_payment: Number(paymentReceived) + Number(paymentAmount.toFixed(2)),
                //     total_amount: invoiceAmount, //grant_total
                //     write_off: 0,
                // })
            } else if (receivedAmount <= 0) {
                break;
            }

        }
        // Last Invoice

        if (writeOffForLastInvoice > 0 && paidInvoices.length > 0) {
            const lastInvoice = paidInvoices[paidInvoices.length - 1];
            lastInvoice.write_off = writeOffForLastInvoice;
            let remainingToWrite = Number(lastInvoice.totalTax[0].grant_total) - Number(lastInvoice.invoice_payment);
            let amountToWriteOff = Math.min(writeOffForLastInvoice, remainingToWrite);
            remainingToWrite -= amountToWriteOff;
            writeOffForLastInvoice -= amountToWriteOff;

            // if (WriteOff > 0) {
            //     await ReceivePayment.create({
            //         invoice_id: lastInvoice.id,
            //         serial_number: lastInvoice.serial_number,
            //         customer_id: party,
            //         date: lastInvoice.date,
            //         item_for: item_for,
            //         invoice_payment: lastInvoice.invoice_payment,
            //         total_amount: lastInvoice.totalTax[0].grant_total,
            //         write_off: WriteOff,
            //     });
            // }
        }

        return RESPONSE.success(res, "Payment received", paidInvoices);
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
};




module.exports = {
    addPayment,
    getPayment,
    updatePayment,
    deletePayment,
    receivePayment
}