"use client";

import { useEffect, useState } from "react";
import { DictionaryTable } from "@/components/dictionary/dictionary-table";
import { motion } from "framer-motion";
import { ShimmerTable } from "@/components/ui/shimmer";

type DictionaryItem = {
  id: string;
  term: string;
  preferredSpelling: string;
};

export default function DictionaryPage() {
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDictionary();
  }, []);

  const fetchDictionary = async () => {
    try {
      const response = await fetch("/api/dictionary");
      const data = (await response.json()) as
        | { ok: true; value: DictionaryItem[] }
        | { ok: false };

      if (data.ok) {
        setItems(data.value);
      }
    } catch (error) {
      console.error("Failed to fetch dictionary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (term: string, preferredSpelling: string) => {
    const response = await fetch("/api/dictionary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term, preferredSpelling }),
    });

    const data = (await response.json()) as
      | { ok: true; value: DictionaryItem }
      | { ok: false; error: { message: string } };

    if (data.ok) {
      setItems((prev) => [data.value, ...prev]);
    } else {
      throw new Error(data.error.message);
    }
  };

  const handleUpdate = async (
    id: string,
    term: string,
    preferredSpelling: string
  ) => {
    const response = await fetch(`/api/dictionary/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term, preferredSpelling }),
    });

    const data = (await response.json()) as
      | { ok: true; value: DictionaryItem }
      | { ok: false; error: { message: string } };

    if (data.ok) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? data.value : item))
      );
    } else {
      throw new Error(data.error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/dictionary/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      throw new Error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-[hsl(var(--text))] to-[hsl(var(--text-muted))] bg-clip-text text-transparent">
          Dictionary
        </h1>
        <p className="text-[hsl(var(--text-muted))] text-sm sm:text-base max-w-2xl">
          Manage custom terms and their preferred spellings for better transcription accuracy
        </p>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <ShimmerTable rows={5} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
        <DictionaryTable
          items={items}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
        </motion.div>
      )}
    </div>
  );
}

