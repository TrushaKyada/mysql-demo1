const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public', 'images', 'profile_images'))
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9)
        let imgExtension = file.originalname.split('.')
        imgExtension = imgExtension[imgExtension.length - 1]
        cb(null, `${file.fieldname}_${uniqueSuffix}.${imgExtension}`)
    }
})

const imageUpload = multer({ storage: storage })

module.exports = imageUpload