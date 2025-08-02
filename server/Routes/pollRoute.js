const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../Middlewares/jwtAuthMiddleware');
const pollControl=require('../Controllers/pollController')

router.post('/create', jwtAuthMiddleware, pollControl.createPoll)
router.get('/all-polls',pollControl.getAllPolls)

module.exports = router;