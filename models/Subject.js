const mongoose=require('mongoose');

const subjectSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Subject name is required'],
        trim:true,
        maxlength:[100,'Name cannot exceed 100 characters']
    },
    description:{
        type:String,
        trim:true,
        default:'',
        maxlength:[200,'Description cannot exceed 200 characters']
    },
    icon:{
        type:String,
        default:'📚',
        maxlength:[10,'Icon should be a single emoji']
    },
    questionCount:{
        type:Number,
        default:0
    }

},{timestamps:true});
subjectSchema.index({name:1});
subjectSchema.index({createdAt:-1});

subjectSchema.methods.incrementQuestionCount = function(){
    this.questionCount++;
    return this.save();
};


subjectSchema.methods.decrementQuestionCount = function(){
    this.questionCount=Math.max(0,this.questionCount-1);
    return this.save();
};
subjectSchema.methods.incrementQuestionCountBy=function(amount){
    this.questionCount+=amount;
    return this.save();
}    

module.exports= mongoose.model('Subject',subjectSchema);