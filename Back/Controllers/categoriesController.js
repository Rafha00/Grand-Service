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

export const CreateCategories  = async (req , res) => {
    try {
        const {name , description} = req.body
        const {data , error} = await supabase
            .from('Categories')
            .insert({name ,description})
            .select()

            if (error) {
                return res.status(400).json({error:error.message})
            } return res.status(200).json(data)

    } catch (err) {
        return res.status(500).json({error:err.message})
    }
  }

  export const UpdateCategories = async (req, res) => {
        try {
            const updateData = req.body
            const {id} = req.parms;

            const {data ,error} = await supabase
                .from('Categories')
                .update({
                    name : updateData.name,
                    description : updateData.description
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
        const {id} = req.parms;
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