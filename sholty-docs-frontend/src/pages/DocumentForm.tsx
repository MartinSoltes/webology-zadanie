import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { documentsApi } from "../api/documents";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TagInput from "../components/TagInput";

function DocumentForm() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEdit = Boolean(id);

  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Fetch document when editing
  const { data: documentData, isLoading: loadingDoc } = useQuery({
    queryKey: ["document", id],
    queryFn: () => documentsApi.get(Number(id)).then((res) => res.data),
    enabled: isEdit,
  });

  // Fetch all available tags for autocomplete
  const { data: allTagsData } = useQuery({
    queryKey: ["document-tags"],
    queryFn: () => documentsApi.listTags().then((res) => res.data),
  });

  // Fill initial values for edit
  useEffect(() => {
    if (documentData) {
      setName(documentData.name);
      setTags(documentData.tags ?? []);
    }
  }, [documentData]);

  // CREATE mutation
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => documentsApi.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      navigate("/documents");
    },
  });

  // UPDATE mutation
  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; name: string; tags: string[] }) =>
      documentsApi.update(payload.id, { name: payload.name, tags: payload.tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      navigate("/documents");
    },
  });

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      updateMutation.mutate({
        id: Number(id),
        name,
        tags,
      });
    } else {
      const form = new FormData();
      form.append("name", name);
      form.append("file", file!);
      tags.forEach((t, i) => form.append(`tags[${i}]`, t));

      createMutation.mutate(form);
    }
  };

  if (loadingDoc)
    return (
      <Layout>
        <p>Loading…</p>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-md mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">
          {isEdit ? "Edit Document" : "Upload Document"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            placeholder="Document name"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Tags */}
          <TagInput 
            value={tags}
            onChange={setTags}
            allTags={allTagsData ?? []}
          />

          {/* File input only when creating */}
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

          {(createMutation.error || updateMutation.error) && (
            <p className="text-red-600">Something went wrong.</p>
          )}
        </form>
      </div>
    </Layout>
  );
}

export default DocumentForm;