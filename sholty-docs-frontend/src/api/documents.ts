import api from "./axios";

export const documentsApi = {
    list: (tags?: string[]) =>
    api.get("/documents", {
        params: tags && tags.length > 0 ? { tags: tags.join(",") } : {}
    }),
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
    listTags: () => api.get("/documents-tags"),
};
