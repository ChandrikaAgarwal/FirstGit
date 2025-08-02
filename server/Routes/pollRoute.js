const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../Middlewares/jwtAuthMiddleware');
const pollControl=require('../Controllers/pollController')

router.post('/create', jwtAuthMiddleware, pollControl.createPoll)
router.get('/all-polls',jwtAuthMiddleware,pollControl.getAllPolls)
router.post('/vote',jwtAuthMiddleware,pollControl.votePoll)
module.exports = router;