import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getNote, updateNote, saveNote, Note } from "@/services/noteService";
import { getCreativeWriting, updateCreativeWriting, saveCreativeWriting, createCreativeWritingsTable } from "@/services/creativeWritingService";

const categories = [
  { value: "Poetry", label: "Poetry" },
  { value: "Short Stories", label: "Short Stories" },
  { value: "Journal", label: "Journal" },
  { value: "Novel", label: "Novel" },
  { value: "general", label: "General" }
];

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [isCreative, setIsCreative] = useState(queryParams.get("type") === "creative");
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState<string>(queryParams.get("category") || "general");
  const [isLoading, setIsLoading] = useState(id !== "new");
  const [isSaving, setIsSaving] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(true);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (id === "new") {
        setIsLoading(false);
        return;
      }
      
      try {
        if (isCreative) {
          const writing = await getCreativeWriting(id!);
          if (writing) {
            setTitle(writing.title);
            setContent(writing.content);
            setTags(writing.tags || []);
            setCategory(writing.category || "general");
          }
        } else {
          const note = await getNote(id!);
          if (note) {
            setTitle(note.title);
            setContent(note.content);
            setTags(note.tags || []);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, isCreative]);
  
  useEffect(() => {
    if (isCreative) {
      createCreativeWritingsTable().catch(error => {
        console.error("Failed to ensure creative_writings table exists:", error);
      });
    }
  }, [isCreative]);
  
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/creativity/') || path.includes('/creative/')) {
      setIsCreative(true);
    }
  }, []);
  
  const handleSave = async () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      console.log(`Starting save operation for ${isCreative ? 'creative writing' : 'academic note'}`);
      
      let savedItem;

      if (isCreative) {
        // Save as creative writing
        const creativeWriting = {
          id,
          title,
          content,
          tags,
          category: category || 'general',
        };
        
        console.log('Saving as creative writing with data:', creativeWriting);
        savedItem = await saveCreativeWriting(creativeWriting);
      } else {
        // Save as academic note
        const academicNote = {
          id,
          title,
          content,
          tags,
          type: "academic" as "academic"
        };
        console.log('Saving as academic note with data:', academicNote);
        savedItem = await saveNote(academicNote);
      }

      if (!savedItem) {
        throw new Error('Failed to save: No data returned from server');
      }

      setIsSaving(false);
      
      toast({
        title: isCreative ? "Creative Writing Saved" : "Note Saved",
        description: `Your ${isCreative ? 'creative writing' : 'note'} has been saved successfully`,
      });
      
      // Redirect if this was a new note
      if (id === "new") {
        navigate(isCreative ? `/creativity/${savedItem.id}` : `/notes/${savedItem.id}`);
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      setIsSaving(false);
      
      // Provide more detailed error information
      let errorMessage = error.message || 'An unknown error occurred';
      
      // Check for specific database errors
      if (errorMessage.includes('relation "creative_writings" does not exist')) {
        errorMessage = 'The creative_writings table does not exist. Please run the SQL setup script from the src/sql directory.';
        console.error('Database table error - Creative writings table missing');
        
        toast({
          title: "Database Setup Required",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error Saving",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-blue-100 dark:bg-blue-900 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(isCreative ? "/creativity" : "/notes")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {isCreative ? "Creative Writings" : "Notes"}
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className={isCreative 
            ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600" 
            : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
          }
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : (id === "new" ? "Create" : "Update")}
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                className="mt-1"
                ref={titleInputRef}
              />
            </div>
            
            {isCreative && (
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here..."
              className="min-h-[400px] mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <span className="sr-only">Remove {tag} tag</span>
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add a tag"
              />
              <Button onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorPage; 