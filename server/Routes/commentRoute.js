const express = require('express');
const router = express.Router();
const { addComment, getCommentsForPoll } = require('../Controllers/commentController');
const jwtAuthMiddleware = require('../Middlewares/jwtAuthMiddleware');

router.post('/', jwtAuthMiddleware, addComment);
router.get('/:pollId', getCommentsForPoll);

module.exports = router;
