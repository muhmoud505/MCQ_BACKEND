const Question = require('../models/Question');
const Subject = require('../models/Subject');;
const mongoose=require('mongoose');


const searchQuestions=async (req,res)=>{
    try {
        const {q}=req.query;
        if(!q||q.trim().length<3){
            return res.status(400).json({
                success:false,
                error:'Search query must be at least 3 characters long'
            });
        }
        const regex=new RegExp(q,'i');
        const questions=await Question.find({
            $or:[
                {question:regex},
                {answer:regex},
                {explanation:regex}
            ]
        }).populate('subjectId','name icon').limit(20)
        
        res.status(200).json({
            success:true,
            count:questions.length,
            data:questions
        });
    } catch (error) {
        
        console.error('❌ searchQuestions error:', error);
        res.status(500).json({
            success:false,
            error:'Search failed'
        });
    }
};

const getStats=async (req,res)=>{
    try {
        const totalSubjects=await Subject.countDocuments();
        const totalQuestions=await Question.countDocuments();
        const overallStats=await Question.aggregate([
            {
                $group:{
                    _id:null,
                    totalCorrect:{$sum:'$correctCount'},
                    totalIncorrect:{$sum:'$incorrectCount'}
                }
            }
        ]);

        let overallMastery=0;
        let masteredQuestions=0;
        if(overallStats.length>0){
            const {totalCorrect,totalIncorrect}=overallStats[0];
            const totalAttempts=totalCorrect+totalIncorrect;
            if (totalAttempts>0){
                overallMastery=Math.round((totalCorrect/totalAttempts)*100);
            }
            masteredQuestions=await Question.countDocuments({
                $expr:{$gt:['$correctCount','$incorrectCount']}
            })
        }
        const subjectStats=await Question.aggregate([
            {
                $group:{
                    _id:'$subjectId',
                    totalQuestions:{$sum:1},
                    totalCorrect:{$sum:'$correctCount'},
                    totalIncorrect:{$sum:'$incorrectCount'}
                }
            },
            {
                $lookup:{
                    from:'subjects',
                    localField:'_id',
                    foreignField:'_id',
                    as:'subjectInfo'
                }
            },
            {
                $unwind:'$subjectInfo'
            },
            {
                $project:{
                    _id:0,
                    subjectId:'$_id',
                    name:'$subjectInfo.name',
                    icon:'$subjectInfo.icon',
                    questionCount:'$totalQuestions',
                    mastery:{
                        $cond:[
                            {
                                $eq:[{$add:['$totalCorrect','$totalIncorrect']},0],
                            },
                            0,
                            {
                                $round:[
                                    {
                                        $multiply:[
                                            {
                                                $divide:[
                                                    '$totalCorrect',
                                                    {
                                                        $add:[
                                                            '$totalCorrect',
                                                            '$totalIncorrect'
                                                        ]
                                                    }
                                                ]
                                            },
                                            100
                                        ]
                                    },
                                    0
                                ]
                            }
                        ]
                    }
                }
            }
        ]);
        res.status(200).json({
            success:true,
            data:{
                totalSubjects,
                totalQuestions,
                masteredQuestions,
                overallMastery,
                subjectStats,
                streak:4,
            }
        })
    } catch (error) {
        console.error('❌ getStats error:', error);
        res.status(500).json({ success: false, error: 'Failed to get stats' });
    }
}

module.exports = {
    getStats,
    searchQuestions
}
