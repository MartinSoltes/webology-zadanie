import api from "./axios";

export const documentsApi = {
  // GET /documents?tags=tag1,tag2
  list: (tags?: string[]) =>
    api.get("/documents", {
      params: tags && tags.length > 0 ? { tags: tags.join(",") } : {},
    }),

  // POST /documents  (multipart)
  upload: (data: FormData) =>
    api.post("/documents", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // GET /documents/:id
  get: (id: number) =>
    api.get(`/documents/${id}`),

  // PUT /documents/:id
  update: (id: number, payload: { name?: string; tags?: string[] }) =>
    api.put(`/documents/${id}`, payload),

  // DELETE /documents/:id
  remove: (id: number) =>
    api.delete(`/documents/${id}`),

  // GET /documents/:id/download
  download: (id: number) =>
    api.get(`/documents/${id}/download`, {
      responseType: "blob",
    }),

  // GET /documents-tags
  listTags: () =>
    api.get("/documents-tags"),
};
