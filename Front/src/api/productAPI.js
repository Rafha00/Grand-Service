import axiosClient from './axiosClient.js';

export class ProductData {
    constructor(
        name, model, reference_number, price, 
        condition, year, movement, case_size, 
        case_material, warranty, brand_id, category_id, is_active, images
    ) {
        this.name = name;
        this.model = model;
        this.reference_number = reference_number;
        this.price = price;
        this.condition = condition;
        this.year = year;
        this.movement = movement;
        this.case_size = case_size;
        this.case_material = case_material;
        this.warranty = warranty;
        this.brand_id = brand_id;
        this.category_id = category_id;
        this.is_active = is_active;
        this.images = images;
    }
}

export const getProducts = async () => {
    const response = await axiosClient.get('/products');
    return response.data;
};

export const getProductsById = async (id) => {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data;
};

// ฟังก์ชัน helper สำหรับสร้าง FormData (ลดการเขียนโค้ดซ้ำระหว่าง Create และ Update)
const buildProductFormData = (productData) => {
    const formData = new FormData();

    formData.append("name", productData.name);
    formData.append("model", productData.model);
    formData.append("reference_number", productData.reference_number);
    formData.append("price", productData.price);
    formData.append("condition", productData.condition);
    formData.append("year", productData.year);
    formData.append("movement", productData.movement);
    formData.append("case_size", productData.case_size);
    formData.append("case_material", productData.case_material);
    formData.append("warranty", productData.warranty);
    formData.append("brand_id", productData.brand_id);
    formData.append("category_id", productData.category_id);
    formData.append("is_active", productData.is_active); 

    if (productData.images && Array.isArray(productData.images)) {
        productData.images.forEach((image) => {
            formData.append("imagesFiles", image);
        });
    }

    return formData;
};

export const CreateProducts = async (productData) => {
    const formData = buildProductFormData(productData);
    const response = await axiosClient.post('/products', formData , {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const UpdateProducts = async (id, productData) => {
    const formData = buildProductFormData(productData);
    const response = await axiosClient.put(`/products/${id}`, formData); 
    return response.data;
};

export const DeleteProducts = async (id) => {
    const response = await axiosClient.delete(`/products/${id}`);
    return response.data;
};