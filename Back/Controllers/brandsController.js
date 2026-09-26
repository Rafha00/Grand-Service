import { supabase } from '../Config/supabaseClient.js';

export const getBrands = async (req, res) => {
    try {
         const {data ,error} = await supabase
        .from('brands')
        .select('*')

        if (error)  {
            return res.status(400).json({ success: false , message:error.message});
        } return res.status(200).json({success:true , data})
    } catch (err) {
        return res.status(500).json({success:false , message:err.message})
    }
   
       
    
};