import { supabase } from "../Config/supabaseClient.js";

// ฟังก์ชันดึงสินค้าทั้งหมด (ปรับปรุงให้ตรงกับที่ Frontend ต้องการ)
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

        // จัด Format ให้ตรงกับหน้า BookingPage.jsx
        const formattedData = data.map(product => ({
            id: product.id,
            name: product.name,
            desc: product.model ? `รุ่น ${product.model}` : (product.brands?.name || 'ไม่มีรายละเอียด'),
            price: product.price || 0,
            img: product.Product_Images && product.Product_Images.length > 0 
                 ? product.Product_Images[0].image_url 
                 : 'https://via.placeholder.com/80',
            stock: 1
        }));

        return res.status(200).json({ success: true, data: formattedData });
        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// ฟังก์ชันดึงสินค้าตาม ID (โค้ดเดิมของคุณ)
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

// ฟังก์ชันสร้างสินค้า (โค้ดเดิมของคุณ)
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
                    category_id: Number(category_id),
                    is_active: is_active === 'true' || is_active === true
                })
                .select()
                .single();

        if (productError) {
            return res.status(400).json({ error: productError.message });
        }

        const productId = productData.id;

        if (req.files && req.files.length > 0) {
            const imageUploadPromises = req.files.map(async (file, index) => {
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${productId}-${Date.now()}-${index}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });

                if (uploadError) {
                    throw new Error(uploadError.message);
                }

                const { data: publicURLData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                const imageUrl = publicURLData.publicUrl;

                const { error: imageDbError } = await supabase
                    .from('Product_Images')
                    .insert({
                        product_id: productId,
                        image_url: imageUrl,
                        sort_order: index
                    });

                if (imageDbError) {
                    throw new Error(imageDbError.message);
                }
            });

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

// ฟังก์ชันอัปเดตสินค้า (โค้ดเดิมของคุณ)
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
                    warranty : updateData.warranty,
                    brand_id: updateData.brand_id,       
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

// ฟังก์ชันลบสินค้า (โค้ดเดิมของคุณ)
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