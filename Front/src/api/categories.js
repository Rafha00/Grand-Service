import axiosClient from "./axiosClient";

export class CategoriesData {
    constructor (name , description ) {
        this.name = name;
        this.description = description;

    }

}

export const getCategories = async () => {
    const response = await axiosClient.get('/categories')

    return response.data;
}

export const getCategoriesById = async (id) => {
    const response = await axiosClient.get(`/categories/${id}`)

    return response.data;
}

export const CreateCategories = async (CategoriesData) => {
    
     const formData = new FormData();

     formData.append("name", CategoriesData.name);
     formData.append("description" , CategoriesData.description);
    
    const response = await axiosClient.post('/categories', formData , {
            headers: {
                "Content-Type":"form-data"
            }
    }  );
    return response.data; 
}

export const UpdataCategories = async (id ,CategoriesData) => {
    const response = await axiosClient.put(`/categories/${id}`, CategoriesData)

    return response.data;
}

export const DeleteCategories = async (id) => {
    const response = await axiosClient.delete(`/categories/${id}`)
    return response.data;
}

