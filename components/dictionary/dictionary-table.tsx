"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Check, X, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type DictionaryItem = {
  id: string;
  term: string;
  preferredSpelling: string;
};

type DictionaryTableProps = {
  items: DictionaryItem[];
  onAdd: (term: string, preferredSpelling: string) => Promise<void>;
  onUpdate: (id: string, term: string, preferredSpelling: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function DictionaryTable({
  items,
  onAdd,
  onUpdate,
  onDelete,
}: DictionaryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editSpelling, setEditSpelling] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const [newSpelling, setNewSpelling] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleStartEdit = (item: DictionaryItem) => {
    setEditingId(item.id);
    setEditTerm(item.term);
    setEditSpelling(item.preferredSpelling);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTerm("");
    setEditSpelling("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editTerm || !editSpelling) return;

    try {
      await onUpdate(editingId, editTerm, editSpelling);
      setEditingId(null);
      setEditTerm("");
      setEditSpelling("");
      toast({
        title: "Updated",
        description: "Dictionary item updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update dictionary item",
        variant: "destructive",
      });
    }
  };

  const handleAdd = async () => {
    if (!newTerm || !newSpelling) return;

    setIsAdding(true);
    try {
      await onAdd(newTerm, newSpelling);
      setNewTerm("");
      setNewSpelling("");
      toast({
        title: "Added",
        description: "Dictionary item added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add dictionary item",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      toast({
        title: "Deleted",
        description: "Dictionary item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete dictionary item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Item Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--surface))] to-[hsl(var(--mist))] p-6 shadow-md"
      >
        <h3 className="text-sm font-semibold text-[hsl(var(--text))] mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Term
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Term (e.g., AI)"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isAdding && handleAdd()}
            className="flex-1 rounded-[var(--radius-md)] bg-[hsl(var(--surface))]"
          />
          <Input
            placeholder="Preferred spelling (e.g., Artificial Intelligence)"
            value={newSpelling}
            onChange={(e) => setNewSpelling(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isAdding && handleAdd()}
            className="flex-1 rounded-[var(--radius-md)] bg-[hsl(var(--surface))]"
          />
          <Button
            onClick={handleAdd}
            disabled={isAdding || !newTerm || !newSpelling}
            className="rounded-[var(--radius-md)] bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--brand-400))] hover:from-[hsl(var(--brand-400))] hover:to-[hsl(var(--brand-500))] whitespace-nowrap"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
            <Plus className="h-4 w-4 mr-2" />
                Add Term
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Items List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 space-y-4 rounded-[var(--radius-xl)] border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--mist))]"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--accent))] rounded-full blur-2xl opacity-20" />
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(var(--brand-500))]/10 to-[hsl(var(--accent))]/10 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-[hsl(var(--brand-500))]" />
                </div>
              </div>
              <div className="text-center space-y-1 max-w-sm">
                <h3 className="text-base font-semibold text-[hsl(var(--text))]">
                  No dictionary items yet
                </h3>
                <p className="text-sm text-[hsl(var(--text-muted))]">
                  Add custom terms and their preferred spellings to improve transcription accuracy
                </p>
              </div>
            </motion.div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className={cn(
                  "group relative rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-sm hover:shadow-md transition-all duration-200",
                  editingId === item.id && "ring-2 ring-[hsl(var(--brand-500))]/20"
                )}
              >
                {editingId === item.id ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Input
                      value={editTerm}
                      onChange={(e) => setEditTerm(e.target.value)}
                      className="flex-1 rounded-[var(--radius-md)]"
                      autoFocus
                    />
                    <Input
                      value={editSpelling}
                      onChange={(e) => setEditSpelling(e.target.value)}
                      className="flex-1 rounded-[var(--radius-md)]"
                    />
                    <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveEdit}
                        className="rounded-full hover:bg-[hsl(var(--success))]/10 hover:text-[hsl(var(--success))]"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEdit}
                        className="rounded-full hover:bg-[hsl(var(--muted))]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-semibold text-[hsl(var(--text))] truncate">
                          {item.term}
                        </span>
                        <span className="text-[hsl(var(--text-muted))] flex-shrink-0">→</span>
                        <span className="text-[hsl(var(--text-muted))] truncate">
                          {item.preferredSpelling}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(item)}
                        className="h-8 w-8 rounded-full hover:bg-[hsl(var(--brand-500))]/10 hover:text-[hsl(var(--brand-500))]"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 rounded-full hover:bg-[hsl(var(--danger))]/10 hover:text-[hsl(var(--danger))]"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-xs text-[hsl(var(--text-muted))]"
        >
          <div className="h-1 w-1 rounded-full bg-[hsl(var(--brand-500))]" />
          <span>{items.length} custom {items.length === 1 ? 'term' : 'terms'} in your dictionary</span>
        </motion.div>
          )}
        </div>
  );
}

