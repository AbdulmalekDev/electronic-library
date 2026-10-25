import api from './api';

const API_URL = process.env.API_URL ||  '/dynamic-lists/';

// Get all dynamic lists
const getLists = async () => {
    const response = await api.get(API_URL);
    return response.data;
};

// Get single dynamic list by name
const getListByName = async (name) => {
    const response = await api.get(API_URL + name);
    return response.data;
};

// Create a new list
const createList = async (listData) => {
    const response = await api.post(API_URL, listData);
    return response.data;
};

// Update a list
const updateList = async (id, listData) => {
    const response = await api.put(API_URL + 'id/' + id, listData);
    return response.data;
};

// Delete a list
const deleteList = async (id) => {
    const response = await api.delete(API_URL + 'id/' + id);
    return response.data;
};

const dynamicListService = {
    getLists,
    getListByName,
    createList,
    updateList,
    deleteList
};

export default dynamicListService;
