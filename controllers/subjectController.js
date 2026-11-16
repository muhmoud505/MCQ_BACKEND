const Subject=require('../models/Subject');
const Question=require('../models/Question');

const getSubjects= async (req,res)=>{
    try{
        const subjects= await Subject.find().sort({createdAt:-1})
        res.status(200).json(
            {
                success:true,
                count:subjects.length,
                data:subjects
            }
        );                                                                 
    }
    catch(error){
        console.error('❌ getSubjects error:', error);
        res.status(500).json({
            success:false,
            error:'Failed to fetch subjects',
            message:error.message
        })
    }
}

const getSubjectById= async (req,res)=>{
    try {
        const subject=await Subject.findById(req.params.id);
        if(!subject){
            return res.status(404).json({
                success:false,
                error:'Subject not found'
            })
        }
        res.status(200).json({
            success:true,
            data:subject
        })
    } catch (error) {
        console.error('❌ getSubjectById error:', error);
        res.status(500).json({
            success:false,
            error:'Failed to fetch subject',
            message:error.message
        })
    }
};

const createSubject= async (req,res)=>{
    try {
        const {name,description,icon}=req.body;

        const existing= await Subject.findOne({name:name.trim()});
        if(existing){
            return res.status(400).json({
                success:false,
                error:'Subject with this name already exists'
            })
        }

        const subject= await Subject.create({
            name,
            description,
            icon
        });
        res.status(201).json({
            success:true,
            data:subject
        })
    } catch (error) {
        console.error('❌ createSubject error:', error);
        if(error.name==='ValidationError'){
            const messages=Object.values(error.errors).map((e)=>e.message);
            return res.status(400).json({
                success:true,
                error:'Validation failed',
                messages,
            })
        }
        res.status(500).json({
            success:false,
            error:'Failed to create subject',
            message:error.message
        })

    }
}


const updateSubject= async(req,res)=>{
    try {
        const {name,description,icon}=req.body;

        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            {
            name,description,icon
            },
            {
                new:true,
                runValidators:true
            }
    );
    if(!subject){
        return res.status(404).json({
            success:false,
            error:'Subject not found'
        })
    }
    res.status(200).json({
        success:true,
        data:subject
    })
    } catch (error) {
        console.error('❌ updateSubject error:', error);
        res.status(500).json({
            success:false,
            error:'Failed to update subject',
            message:error.message
        })
    }
}

const deleteSubject= async(req,res)=>{
    try {
        const subject=await Subject.findById(req.params.id);
        if(!subject){
            return res.status(404).json({
                success:false,
                error:'Subject not found'
            })
        }
        const deletedQuestions=await Question.deleteMany({subjectId:req.params.id});
        await Subject.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success:true,
            message:'Subject Deleted',
            deletedQuestions:deletedQuestions.deletedCount
        })
    } catch (error) {
        console.error('❌ deleteSubject error:', error);
        res.status(500).json({
            success:false,
            error:'Failed to delete subject',
            message:error.message
        })
    }
}

module.exports={
    getSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject
}
