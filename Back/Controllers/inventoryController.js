import { inventoryDb as supabase } from '../Config/db.js';
import { callService } from '../Services/internal.js';

const AVAILABLE_STATUSES = ['available', 'in_stock'];

export const getInventory = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Inventory')
            .select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const products = await callService('catalog', '/api/products').catch(() => []);
        const byId = Object.fromEntries((products || []).map((p) => [p.id, p]));

        return res.status(200).json(
            (data || []).map((item) => ({
                ...item,
                Products: byId[item.product_id] || null
            }))
        );
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// ใหม่: คืนจำนวนสต็อกที่พร้อมขายต่อ product_id เช่น { "uuid-1": 3, "uuid-2": 1 }
export const getAvailableStockMap = async (req, res) => {
    try {
        const PAGE_SIZE = 1000;
        const stockMap = {};
        let from = 0;

        // ดึงทีละ 1000 แถวจนครบ (กันโดนตัดที่ลิมิตของ Supabase)
        while (true) {
            const { data, error } = await supabase
                .from('Inventory')
                .select('product_id')
                .in('status', AVAILABLE_STATUSES)
                .order('id', { ascending: true })
                .range(from, from + PAGE_SIZE - 1);

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            for (const row of data || []) {
                if (!row.product_id) continue;
                stockMap[row.product_id] = (stockMap[row.product_id] || 0) + 1;
            }

            if (!data || data.length < PAGE_SIZE) break;
            from += PAGE_SIZE;
        }

        return res.status(200).json(stockMap);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const createInventory = async (req, res) => {
    try {
        const rawItems = Array.isArray(req.body) ? req.body : [req.body];

        if (rawItems.length === 0) {
            return res.status(400).json({ error: 'Inventory data is required' });
        }

        const rowsToInsert = [];
        for (const item of rawItems) {
            if (!item || !item.product_id) {
                return res.status(400).json({ error: 'product_id is required for every item' });
            }

            rowsToInsert.push({
                product_id: item.product_id,
                sku: item.sku ?? null,
                serial_number: item.serial_number ?? null,
                status: item.status || 'available',
                location: item.location ?? null
            });
        }

        const { data, error } = await supabase
            .from('Inventory')
            .insert(rowsToInsert)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const created = Array.isArray(req.body) ? data : data[0];
        return res.status(201).json({
            message: 'Inventory created successfully',
            count: data.length,
            data: created
        });
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

        return res.status(200).json(data || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getStockSummaryByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const { data, error } = await supabase
            .from('Inventory')
            .select('id, status, location')
            .eq('product_id', productId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const items = data || [];
        const availableCount = items.filter((item) =>
            AVAILABLE_STATUSES.includes((item.status || '').trim().toLowerCase())
        ).length;

        return res.status(200).json({
            product_id: productId,
            total_items: items.length,
            available_stock: availableCount
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, serial_number, status, location } = req.body;

        const updatePayload = {};
        if (sku !== undefined) updatePayload.sku = sku;
        if (serial_number !== undefined) updatePayload.serial_number = serial_number;
        if (status !== undefined) updatePayload.status = status;
        if (location !== undefined) updatePayload.location = location;

        if (Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ error: 'No valid fields provided to update' });
        }

        const { data, error } = await supabase
            .from('Inventory')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({
            message: 'Inventory updated successfully',
            data
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};