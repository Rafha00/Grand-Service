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

export const CreateBrands = async (req ,res) => {

    try {
       
    const { name, description, logo_url } = req.body;
       
         const {data , error} = await supabase
         .from('brands')
         .insert([{name, description ,logo_url}])
         .select()

         if (error)  {
            return res.status(400).json({error:error.message})
         } return res.status(200).json(data); 
        
        } catch (err) {
            return res.status(500).json({error:err.message})
        }

         
         
    
}

export const UpdateBrands = async (req, res) => {
    try {
        const { id } = req.params; // รับ id จาก URL (/api/brands/:id)
        const updateData = req.body; // รับข้อมูลที่จะอัปเดตจาก Body

        const { data, error } = await supabase
            .from('brands')
            .update({
                name: updateData.name,
                description: updateData.description,
                logo_url: updateData.logo_url
            })
            .eq('id', id) 
            .select()
            .single(); 

        if (error) {
            return res.status(400).json({ error: error.message });
        }   
        
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}









export const DeleteBrands = async (req ,res) => {
    try {
        const {id} = req.params;

        const {data , error} = await supabase
                .from('brands')
                .delete()
                .eq('id', id)
                .select();
                
                if (error) {
                    return res.status(400).json({error:error.message})
                } return res.status(200).json(data);
    } catch (err){
        return res.status(500).json({error:err.message})
    }


}

