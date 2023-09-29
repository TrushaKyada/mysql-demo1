const router = require('express').Router()

const UserController = require('../controllers/user/auth.controller')
const { userAuth } = require('../middleware/checkAuth')
const imageUpload = require('../middleware/fileUpload').single('profile_image')

// user routes
router.post('/login', UserController.login)
router.delete('/logout', userAuth, UserController.logout)
router.get('/get-profile', userAuth, UserController.getUserProfile)
router.patch('/update-profile', userAuth, imageUpload, UserController.updateUserProfile)
// router.patch('/change-password', userAuth, UserController.changeUserPassword)

module.exports = router