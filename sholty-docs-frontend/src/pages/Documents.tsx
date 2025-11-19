import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "../api/documents";
import { useState, useEffect, useMemo } from "react";
import TagSelect from "../components/TagSelect";

interface DocumentItem {
  id: number;
  name: string;
  tags: string[];
  file_path: string;
}

interface DocumentsResponse {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: DocumentItem[];
}

function Documents() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTags = searchParams.get("tags")
  ? searchParams.get("tags")!.split(",")
  : [];

const initialPage = Number(searchParams.get("page")) || 1;

const [tags, setTags] = useState<string[]>(initialTags);
const [page, setPage] = useState(initialPage);

  // ---- LOAD DOCUMENTS WITH FILTERS ----
  const { data, isLoading, isError } = useQuery<DocumentsResponse>({
    queryKey: ["documents", tags, page],
    queryFn: async () => {
      const res = await documentsApi.list(tags, page);
      return res.data; // vraciame cely objekt
    },
  });

  const documents = data?.data ?? [];
  const meta = data
  ? {
      current_page: data.current_page,
      last_page: data.last_page,
      per_page: data.per_page,
      total: data.total,
    }
  : null;

  // ---- LOAD ALL TAGS FOR DROPDOWN ----
  const { data: rawTagsData } = useQuery<string[]>({
    queryKey: ["document-tags"],
    queryFn: async () => {
      const res = await documentsApi.listTags();
      return res.data;
    },
  });

  // Normalize all tags (remove null, empty, duplicates)
  const allTags = useMemo(
    () =>
      (rawTagsData ?? [])
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    [rawTagsData]
  );

  const availableTagOptions = allTags.filter((t) => !tags.includes(t));

  // ---- FILTER HANDLERS ----
  const addTagFilter = (tag: string) => {
  if (tag && !tags.includes(tag)) {
      setPage(1); // novy filter -> vratime sa na stranu 1
      setTags(prev => [...prev, tag]);
    }
  };

  const removeTagFilter = (tag: string) => {
    setPage(1);
    setTags(prev => prev.filter(t => t !== tag));
  };

  const clearFilters = () => {
    setTags([]);
    setPage(1);
  };

  useEffect(() => {
    const params: any = {};

    if (tags.length > 0) {
      params.tags = tags.join(",");
    }

    if (page > 1) {
      params.page = page.toString();
    }

    setSearchParams(params);
  }, [tags, page]);


  // ---- DOWNLOAD ----
  const handleDownload = async (id: number, filename: string) => {
    const res = await documentsApi.download(id);
    const blob = new Blob([res.data], {
      type: res.headers["content-type"],
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ---- DELETE ----
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

        {/* FILTER BAR */}
        <div className="space-y-3 max-w-xl">
          
          {/* Tag dropdown */}
          <TagSelect
            value=""
            onChange={addTagFilter}
            options={availableTagOptions}
            placeholder="Select tag"
          />

          {/* Active selected tags */}
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
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

        {/* DATA STATES */}
        {isLoading && <p>Loading...</p>}
        {isError && <p className="text-red-600">Failed to load documents.</p>}

        {/* TABLE */}
        {documents && documents.length > 0 ? (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border text-left">Name</th>
                <th className="p-2 border text-left">Tags</th>
                <th className="p-2 border text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="p-2 border">{doc.name}</td>
                  
                  {/* Show multiple tags */}
                  <td className="p-2 border">
                    {doc.tags && doc.tags.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {doc.tags.map((t) => (
                          <span
                            key={t}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-2 border flex flex-wrap gap-2">
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
          !isLoading && <p className="text-gray-600">No documents found.</p>
        )}

        {/* PAGINATION */}
        {meta && (
          <div className="flex items-center gap-4 mt-4">
            <button
              disabled={meta.current_page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 text-gray-700 cursor-pointer"
            >
              Prev
            </button>

            <span>
              Page {meta.current_page} / {meta.last_page}
            </span>

            <button
              disabled={meta.current_page === meta.last_page}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 text-gray-700 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Documents;