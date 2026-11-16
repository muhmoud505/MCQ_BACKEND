const  mongoose = require('mongoose');
const Question=require('../models/Question');
const Subject=require('../models/Subject');
const parseBulkText=require('../utils/parseBulkText');

const getQuestions=async(req,res)=>{
    try {
        const {subjectId}=req.query;
        const filter = subjectId ? {subjectId}:{};
        const questions= await Question.find(filter).sort({createdAt:-1});
        res.status(200).json({
            success:true,
            count:questions.length,
            data:questions,
        })
    } catch (error) {
        console.error('❌ getQuestions error:', error);
        res.status(500).json({
            success:false,
            error:'Failed to fetch questions',
            message:'Server error'
        })
    }
}

const getQuestionById=async(req,res)=>{
    try {
        const question= await Question.findById(req.params.id);
        if(!question){
            return res.status(404).json({
                success:false,
                error:'Question not found'
            })
        }
        res.status(200).json({
            success:true,
            data:question
        })
    } catch (error) {
        console.error('❌ getQuestionById error:', error);
        res.status(500).json({
            success:false,
            error:'Failed to fetch question',
            message:error.message
        })
    }
}

const createQuestion= async(req,res)=>{
    try {
        const {subjectId}=req.body;

        const subject= await Subject.findById(subjectId);
        if(!subject){
            return res.status(404).json({
                success:false,
                error:'Subject not found'
            })
        }

        const question= new Question(req.body);
        await question.save();
        await subject.incrementQuestionCount();
        res.status(201).json({
            success:true,
            data:question
        })
    } catch (error) {
        console.error('❌ createQuestion error:', error);
        if(error.name==='ValidationError'){
            const messages= Object.values(error.errors).map(err=>err.message);
            return res.status(400).json({
                success:false,
                error:'Validation failed',
                messages
            })
        }
        res.status(500).json({
            success:false,
            error:'Failed to create question',
            message:error.message
        })
        

    }
}

const updateQuestion = async(req,res)=>{
    try {
        const question= await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true,
                runValidators:true
            }
            )
            if(!question){
                return res.status(404).json({
                    success:false,
                    error:'Quesiton not found'
                })
            }
            res.status(200).json({
                success:true,
                data:question
            })
    } catch (error) {
        console.error('❌ updateQuestion error:', error);
        res.status(500).json({
            success:false,
            error:'Failed to update question',
            message:error.message
        })

    }
}

const deleteQuestion=async(req,res)=>{
    try {
        const question=await Question.findById(req.params.id);
         if(!question){
                return res.status(404).json({
                    success:false,
                    error:'Quesiton not found'
                })
            }
            await Question.findByIdAndDelete(req.params.id);
            const subject=await Subject.findById(question.subjectId);
            if(subject){
                await subject.decrementQuestionCount();
            }
            res.status(200).json({
                success:true,
                message:'Question Deleted'
            })
    } catch (error) {
            console.error('❌ deleteQuestion error:', error);
            res.status(500).json({
                success:false,
                error:'Failed to delete question',
                message:error.message
            })
    }
}

const updateQuestionReview = async(req,res)=>{
    try {
        const {isCorrect} = req.body;
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                success:false,
                error:'Invalid question ID'
            })
        }
        const question = await Question.findById(req.params.id);
        if(!question){
            return res.status(404).json({
                success:false,
                error:'Question not found'
            })
        }
        if(isCorrect){
            await question.recordCorrect();
        }else{
            await question.recordIncorrect();
        }
        res.status(200).json({
            success:true,
            data:question
        })
    } catch (error) {
         console.error('❌ updateQuestionReview error:', error);
         res.status(500).json({
            success:false,
            error:'Failed to update question review',
            message:error.message
        })
    }
}

const getQuizQuestions= async(req,res)=>{
    try {
        const {subjectId,count=10}=req.query;
        if(!subjectId){
            return res.status(400).json({
                success:false,
                error:'subjectId is required'
            })
        }

        const questions=await Question.aggregate([
            {
                $match:{subjectId:new mongoose.Types.ObjectId(subjectId)}
            },
            {$sample:{size:parseInt(count)}}
        ]);

        res.status(200).json({
            success:true,
            count:questions.length,
            data:questions
        })
    } catch (error) {
        console.error('❌ getQuizQuestions error:', error);
        res.status(500).json({
            success:false,
            error:'Failed to get quiz questions',
            message:error.message
        })
    }
}

const bulkCreateQuestions=async(req,res)=>{
    try {
        const {subjectId,rawText}=req.body;
        const subject=await Subject.findById(subjectId);
        if(!subject){
            return res.status(404).json({
                success:false,
                error:'Subject not found'
            })
        }
        const questionsToInsert=parseBulkText(rawText,subjectId);
        if(questionsToInsert.length===0){
            return res.status(400).json({
                success:false,
                error:'No valid questions found. Please check your input format.'
            })
        }
        if(questionsToInsert.length>100){
            return res.status(400).json({
                success:false,
                error:'Maximum 100 questions allowed per bulk add'
            });
        }
        const createdQuestions=await Question.insertMany(questionsToInsert,{
            runValidator:true,
        })
        await subject.incrementQuestionCountBy(createdQuestions.length)
        res.status(201).json({
            success:true,
            message:`Successfully added ${createdQuestions.length} questions`
        })
    } catch (error) {
        console.error('❌ bulkCreateQuestions error:', error);
        res.status(500).json({
            success:false,
            error:'Failed to add questions',
            message:error.message
        })
    }
}

module.exports={
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    updateQuestionReview,
    getQuizQuestions,
    bulkCreateQuestions
}