import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Note, saveNote, updateNote } from "@/services/noteService";
import { Tag, X, Save, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type NoteEditorProps = {
  initialNote?: Note;
  onComplete: () => void;
  isCreative?: boolean;
};

const NoteEditor = ({ initialNote, onComplete, isCreative = false }: NoteEditorProps) => {
  const [title, setTitle] = useState(initialNote?.title || "");
  const [content, setContent] = useState(initialNote?.content || "");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialNote?.tags) {
      setTags(initialNote.tags);
    }
  }, [initialNote?.tags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (initialNote) {
        await updateNote(initialNote.id, {
          ...initialNote,
          title,
          content,
          tags: tags,
          type: isCreative ? 'creative' : 'academic'
        });
      } else {
        await saveNote({
          title,
          content,
          tags: tags,
          type: isCreative ? 'creative' : 'academic'
        });
      }
      
      onComplete();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error saving note",
        description: error instanceof Error ? error.message : "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagsInput.trim() && !tags.includes(tagsInput.trim())) {
      setTags([...tags, tagsInput.trim()]);
      setTagsInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-indigo-900">Title</Label>
          <Input
            id="title"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border-blue-200 focus-visible:ring-blue-400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content" className="text-indigo-900">Content</Label>
          <Textarea
            id="content"
            placeholder="Start writing your note..."
            className="min-h-[200px] border-blue-200 focus-visible:ring-blue-400"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-indigo-900 flex items-center">
            <Tag className="h-4 w-4 mr-1 text-indigo-500" />
            Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="highlight-badge flex items-center gap-1"
              >
                {tag}
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 text-indigo-600 hover:text-indigo-900 hover:bg-transparent"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add a tag"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="border-blue-200 focus-visible:ring-blue-400"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={addTag}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-300"
        >
          <Save className="h-4 w-4 mr-1" />
          {isSubmitting ? "Saving..." : "Create Note"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default NoteEditor;
