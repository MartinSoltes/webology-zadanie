import { useState, useRef } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  allTags: string[];
}

export default function TagInput({ value, onChange, allTags }: TagInputProps) {
  const [input, setInput] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = (allTags ?? [])
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .filter((t) => t.toLowerCase().includes(input.toLowerCase()))
    .filter((t) => !value.includes(t));

  // Pridanie tagu
  const addTag = (tag: string) => {
    const cleaned = tag.trim();
    if (!cleaned) return;
    if (value.includes(cleaned)) return;
    onChange([...value, cleaned]);
    setInput("");
    setFocusedIndex(0);
  };

  // Odstránenie tagu
  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter, Tab, čiarka → potvrdiť tag
    if (["Enter", "Tab", ","].includes(e.key)) {
      e.preventDefault();

      if (input.trim()) {
        // ak je niečo napísané, berieme priamo input
        addTag(input);
      }
    }

    // navigácia v suggestionoch
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    }

    // spätné mazanie posledného tagu, keď je input prázdny
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (input.trim().length > 0) {
      addTag(input);
    }
  };

  return (
    <div className="space-y-2 relative">
      {/* Vybraté tagy */}
      <div className="flex gap-2 flex-wrap">
        {value.map((tag) => (
          <div
            key={tag}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2 border border-blue-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-700 hover:text-blue-900"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        className="border p-2 w-full rounded"
        placeholder="Write tag..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />

      {/* Suggestion dropdown */}
      {input.length > 0 && suggestions.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-10 mt-1 bg-white border rounded shadow w-full text-gray-900 max-h-40 overflow-y-auto"
        >
          {suggestions.map((tag, index) => (
            <div
              key={tag}
              className={`px-3 py-2 cursor-pointer ${
                index === focusedIndex ? "bg-blue-100" : ""
              }`}
              // onMouseDown namiesto onClick, aby sme zastavili blur
              onMouseDown={(e) => {
                e.preventDefault(); // zabráni blur inputu
                addTag(tag);
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
