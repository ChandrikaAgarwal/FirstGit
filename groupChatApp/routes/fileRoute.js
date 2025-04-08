const express = require('express')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')
const upload = require('../middlewares/multer')
const fileController = require('../controllers/fileUploadController')
const { route } = require('./userRouter')

router.post('/api/fileupload/group/:groupId',jwtAuthMiddleware,upload.array('files'),fileController.uploadFiles)

module.exports = router;