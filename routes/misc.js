const express=require('express');
const router=express.Router();

const { getStats, searchQuestions } = require('../controllers/miscController');

router.get('/stats', getStats);
router.get('/search', searchQuestions);

module.exports=router;