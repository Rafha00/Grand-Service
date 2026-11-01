import { supabase } from "../Config/supabaseClient.js";

export const getCategories = async (req , res) => {
            try {
                const {data, error} = await supabase
                    .from('Categories')
                    .select()

                    if (error) {
                        return res.status(400).json({error:error.message})
                    } return res.status(200).json(data)
            }  catch (err) {
                return res.status(500).json({error:err.message})
            }
} 

export const getCategoriesById = async (req , res) => {

    try {
        const {id} = req.params;
        const {data ,error} = await supabase
            .from('Categories')
            .select()
            .eq('id' , id)
            .single() 

            if (error) {
                return res.status(400).json({error:error.message})
            }  return res.status(200).json(data)
    } catch (err) {
         return res.status(500).json({error:err.message})
    }

}




export const CreateCategories  = async (req , res) => {
    try {
        const {name , description} = req.body

        if (!name) {
            return res.status(400).json({error:'กรอกชื่อหมวกหมู่ด้วย'})

        }
        const {data , error} = await supabase
            .from('Categories')
            .insert({name ,description})
            .select()

            if (error) {
                return res.status(400).json({error:error.message})
            } return res.status(200).json(data[0])

    } catch (err) {
        return res.status(500).json({error:err.message})
    }
  }

  export const UpdateCategories = async (req, res) => {
        try {
            const {name , description} = req.body
            const {id} = req.params;

            const {data ,error} = await supabase
                .from('Categories')
                .update({
                    name , description
                 })
                .eq('id' , id)
                .select()
                .single()

                if (error) {
                    return res.status(400).json({error:error.message})
                } return res.status(200).json(data)
        }  catch (err) {
            return res.status(500).json({error:err.message})
        }
  }

  export const DeleteCategories  = async (req , res) => {
    try {
        const {id} = req.params;
        const {data , error} = await supabase
        .from('Categories')
        .delete()
        .eq('id', id)
        .select()
         if (error) {
            return res.status(400).json({error:error.message})
         }  return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({error:err.message})
    }
  }