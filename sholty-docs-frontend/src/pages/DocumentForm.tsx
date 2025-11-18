import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { documentsApi } from "../api/documents";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function DocumentForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // if exists → edit mode
  const isEdit = Boolean(id);

  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [file, setFile] = useState<File | null>(null); // only for create

  // ---- LOAD DOC WHEN EDITING ----
  const { data: documentData, isLoading: loadingDoc } = useQuery({
    queryKey: ["document", id],
    queryFn: () => documentsApi.get(Number(id)),
    enabled: isEdit, // do not run on "new"
  });

  useEffect(() => {
    if (documentData?.data) {
      setName(documentData.data.name);
      setTag(documentData.data.tag ?? "");
    }
  }, [documentData]);

  // ---- CREATE ----
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => documentsApi.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      navigate("/documents");
    },
  });

  // ---- UPDATE ----
  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; name: string; tag: string }) =>
      documentsApi.update(payload.id, { name: payload.name, tag: payload.tag }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      navigate("/documents");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && id) {
      updateMutation.mutate({ id: Number(id), name, tag });
      return;
    }

    if (!file) return;

    const form = new FormData();
    form.append("name", name);
    if (tag) form.append("tag", tag);
    form.append("file", file);

    createMutation.mutate(form);
  };

  if (loadingDoc) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <div className="max-w-md mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">
          {isEdit ? "Edit Document" : "Upload Document"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Document name"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Tag (optional)"
            className="border p-2 w-full"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />

          {!isEdit && (
            <input
              type="file"
              className="w-full"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? "Save" : "Upload"}
            </button>

            <button
              type="button"
              className="border px-4 py-2 rounded"
              onClick={() => navigate("/documents")}
            >
              Cancel
            </button>
          </div>
        </form>

        {(createMutation.error || updateMutation.error) && (
          <p className="text-red-600">Something went wrong.</p>
        )}
      </div>
    </Layout>
  );
}

export default DocumentForm;
