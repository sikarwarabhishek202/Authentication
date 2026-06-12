require('dotenv').config();
const express=require('express');
const path=require('path');
const connectToDB = require('./database/db');
const app=express();
const authRoutes=require('./routes/auth-routes');
const homeRoutes=require('./routes/home-routes');
const adminRoutes=require('./routes/admin-routes');
const uploadImageRoutes=require('./routes/image-routes');

connectToDB();

const PORT=process.env.PORT || 3000;

// Enable CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth',authRoutes);
app.use('/api/home',homeRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/image',uploadImageRoutes);

// Fallback to serve SPA index.html for all non-API routes
app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})