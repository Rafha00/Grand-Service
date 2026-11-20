import axiosClient from "./axiosClient";

export class InventoryData {
    constructor(product_id, sku, serial_number, status = "available", location = null) {
        this.product_id = product_id;
        this.sku = sku;
        this.serial_number = serial_number;
        this.status = status;
        this.location = location;
    }
}

// ดึงรายการ Inventory ทั้งหมด
export const getInventory = async () => {
    const response = await axiosClient.get("/Inventory");
    return response.data;
};

// ดึง Inventory รายการเดียวตาม id
export const getInventoryById = async (id) => {
    const response = await axiosClient.get(`/Inventory/${id}`);
    return response.data;
};

// ดึงรายการ Inventory ตาม productId
export const getInventoryByProductId = async (productId) => {
    const response = await axiosClient.get(`/Inventory/product/${productId}`);
    return response.data;
};

// ดึงสรุปจำนวนสต็อกที่พร้อมใช้งานตาม productId
export const getStockSummaryByProductId = async (productId) => {
    const response = await axiosClient.get(`/Inventory/product/${productId}/summary`);
    return response.data;
};

// เพิ่มสต็อก (รองรับทั้ง 1 ชิ้น [object] และหลายชิ้น [array])
export const CreateInventory = async (payload) => {
    const body = Array.isArray(payload)
        ? payload.map((item) => ({
              product_id: item.product_id,
              sku: item.sku ?? null,
              serial_number: item.serial_number ?? null,
              status: item.status || "available",
              location: item.location ?? null,
          }))
        : {
              product_id: payload.product_id,
              sku: payload.sku ?? null,
              serial_number: payload.serial_number ?? null,
              status: payload.status || "available",
              location: payload.location ?? null,
          };

    const response = await axiosClient.post("/Inventory", body);
    return response.data;
};

// อัปเดตข้อมูล Inventory รายชิ้น
export const UpdateInventory = async (id, payload) => {
    const response = await axiosClient.patch(`/Inventory/${id}`, payload);
    return response.data;
};