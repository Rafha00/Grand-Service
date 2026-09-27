import dotenv from "dotenv";



import express from "express";

import cors from "cors";

import brandsRoutes from './Routes/brandsRoutes.js';
import productsRoutes from './Routes/productsRoutes.js';

// import { supabase } from "./Config/supabaseClient"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/brands', brandsRoutes);
app.use('/api/products', productsRoutes);


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