const {body}=require('express-validator');

const createQuestionRules =()=>{
    return [
      body('subjectId')
      .isEmpty()
      .withMessage('Subject ID is required')
      .isMongoId()
      .withMessage('Invalid subject ID format'),
      body('question')
      .trim()
      .notEmpty()
      .withMessage('Question is required')
      .isLength({min: 500})
      .withMessage('Question must be at least 500 characters long'),
      body('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
      body('type')
      .optional()
      .isIn(['multiple_choice', 'true_false', 'short_answer'])
      .withMessage('Invalid question type'),
      body('options')
      .if(body('type').equals('multiple_choice'))
      .isArray({min: 2})
      .withMessage('Multiple choice questions must have at least 2 options'),
      body('correctOptionIndex')
      .if(body('type')
      .equals('multiple_choice'))
      .isInt({min:0}).withMessage('Correct option index must be a number'),
      body('explanation')
      .optional()
      .trim()
      .escape()//prevent xss attacks,
      ,
      body('codeSnippet')
      .optional()
      .trim()
    ]
}
const bulkCreateQuestionRules=()=>{
  return [
    body('subjectId')
      .notEmpty()
      .isMongoId().withMessage('Subject ID is required'),
    body('rawText')
      .notEmpty().withMessage('Text is required')
      .isString().withMessage('Text must be a string')
      .isLength({max: 50000}).withMessage('Text is too long (max 50,000 characters)')
  ]
}
module.exports={createQuestionRules, bulkCreateQuestionRules};