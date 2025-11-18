import api from "./axios";

export const documentsApi = {
    list: (tag?: string) =>
        api.get("/documents", { params: tag ? { tag } : {} }),

    upload: (data: FormData) =>
        api.post("/documents", data, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    get: (id: number) => 
        api.get(`/documents/${id}`),

    update: (id: number, payload: { name?: string; tag?: string }) =>
        api.put(`/documents/${id}`, payload),

    remove: (id: number) =>
        api.delete(`/documents/${id}`),

    download: (id: number) =>
        api.get(`/documents/${id}/download`, { responseType: "blob" }),
};
