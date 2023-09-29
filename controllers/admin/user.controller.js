const db = require('../../config/db.config')
const User = db.user
const UserSession = db.user_session
const Validator = require('validatorjs')

/**
 * Admin Can create New User
 * **/
const createUser = async (req, res) => {
    let validation = new Validator(req.body, {
        email: 'required|email',
        password: 'required',
        name: 'required',
        role: 'required',
        mobile_number: "required"
    },
    );
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage));
    }
    try {
        const { email, password, name, role, mobile_number } = req.body
        if (await User.isExistField('email', email)) {
            return RESPONSE.error(res, 1003)
        }
        const user = await User.create({
            email, password, name, role, mobile_number
        })
        // const userJSON = user.toJSON()
        // userJSON.token = await UserSession.createToken(user.id)
        // return RESPONSE.success(res, 1001, userJSON)
        return RESPONSE.success(res, 1001, user)
    } catch (error) {
        return RESPONSE.error(res, 9999)
    }
}
/**
 * Admin Can get User 
 * **/
const getAllUser = async (req, res) => {
    try {
        let { role } = req.query
        // if (!role) {
        //     role = 'mr'
        // }
        const user = await User.scope('withPassword').findAll({ ...(role) && { where: { role } } })
        if (!user.length) {
            return RESPONSE.error(res, 2004, 404)
        }
        return RESPONSE.success(res, 2001, user)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

/**
 * Admin Can get User by id
 * **/
const getUser = async (req, res) => {
    try {
        const { params: { id } } = req
        const user = await User.scope('withPassword').findOne({
            where: { id }
        })
        if (!user) {
            return RESPONSE.error(res, 2004, 404)
        }
        const userJSON = user.toJSON()
        return RESPONSE.success(res, 2001, userJSON)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

/**
 * Admin Can delete User
 * **/
const deleteUser = async (req, res) => {
    try {
        const { params: { id } } = req
        const user = await User.destroy({
            where: { id }
        })
        if (!user) {
            return RESPONSE.error(res, 2004, 404)
        }
        await UserSession.destroy({
            where: { user_id: id },
            force: true
        })
        return RESPONSE.success(res, 2002)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

/**
 * Admin Can update User
 * **/
const updateUser = async (req, res) => {
    let validation = new Validator(req.body, {
        email: 'required|email',
        password: 'required',
        name: 'required',
        role: 'required',
        mobile_number: "required"
    },
    );
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage));
    }
    try {
        const { body, params: { id } } = req
        const user = await User.update(body, { where: { id } })
        if (!user) {
            return RESPONSE.error(res, 2004, 404)
        }
        const userData = await User.scope('withPassword').findOne({ where: { id } })
        return RESPONSE.success(res, 2003, userData)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

module.exports = { createUser, getUser, deleteUser, updateUser, getAllUser }