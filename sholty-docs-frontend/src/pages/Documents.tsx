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
  const [tag, setTag] = useState("");

  // Load documents using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["documents", tag],
    queryFn: async () => {
      const res = await documentsApi.list(tag || undefined);
      return res.data.data as DocumentItem[];
    },
  });

  // Load tags
  const tags = useMemo(() => {
    return Array.from(
      new Set((data ?? []).map(d => d.tag).filter(Boolean))
    ) as string[];
  }, [data]);

  const handleDownload = async (id: number, filename: string) => {
    const res = await documentsApi.download(id);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
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

        {/* Filter */}
        <div className="flex items-center gap-4 max-w-md">
          <TagSelect
            value={tag}
            onChange={(val) => setTag(val)}
            options={tags}
            placeholder="Filter by tag"
          />

          {tag && (
            <button
              onClick={() => setTag("")}
              className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Reset
            </button>
          )}
        </div>

        {/* State handlers */}
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
            <p className="text-gray-600">No documents available yet.</p>
          )
        )}
      </div>
    </Layout>
  );
}

export default Documents;