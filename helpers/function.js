
  function encryptPassword(value) {
    const hashPassword = Buffer.from(value).toString('base64')
    return hashPassword ;

}
function decryptedPassword(value) {
    return value ? Buffer.from(value,"base64").toString('utf-8') : null;
  }

// // Remove NULL key field in Response
function transformData(data) {
  return JSON.parse(JSON.stringify(data, (key, value) => (value === null ? undefined : value)));
}
//unit quantity decimal point select based of qty_deci_place in  item data
function decimalPointSplit(quantity, qty_deci_places){
  const decimalPlaces = qty_deci_places !== null ? qty_deci_places : 0
  const splitValue = quantity?.toString().split('.')
  quantity = splitValue ? decimalPlaces > 0 && splitValue[1] ? splitValue[0] + '.' + splitValue[1].padEnd(decimalPlaces, '0').slice(0, decimalPlaces) : splitValue[0] : null
  return quantity
}

module.exports = {
    encryptPassword,
    decryptedPassword,
    transformData,
    decimalPointSplit
}