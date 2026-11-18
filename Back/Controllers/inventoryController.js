import { inventoryDb as supabase } from '../Config/db.js';
import { callService } from '../Services/internal.js';


export const getInventory = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Inventory')
            .select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // ข้อมูลสินค้าอยู่ที่ Catalog Service: ขอผ่าน API แล้วแนบให้แต่ละเรือน (แทนการ join ข้าม database)
        const products = await callService('catalog', '/api/products').catch(() => []);
        const byId = Object.fromEntries((products || []).map((p) => [p.id, p]));
        return res.status(200).json(data.map((item) => ({ ...item, Products: byId[item.product_id] || null })));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


export const createInventory = async (req, res) => {
    try {
        const { product_id, sku, serial_number, status, location } = req.body;

        const { data, error } = await supabase
            .from('Inventory')
            .insert([{ product_id, sku, serial_number, status, location }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(201).json({ message: "Inventory created successfully", data });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


export const getInventoryByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const { data, error } = await supabase
            .from('Inventory')
            .select('*')
            .eq('product_id', productId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params; 
        const { sku, serial_number, status, location } = req.body;

        const { data, error } = await supabase
            .from('Inventory')
            .update({
                sku,
                serial_number,
                status,
                location
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ message: "Inventory updated successfully", data });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};