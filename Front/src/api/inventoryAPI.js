import axiosClient from "./axiosClient";

export class InventoryData {
    constructor(product_id, sku, serial_number, status, location) {
            this.product_id = product_id;
            this.sku = sku;
            this.serial_number = serial_number;
            this.status  = status;
            this.location = location;
    }
}

 export const getInventory = async () => {
    const response = await axiosClient.get('Inventory')
    
    return response.data;
 }

 export const getInventoryById = async (id) => {
    const response = await axiosClient.get(`/Inventory/${id}`)
    
    return response.data;
    
 }

 export const CreateInventory = async (InventoryData) => {

    const  formData = new FormData()

    formData.append("product_id",InventoryData,product_id);
    formData.append("sku" , InventoryData.sku);
    formData.append("serial_number" , InventoryData.serial_number);
    formData.append("status" , InventoryData.status);
    formData.append("location" , InventoryData.location)


    const response = await axiosClient.post(`/Inventory/${id}` ,formData , {
        headers: {
            "Content-Type" : "form-data"
        }
    })

    return response.data;
    
 }

 export const UpdateInventory = async (id , InventoryData) => {
    const response = await axiosClient.put(`/Inventory/${id}` , InventoryData)

    return response.data;
 }