import express from "express"
import dotenv from "dotenv"
import cors from "cors"

// import { supabase } from "./Config/supabaseClient"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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