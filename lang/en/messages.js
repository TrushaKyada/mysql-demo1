
const MESSAGES = {

    // Authentication
    '1001': 'Register User successfully',
    '1002': 'Login successfully',
    '1003': 'User already registered with this email !',
    '1004': 'Your credentials do not match our records',
    '1005': 'Incorrect password!',
    '1006': 'Get profile successfully',
    '1007': 'Logout successfully',
    '1008': 'Sale person not exist',

    // company details
    '1501': "Company details and terms added successfully",
    '1502': "Company details and terms get successfully ",
    '1503': "Company details and terms Updated successfully ",

    // users
    '2001': 'Get users successfully',
    '2002': 'Delete user successfully',
    '2003': 'Update user successfully',
    '2004': 'User not found',
    '2005': 'Address id required',

    // Product
    '3001': 'Product added successfully',
    '3002': 'Get Product successfully',
    '3003': 'Product not found',
    '3004': 'Product updated successfully',
    '3005': 'Product delete successfully',

    // Orders
    '4001': 'Retail order created successfully',
    '4002': 'Customer created successfully',
    '4003': 'Customer MOQ does not match',

    // customer
    '5001': 'Retail customer added successfully',
    '5002': 'All Retail customer get successfully',
    '5003': 'No Retail customer found',
    '5004': 'Distributor added successfully',
    '5005': 'All Distributor get successfully',
    '5006': 'Please enter valid/all data of distributor ',
    '5007': 'Retail customer already exists',
    '5008': 'Distributor already exists',
    '5009': 'Distributor not exists',
    // reports
    '6001': 'Morning report updated successfully',
    '6002': 'Evening report updated successfully',

    //  Items
    '7001': 'Items add successfully',
    '7002': 'Item not found',
    '7003': 'Get item successfully',
    '7004': 'Get Finishes Goods item successfully',
    '7005': 'Update item successfully ',
    '7006': 'Update Finishes Goods item successfully',
    '7007': 'Item delete successfully',
    '7008': 'exp_date must be greater than mfg_date',

    // Universal property
    "8001": "This item type already exist",
    "8002": "Universal data create successfully",
    "8003": "Universal data is not found",
    "8004": "Get Universal data successfully",
    "8005": "Please provide one query parameter",
    "8006": "Parent category is not valid",
    "8007": "Universal data update successfully",
    "8008": "Universal data delete successfully",
    "8009": "Stock Category already exist",
    "8010": "Parent category not found",
    "8011": "Stock category Data not found",
    "8012": "Unit of measurement data not found",

    // Hsn data
    "8081": "Hsn data create successfully",
    "8082": "Hsn data get successfully",
    "8083": "Hsn data already Exist",
    '8084': 'Invalid HSN Code',
    '8085': 'Hsn data not found',
    '8086': 'Hsn data update successfully',
    '8087': 'Hsn data delete successfully',
    '8088': 'Hsn Code already exist',

    // Sale_Purchase Invoice
    "8101": "Invoice data create successfully",
    "8102": "This invoice data already exist",
    "8103": "Invoice data get successfully",
    "8104": "Invoice data update successfully",
    "8105": "Invoice cancel successfully",
    '8106': 'Please enter valid/all data of Invoice ',
    '8107': 'Order data Get successfully',
    "8108": "Order data create Successfully",
    "8109": "Invoice ID is required for multiple item deletion.",
    "8110": "Items and tax data can't be empty.",
    "8111": "Invoice data not found.",
    "8112": "Order data not found.",
    "8113": "Last invoice not found.",
    "8114": "Order data update successfully",
    "8115": "Order data delete successfully",
    "8116": "Invoice delete successfully ",
    "8117": "Invoice data revert successfully",
    "8118": "Credit limit is our",
    "8119": "Invoice submitted",
    "8120": "This Invoice Paid",
    "8121": "This Invoice can't Update",
    "8122": "Return create successfully",
    "8123": "Return get successfully",
    "8124": "Return update successfully",
    "8125": "Return delete successfully",



    // Sale_Purchase Serial number
    "8201": "Serial number create successfully",
    "8202": "This data already exist",
    "8203": "Serial number get successfully",
    "8204": "Serial number update successfully",
    "8205": "Serial number delete successfully",
    "8206": "Start value is already added for this reference type.",
    "8207": "Start length should match pad_zeros",
    "8208": "Serial number is not exist",
    "8209": "Serial number already exist",
    "8210": "Invalid serial number format.",


    // Sale_Purchase Party Data
    "8301": "Customer data create successfully",
    "8302": "This email already exist",
    "8303": "Customer data get successfully",
    "8304": "Customer data update successfully",
    "8305": "Customer data delete successfully",
    "8306": "GST IN number is required for registered regular GST registration.",
    "8307": "GST IN number must be unique.",
    "8308": "This phone number already exist",
    "8309": "Billing address not found",
    "8310": "Shipping address not found",
    "8311": "Customer data not exist",
    "8312": "From account not exist",
    "8313": "To account not exist",

    // Party address
    "8401": "Customer  address create successfully",
    "8403": "Customer  address Get successfully",
    "8404": "Customer  address update successfully",
    "8405": "Customer  address delete successfully",
    '8406': "Customer  already registered with this email !",
    '8407': "Customer  already registered with this mobile !",
    '8408': "Customer  already registered with this landline number1 first !",
    '8409': "Customer  already registered with this landline number2 first !",
    '8410': "Duplicate landline number within the batch",
    "8411": "Duplicate email addresses within the batch",
    "8412": "Duplicate mobile number within the batch",

    // Currency Data
    "8501": "Currency create successfully",
    "8502": "Symbol already exist",
    "8503": "Currency Get successfully",
    "8504": "Currency update successfully",
    "8505": "Currency delete successfully",
    "8506": "Currency name already exist",
    "8507": "Currency data not exist",

    //Account
    "8601": "Account data create successfully",
    "8602": "Account data not exist",
    "8603": "Account get successfully",
    "8604": "Account data update successfully",
    "8605": "Account data delete successfully",
    "8606": "Account data name already exist",

    //Payment 
    "8701": "Payment data create successfully",
    "8702": "This cheque already exist",
    "8703": "Payment data get successfully",
    "8704": "Payment data update successfully",
    "8705": "Payment data delete successfully",
    "8706": "cheque_no and clearance_date is required for payment_method Transfer and Cheque",
    "8707": "Payment data not exist",
    "8708": "Receive payment not exist",

    // item for item
    "8801": "Item create successfully",
    "8802": "This item name already exist",
    "8803": "Item get successfully",
    "8804": "Item update successfully",
    "8805": "Item delete successfully",
    "8806": "This item data not exist",
    "8807": "Stock unit data not exist",
    "8808": "User not Exist",
    // Tax 
    "8901": 'Tax data create successfully',
    "8902": 'Tax data get successfully',
    "8903": "Tax data not exist",

    // Price List Data
    "7101": "Items can't be empty.",
    "7102": "This Price List name already exist.",
    "7103": "Price List create successfully",
    "7104": "Price List get successfully",
    "7105": "Price List not Exist",
    "7106": "Price List update successfully",
    "7107": "Price List  delete successfully",
    "7108": "Given quantity not less than distributor moq",

    //**************** Manufacture ***************//
    // Formula
    "7201": "Formula created successfully",
    "7202": "Formula get successfully",
    "7203": "Formula update successfully",
    "7204": "Formula delete successfully",
    "7205": "Formula data not exist",
    "7206": "Bom name already exist",
    "7207": "Please enter valid data of Packing/billing material",
    // mfg Process && Order Godown
    "7301": "Godown Address created Successfully",
    "7302": "Godown Address get Successfully",
    "7303": "Godown Address update Successfully",
    "7304": "Godown Address delete Successfully",
    "7305": "Godown Address not exist",
    "7306": "Delivery address not exist",
    //  mfg Process && Order
    "7401": "Bom Name Not found",
    "7402": "Mfg Order Name already exist",
    "7403": "MFG Process && Order data created successfully",
    "7404": "MFG Process && Order data get successfully",
    "7405": "Can't Delete this record because it's already completed",
    "7406": "Mfg Process && Order data not found",
    "7407": "Mfg Process && Order deleted Successfully",
    // Room And Rack
    "7601": "Storage Room not exist",
    "7702": "Room is not exist",
    "7703": "Rack is already exist",
    "7704": "Material Location created successfully",
    "7705": "Material Location get successfully",
    "7706": "Material Location updated successfully",
    "7707": "Material Location delete successfully",
    "7708": "Material Location not Found",
    "7709": "Room create successfully",
    "7710": "Room get successfully",
    "7711": "Room update successfully",
    "7712": "Room delete successfully",

    // Inventory
    // Material Receiver
    "7501": "Material item can't empty",
    "7502": "Purchase invoice not exist",
    "7503": "Material Receiver not exist",
    "7504": "Material Receiver create successfully",
    "7505": "Material Receive get successfully",
    "7506": "Material Receive updated successfully",
    "7507": "Material Receive delete successfully",

    // Delivery
    "7601": "Delivery item Can't empty",
    "7602": "Delivery item not exist",
    "7603": "This Voucher already exist",
    "7604": "Delivery data create successfully",
    "7605": "Delivery data get successfully",
    "7606": "Delivery data not exist",
    "7607": "Delivery data update successfully ",
    "7608": "Delivery data delete successfully ",
    "7609": "This Voucher not exist",

    // Rack Data management
    "7801": "Rack Management get successfully",
    "7802": "Rack Management update successfully",
    "7803": "Rack data not exist",

    // Disptch 
    "7901":"Disptch Receive Items add successfully",
    "7902": "Disptch Receive item can't empty",
    "7903": "Purchase invoice not exist",
    "7904": "This Items not exist",
    "7905": "Disptch Item Receive get successfully",
    "7906": "Disptch Item Receive delete successfully",
    "7907": "Disptch Item Receive update successfully",

    //transports
    "7907": "Transporter Detail add successfully",
    "7908": "Transporter Detail can't empty",
    "7909": "This mobile number already exist",
    "7910": "Transporter Detail not exist",
    "7911": "Transporter Detail get successfully",
    "7912": "Transporter Detail delete successfully",
    "7913": "Transporter Detail Updated successfully",
    "7914": 'Transporter Detail already exist !',

    //Common
    '9000': 'Please Enter Valid data!',
    '9999': 'Something went wrong!'
}

module.exports.getMessage = function (messageCode) {
    if (isNaN(messageCode)) {
        return messageCode;
    }
    return messageCode ? MESSAGES[messageCode] : '';
};
