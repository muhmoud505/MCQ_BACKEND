require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose')
const cors=require('cors');
const connectDB=require('./config/db');
// ============================================================
// CONNECT TO MONGODB
// ============================================================
connectDB();

const app=express();
// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.json({
        message: '🚀 CS Revision API',
        status: 'running',
        timestamp: new Date().toISOString()
    })
});
app.use('/api/subjects',require('./routes/subjects'))
app.use('/api/questions',require('./routes/questions'))
app.use('/api',require('./routes/misc'));
// ============================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).json({
        error:'Something went wrong!'
    })
})
// ============================================================
// START SERVER
// ============================================================
const PORT=process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0',()=>{
     console.log('');
  console.log('===========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://0.0.0.0:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('===========================================');
  console.log('');
})
