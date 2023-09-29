const messages = require('../lang/en/messages.js');
module.exports.success = function (res, messageCode = null, data = null, statusCode = 200) {
    var response = {};
    response.success = true;
    response.message = messages.getMessage(messageCode);
    if(data != null){
        response.data = data;
    }
    return res.status(statusCode).send(response);
};

module.exports.error = function (res, messageCode, statusCode = 422) {
    var response = {};
    response.success = false;
    response.message = messages.getMessage(messageCode);
    statusCode = (messageCode == 9999) ? 500 : statusCode;
    return res.status(statusCode).send(response)
};
