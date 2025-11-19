import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "../api/documents";
import { useState, useMemo } from "react";
import TagSelect from "../components/TagSelect";

interface DocumentItem {
  id: number;
  name: string;
  tag: string | null;
  file_path: string;
}

function Documents() {
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);

  // Query with multiple tags
  const { data, isLoading, isError } = useQuery<DocumentItem[]>({
    queryKey: ["documents", tags],
    queryFn: async () => {
      const res = await documentsApi.list(tags);
      return res.data.data;
    },
  });

  // all tags for the dropdown
  const { data: allTagsData } = useQuery<string[]>({
    queryKey: ["document-tags"],
    queryFn: async () => {
      const res = await documentsApi.listTags();
      return res.data as string[];
    },
  });

  const allTags = allTagsData ?? [];
  const availableTagOptions = allTags.filter(t => !tags.includes(t));

  const addTagFilter = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
  };

  const removeTagFilter = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const clearFilters = () => setTags([]);

  const handleDownload = async (id: number, filename: string) => {
    const res = await documentsApi.download(id);
    const blob = new Blob([res.data], {
      type: res.headers["content-type"]
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: number) => {
    await documentsApi.remove(id);
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Documents</h1>
          <Link
            to="/documents/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Document
          </Link>
        </div>

        {/* Filter row */}
        <div className="space-y-3 max-w-xl">

          {/* Dropdown filter */}
          <TagSelect
            value=""
            onChange={addTagFilter}
            options={availableTagOptions}
            placeholder="Select tag"
          />

          {/* Selected tag chips */}
          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
              <button
                key={tag}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-300 hover:bg-blue-200"
                onClick={() => removeTagFilter(tag)}
              >
                {tag} ✕
              </button>
            ))}

            {tags.length > 0 && (
              <button
                onClick={clearFilters}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-400"
              >
                Reset all
              </button>
            )}
          </div>
        </div>

        {/* Table state */}
        {isLoading && <p>Loading...</p>}
        {isError && <p className="text-red-600">Failed to load documents.</p>}

        {/* Table */}
        {data && data.length > 0 ? (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border text-left">Name</th>
                <th className="p-2 border text-left">Tag</th>
                <th className="p-2 border text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((doc) => (
                <tr key={doc.id}>
                  <td className="p-2 border">{doc.name}</td>
                  <td className="p-2 border">{doc.tag || "-"}</td>
                  <td className="p-2 border flex gap-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      onClick={() => handleDownload(doc.id, doc.name)}
                    >
                      Download
                    </button>

                    <Link
                      to={`/documents/${doc.id}/edit`}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </Link>

                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => handleDelete(doc.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        ) : (
          !isLoading && (
            <p className="text-gray-600">No documents found.</p>
          )
        )}
      </div>
    </Layout>
  );
}

export default Documents;
