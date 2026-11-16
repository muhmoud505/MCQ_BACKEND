const mongoose=require('mongoose');


const questionSchema= new mongoose.Schema({
    subjectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Subject',
        required:[true,'Subject ID is required'],
      
    },
    question:{
        type:String,
        required:[true,'Question is required'],
        trim:true,
        maxlength:[500,'Question cannot exceed 500 characters'],
    },
    answer:{
        type:String,
        trim:true,
        maxlength:[1000,'Answer cannot exceed 1000 characters'],
        default:''
    },
    explanation:{
        type:String,
        trim:true,
        default:'',
        maxlength:[1000,'Explanation cannot exceed 1000 characters']
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        default:'medium'
    },
    type:{
        type:String,
        enum:['flashcard','multiple_choice','true_false'],
        default:'flashcard'
    },
    options:{
        type:[String],
        default:[],
    },
    correctOptionIndex:{
        type:Number,
        default:null
    },
    correctBoolean:{
        type:Boolean,
        default:null
    },
    codeSnippet:{
        type:String,
        default:'',
        trim:true,
        maxlength:[2000,'Code snippet cannot exceed 2000 characters']
    },
    codeLanguage:{
        type:String,
        default:'',
    },
    correctCount:{
        type:Number,
        default:0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    lastReviewed:{
        type:Date,
        default:null
    },
},{timestamps:true});

questionSchema.index({subjectId:1});
questionSchema.index({subjectId:1, difficulty:1});
questionSchema.index({subjectId:1, type:1});
questionSchema.index({subjectId:1, difficulty:1, type:1});

questionSchema.virtual('mastery').get(function(){
    const total =this.correctCount + this.incorrectCount;
    if(total === 0) return 0;
    return Math.round((this.correctCount / total) * 100);
});

questionSchema.methods.recordIncorrect= async function(){
    this.incorrectCount +=1;
    this.lastReviewed = new Date();
    return await this.save();
};
questionSchema.methods.recordCorrect= async function(){
    this.correctCount +=1;
    this.lastReviewed = new Date();
    return await this.save();
};

module.exports= mongoose.model('Question',questionSchema);