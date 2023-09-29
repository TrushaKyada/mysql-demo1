const router = require('express').Router()

// const AdminController = require('../controllers/admin/auth.controller')
const UserController = require('../controllers/admin/user.controller')
const { userAuth, authPermission } = require('../middleware/checkAuth')


// admin routes 
// router.post('/login', AdminController.login)
// router.delete('/logout', AdminController.logout)


// user CRUD
router.post('/create-user', userAuth,authPermission('Admin'), UserController.createUser)
router.get('/get_all_user',userAuth,authPermission('Admin'),UserController.getAllUser)
router.get('/get-user/:id', userAuth, authPermission('Admin'), UserController.getUser)
router.delete('/delete-user/:id', userAuth, authPermission('Admin'), UserController.deleteUser)
router.patch('/update-user/:id', userAuth, authPermission('Admin'), UserController.updateUser)


module.exports = router