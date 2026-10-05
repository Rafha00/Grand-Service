import dotenv from "dotenv";



import express from "express";
import cookieParser from "cookie-parser"; 
import cors from "cors";

import authRoutes from "./Routes/authRoutes.js";
import brandsRoutes from './Routes/brandsRoutes.js';
import productsRoutes from './Routes/productsRoutes.js';
import categoriesRoutes from './Routes/categoriesRoutes.js'
import inventoryRoutes from './Routes/inventoryRouts.js'

// import { supabase } from "./Config/supabaseClient"

dotenv.config();

const app = express();


app.use(cors({
     origin: 'http://localhost:5173', 
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use('/api/brands', brandsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories' , categoriesRoutes);
app.use('/api/inventory' , inventoryRoutes )


app.use((err, req,res , next) => {
    console.error(err)
    res.status(500).json({
        success:false,
        message:"Server Error"
    })
})

const PORT = process.env.PORT;
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
})