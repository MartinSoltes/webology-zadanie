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
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0) // vyhodí null/undefined/empty
    .filter((t) =>
        t.toLowerCase().includes(input.toLowerCase())
    )
    .filter((t) => !value.includes(t));

  // Add tag
  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
    setInput("");
    setFocusedIndex(0);
  };

  // Remove tag
  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Confirm: enter, tab, comma
    if (["Enter", "Tab", ","].includes(e.key)) {
      e.preventDefault();

      if (suggestions.length > 0 && input.trim()) {
        addTag(suggestions[0]);
      } else {
        addTag(input);
      }
    }

    // Navigation in suggestions
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="space-y-2 relative">
      {/* Selected tags */}
      <div className="flex gap-2 flex-wrap">
        {value.map((tag) => (
          <div
            key={tag}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2 border border-blue-300"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-blue-700 hover:text-blue-900"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Tag input */}
      <input
        className="border p-2 w-full rounded"
        placeholder="Write tag..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Suggestion dropdown */}
      {input.length > 0 && suggestions.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-10 mt-1 bg-white border rounded shadow w-full"
        >
          {suggestions.map((tag, index) => (
            <div
              key={tag}
              className={`px-3 py-2 cursor-pointer ${
                index === focusedIndex ? "bg-blue-100" : ""
              }`}
              onClick={() => addTag(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
