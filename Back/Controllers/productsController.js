import { supabase } from "../Config/supabaseClient.js";

export const getProducts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Products')
            .select(`
                *,
                brands (id, name, logo_url),
                Categories (id, name),
                 Product_Images (*)
            `); 

        if (error) {
            return res.status(400).json({ error: error.message });
        } 
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export const getProductsById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('Products')
            .select(`
                *,
                brands (*),
                Categories (*),
                Product_Images (*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        } 
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export const CreateProducts = async (req, res) => {
    try {
        const { 
            name, model, reference_number, price, 
            condition, year, movement, case_size, 
            case_material, warranty, brand_id, category_id, is_active 
        } = req.body;

       
       const { data: productData, error: productError } = await supabase
                .from('Products')
                .insert({ 
                    name, 
                    model, 
                    reference_number, 
                    price: Number(price), 
                    condition, 
                    year: Number(year),  
                    movement, 
                    case_size, 
                    case_material, 
                    warranty, 
                    brand_id: Number(brand_id), 
                    category_id: Number(category_id), // แปลงเป็น Number
                    is_active: is_active === 'true' || is_active === true // แปลงเป็น Boolean
                })
                .select()
                .single();

        if (productError) {
            return res.status(400).json({ error: productError.message });
        }

        const productId = productData.id;

        // 2. ตรวจสอบว่ามีไฟล์รูปภาพถูกส่งมาด้วยไหม (ผ่าน Multer)
        if (req.files && req.files.length > 0) {
            const imageUploadPromises = req.files.map(async (file, index) => {
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${productId}-${Date.now()}-${index}.${fileExt}`;
                const filePath = `${fileName}`;

                // อัปโหลดไฟล์ไปที่ Supabase Storage 
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });

                if (uploadError) {
                    throw new Error(uploadError.message);
                }

                // ดึง Public URL ของรูปภาพ
                const { data: publicURLData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                const imageUrl = publicURLData.publicUrl;

                // บันทึก URL ลงตาราง Product_Images
                const { error: imageDbError } = await supabase
                    .from('Product_Images')
                    .insert({
                        product_id: productId,
                        image_url: imageUrl,
                        sort_order: index // ลำดับรูปภาพ
                    });

                if (imageDbError) {
                    throw new Error(imageDbError.message);
                }
            });

            // รอให้อัปโหลดครบทุกรูป
            await Promise.all(imageUploadPromises);
        }

        return res.status(200).json({ 
            message: "Product created successfully", 
            product: productData 
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

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
                    warranty : updateData.warranty,brand_id: updateData.brand_id,       
                    category_id: updateData.category_id, 
                    is_active: updateData.is_active      

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