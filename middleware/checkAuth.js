const db = require('../config/db.config')
const AdminSession = db.admin_session
const Admin = db.admin
const UserSession = db.user_session
const User = db.user
const { Op } = db.Sequelize

/**
 * che authentication for admin
 * **/

// const adminAuth = async (req, res, next) => {
//     const { authorization } = req.headers
//     const token = authorization?.split(' ')[1] || null
//     if (!token) {
//         return res.status(401).json({ success: false, message: 'Unauthorized', })
//     }
//     const isAuth = await AdminSession.findOne({
//         where: { token },
//         attributes: ['admin_id', 'expired_at']
//     })
//     if (!isAuth) {
//         return res.status(401).json({ success: false, message: 'Unauthorized', })
//     }
//     const isTokenExpired = isAuth.expired_at < Date.now()
//     if (isTokenExpired) {
//         return res.status(401).json({ success: false, message: 'Unauthorized', })
//     }
//     const user = await Admin.findOne({
//         where: { id: isAuth.admin_id }
//     })
//     if (!user) {
//         return res.status(401).json({ success: false, message: 'Unauthorized', })
//     }
//     req.user = user
//     next()
// }

/**
 * che authentication for User
 * **/

const userAuth = async (req, res, next) => {
    const { authorization } = req.headers
    const token = authorization?.split(' ')[1] || null
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized', })
    }
    const isAuth = await UserSession.findOne({
        where: {
            token,
            expired_at: {
                [Op.lt]: Date.now() + 28 * 24 * 60 * 60 * 1000
            }
        },
        attributes: ['user_id', 'expired_at']
    })
    if (!isAuth) {
        return res.status(401).json({ success: false, message: 'Unauthorized', })
    }
    // const isTokenExpired = isAuth.expired_at < Date.now()
    // if (isTokenExpired) {
    //     return res.status(401).json({ success: false, message: 'Unauthorized', })
    // }
    const user = await User.findOne({
        where: { id: isAuth.user_id }
    })
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized', })
    }
    req.user = user.toJSON()
    next()
}

const authPermission = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(401).json({ success: false, message: 'Unauthorized', })
        }
        next()
    }
}

module.exports = { /*adminAuth,*/ userAuth, authPermission }