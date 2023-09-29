const db = require('../../config/db.config')
const Validator = require('validatorjs')

const Admin = db.admin
const AdminSession = db.admin_session

/**
 * Admin login
 * **/

// const login = async (req, res) => {
//     let validation = new Validator(req.body, {
//         email: 'required|email',
//         password: 'required',
//     });
//     if (validation.fails()) {
//         firstMessage = Object.keys(validation.errors.all())[0];
//         return RESPONSE.error(res, validation.errors.first(firstMessage))
//     }
//     try {
//         const { email, password } = req.body
//         const admin = await Admin.scope('withPassword').findOne({ where: { email } })
//         if (!admin) {
//             return RESPONSE.error(res, 1004, 404)
//         }
//         if (!Admin.comparePassword(password, admin.password)) {
//             return RESPONSE.error(res, 1005)
//         }
//         let adminJson = admin.toJSON()
//         delete adminJson.password
//         adminJson.token = await AdminSession.createToken(admin.id)
//         return RESPONSE.success(res, 1002, adminJson)
//     } catch (error) {
//         console.log(error)
//         return RESPONSE.error(res, 9999)
//     }
// }

/**
 *  logout
 * **/


// const logout = async (req, res) => {
//     try {
//         const { authorization } = req.headers
//         const token = authorization.split(' ')[1]
//         const deletedrow = await AdminSession.destroy({
//             where: { token: token },
//             force: true
//         })
//         return RESPONSE.success(res, 1007)
//     } catch (error) {
//         console.log(error)
//         return RESPONSE.error(res, 9999)
//     }
// }

module.exports = { /*login, logout */}