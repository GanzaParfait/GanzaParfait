"use client";

const categories = ["All", "AI", "Software Engineering", "Entrepreneurship", "Leadership"];

export default function BlogFilter() {
  return (
    <div className="flex flex-wrap gap-2 mt-8" role="group" aria-label="Filter posts by category">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`btn btn-sm ${cat === "All" ? "btn-primary" : "btn-outline"}`}
          aria-pressed={cat === "All"}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
