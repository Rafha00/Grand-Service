import axiosClient from "./axiosClient";

export class BrandsData {
    constructor(name, description, logoFile) {
        this.name = name;
        this.description = description;
        this.logoFile = logoFile;
    }
}

export const getBrands = async () => {
    const response = await axiosClient.get('/brands');
    return response.data;
};

export const CreateBrands = async (brandsData) => {
    const formData = new FormData();

    formData.append("name", brandsData.name);
    formData.append("description", brandsData.description);
    
    if (brandsData.logoFile) {
        // ชื่อ "logo_url" ตรงนี้คือ Key ที่ Multer ฝั่ง Backend รอรับ
        formData.append("logo_url", brandsData.logoFile); 
    }

    const response = await axiosClient.post('/brands', formData);
    return response.data;
};

export const UpdateBrands = async (id, brandsData) => {
    // ใช้ FormData รองรับกรณีผู้ใช้เปลี่ยนรูปใหม่
    const formData = new FormData();
    
    formData.append("name", brandsData.name);
    formData.append("description", brandsData.description);
    
    if (brandsData.logoFile) {
        formData.append("logo_url", brandsData.logoFile);
    }

    const response = await axiosClient.put(`/brands/${id}`, formData);
    return response.data;
};

export const DeleteBrands = async (id) => {
    const response = await axiosClient.delete(`/brands/${id}`);
    return response.data;
};