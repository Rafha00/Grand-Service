import { supabase } from "../Config/supabaseClient.js";

export const getProducts = async (req ,res) => {
        try {
            const {data ,error} = await supabase
            .from('Products')
            .select('*')

            if (error) {
                return res.status(400).json({error:error.message})
            } return res.status(200).json(data)
        } catch (err) {
            return res.status(500).json({error:err.message})
        }
}

export const getProductsById = async (req, res) => {
    try {
            const {id} = req.params;
            const {data , error} = await supabase
                .from('Products')
                .eq('id', id)
                .select()
                .single()

                if (error) {
                    return res.status(400).json({error:error.message})
                } return res.status(200).json(data)
    }  catch (err) {
        return res.status(500).json({error:err.message})
    }

}

export const CreateProducts = async (req , res) => {
        try {
            const {name , model , reference_number, price ,condition , year , movement , case_size , case_material , warranty} = req.body
            const {data , error} = await supabase
                .from('Products')
                .insert({name , model , reference_number, price ,condition , year , movement , case_size , case_material , warranty })
                .select()

                if (error)  {
                    return res.status(400).json({error:error.message})
                } return res.status(200).json(data)
        }  catch (err) {
            return res.status(500).json({error:err.message})
        }
}

export const UpdateProducts = async (req ,res) => {
           try {
            const {id} = req.params;
            const updateData =  req.body
            const {data , error} = await supabase
                .from('Products')
                .update({
                    name : updateData.name,
                    model :updateData.model,
                    reference_number : updateData.reference_number,
                    price : updateData.price,
                    condition : updateData.condition,
                    year : updateData.year,
                    movement : updateData.movement,
                    case_size : updateData.case_size,
                    case_material : updateData.case_material,
                    warranty : updateData.warranty

                    }) 
                    .eq('id' ,id)
                    .select()
                    .single()
                    

                    if (error) {
                        return res.status(400).json({error:error.message})
                    } return res.status(200).json(data)

           }    catch (err) {
                return res.status(500).json({error:err.message})
           }
}

export const DeleteProducts = async (req ,res) => {
     try {
        const {id} = req.params;
        const {data , error} = await supabase
            .from('Products')
            .delete()
            .eq('id' , id)
            .select()

            if (error)  {
                return res.status(400).json({error:error.message})
            } return  res.status(200).json(data)
     }  catch (err) {
        return res.status(500).json({error:err.message})
     }
}