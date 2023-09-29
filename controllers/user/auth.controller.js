const db = require('../../config/db.config')
const Validator = require('validatorjs')
const User = db.user
const DailyReport = db.daily_report
const UserSession = db.user_session
const Distributor = db.customer_details
const fs = require('fs')
const Op = db.Sequelize.Op


/**
 * User Login 
*/
const login = async (req, res) => {
    let validation = new Validator(req.body, {
        email: 'required|email',
        password: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage));
    }
    const TODAY_START = new Date().setHours(0, 0, 0, 0);
    const NOW = new Date();

    const createdAt = {
        [Op.gt]: TODAY_START,
        [Op.lt]: NOW
    }
    try {

        const { body: { email, password } } = req
        const user = await User.scope('withPassword').findOne({
            where: { email },
            include: [{
                model: DailyReport,
                where: { createdAt },
                attributes: ['isMorningReportSubmitted', 'isEveningReportSubmitted'],
                required: false,
                include: [{
                    model: Distributor,
                    attributes: ['firm_name'],
                }]
            }]
        })
        if (!user) {
            return RESPONSE.error(res, 1004, 404)
        }
        if (password != user.password) {
            return RESPONSE.error(res, 1005)
        }
        let userJSON = user.toJSON()
        delete userJSON.password
        userJSON.token = await UserSession.createToken(user.id)
        return RESPONSE.success(res, 1002, userJSON)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}
/**
 * User Logout 
*/
const logout = async (req, res) => {
    const { authorization } = req.headers
    const token = authorization.split(' ')[1]
    try {
        await UserSession.destroy({
            where: { token },
            force: true
        })
        return RESPONSE.success(res, 1007)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

/**
 * User can Get his/her Profile 
*/
const getUserProfile = async (req, res) => {
    try {
        const user = req.user
        return RESPONSE.success(res, 1006, user)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

/**
 * User can Update his/her Profile name only
*/
const updateUserProfile = async (req, res) => {
    let validation = new Validator(req.body, {
        name: 'required'
    },
    );
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage));
    }
    try {
        const { id } = req.user


        const user = await User.findOne({ where: { id } })
        if (!user) {
            return RESPONSE.error(res, 2004, 404)
        }
        let profile_image
        if (req.file) {
            if (user.profile_image) {
                let image = user.profile_image.split('/')
                image = image[image.length - 1]
                const imagePath = `public/images/profile_images/${image}`
                fs.unlinkSync(imagePath)
            }
            profile_image = req.file.filename
        }
        user.name = req.body.name
        user.profile_image = profile_image

        await user.save()
        // await UserSession.destroy({
        //     where: { user_id: id },
        //     force: true
        // })
        return RESPONSE.success(res, 2003, user)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

/**
 * User can change his/her Password 
*/
// const changeUserPassword = async (req, res) => {
//     let validation = new Validator(req.body, {
//         oldPassword: 'required',
//         newPassword: 'required',
//         newConfirmPassword: "required"
//     },
//     );
//     if (validation.fails()) {
//         firstMessage = Object.keys(validation.errors.all())[0];
//         return RESPONSE.error(res, validation.errors.first(firstMessage));
//     }
//     try {
//         const { body: { oldPassword, newPassword, newConfirmPassword } } = req
//         if (newPassword !== newConfirmPassword) {
//             return RESPONSE.error(res, 9000, 400)
//         }
//         const { email, id } = req.user.toJSON()
//         const authUser = await User.scope('withPassword').findOne({
//             where: { email }
//         })
//         if (!authUser) {
//             return RESPONSE.error(res, 1004, 404)
//         }
//         if (!User.comparePassword(oldPassword, authUser.password)) {
//             return RESPONSE.error(res, 1005)
//         }
//         const user = await User.update({ password: newPassword }, { where: { id } })
//         if (!user) {
//             return RESPONSE.error(res, 2004, 404)
//         }
//         await UserSession.destroy({
//             where: { user_id: id },
//             force: true
//         })
//         return RESPONSE.success(res, 2003, user)
//     } catch (error) {
//         console.log(error)
//         return RESPONSE.error(res, 9999)
//     }
// }



module.exports = { login, logout, getUserProfile, updateUserProfile }