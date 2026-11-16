const express=require('express');
const router= express.Router();

const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateQuestionReview,
  getQuizQuestions,
  bulkCreateQuestions
} = require('../controllers/questionController');

const validate=require('../middleware/validate');
const { bulkCreateQuestionRules } = require('../validators/questionValidator');

router
    .route('/')
    .get(getQuestions)
    .post(createQuestion);

router.get('/quiz', getQuizQuestions);

router
    .route('/:id')
    .get(getQuestionById)
    .put(updateQuestion)
    .delete(deleteQuestion);

router
    .route('/:id/review')
    .patch(updateQuestionReview);

router.post('/bulk', bulkCreateQuestionRules(), validate, bulkCreateQuestions);
module.exports=router;
