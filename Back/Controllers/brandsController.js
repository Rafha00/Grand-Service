import { supabase } from '../Config/supabaseClient.js';

export const getBrands = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('brands')
            .select('*');

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const CreateBrands = async (req, res) => {
    try {
        const { name, description } = req.body;
        let logo_url = null;

        // 1. ตรวจสอบและอัปโหลดรูปภาพลง Supabase Storage
        if (req.file) {
            const file = req.file;
            const fileExt = file.originalname.split('.').pop();
            const fileName = `brand-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('brand-images') // ชื่อ Bucket ใน Supabase Storage
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                return res.status(400).json({ success: false, message: uploadError.message });
            }

            // ดึง Public URL
            const { data: publicURLData } = supabase.storage
                .from('brand-images')
                .getPublicUrl(fileName);

            logo_url = publicURLData.publicUrl;
        }

        // 2. บันทึกลง Database
        const { data, error } = await supabase
            .from('brands')
            .insert([{ name, description, logo_url }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        } 
        
        return res.status(201).json({ success: true, data }); 
        
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const UpdateBrands = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        let updateFields = { name, description };

        // ถ้ามีการอัปโหลดรูปภาพใหม่
        if (req.file) {
            const file = req.file;
            const fileExt = file.originalname.split('.').pop();
            const fileName = `brand-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('brand-images')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                return res.status(400).json({ success: false, message: uploadError.message });
            }

            const { data: publicURLData } = supabase.storage
                .from('brand-images')
                .getPublicUrl(fileName);

            updateFields.logo_url = publicURLData.publicUrl;
        }

        const { data, error } = await supabase
            .from('brands')
            .update(updateFields)
            .eq('id', id) 
            .select()
            .single(); 

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }   
        
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const DeleteBrands = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id)
            .select();
                
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        } 
        
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};