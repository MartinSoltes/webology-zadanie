import { useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

function TagSelect({ value, onChange, options, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-full">
      <div
        className="border p-2 rounded cursor-pointer bg-white flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <span className="text-gray-800">
          {value || placeholder || "Select tag"}
        </span>
        <span className="text-gray-500">▾</span>
      </div>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-gray-950 border rounded shadow-lg">
          <input
            type="text"
            className="p-2 border-b w-full focus:outline-none"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="max-h-40 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <button
                  key={opt}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => handleSelect(opt)}
                >
                  {opt}
                </button>
              ))
            ) : (
              <p className="text-gray-500 p-2 text-sm">No results</p>
            )}

            <button
              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => handleSelect("")}
            >
              Show all documents
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TagSelect;
