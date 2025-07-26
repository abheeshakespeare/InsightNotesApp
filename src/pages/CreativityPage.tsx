import { useState, useEffect } from "react";
import { getCreativeNotes, Note } from "@/services/noteService";
import NoteList from "@/components/NoteList";
import { Pen, Book, QuoteIcon, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CreativityPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await getCreativeNotes();
      setNotes(fetchedNotes || []);
    } catch (error) {
      console.error("Error loading creative notes:", error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadNotes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-purple-100 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-purple-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Creative writing category suggestions
  const categories = [
    { name: "Poetry", icon: QuoteIcon, color: "bg-pink-100 text-pink-600" },
    { name: "Short Stories", icon: Book, color: "bg-purple-100 text-purple-600" },
    { name: "Journal Entries", icon: Pen, color: "bg-blue-100 text-blue-600" },
    { name: "Novel Drafts", icon: Pencil, color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Creativity</h1>
        <p className="text-muted-foreground">
          Express yourself through creative writing, separated from your academic notes.
        </p>
      </div>
      
      {/* Categories section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${category.color}`}>
                  <category.icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">{category.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {getDescriptionForCategory(category.name)}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Note list with isCreative prop */}
      <NoteList 
        notes={notes} 
        onUpdate={loadNotes} 
        isCreative={true}
        title="Your Creative Writings"
      />
    </div>
  );
};

// Helper function to generate descriptions for each category
function getDescriptionForCategory(category: string): string {
  switch (category) {
    case "Poetry":
      return "Express emotions through verse, rhyme, and rhythm.";
    case "Short Stories":
      return "Craft concise narratives with compelling characters.";
    case "Journal Entries":
      return "Document personal reflections, experiences, and growth.";
    case "Novel Drafts":
      return "Develop longer narratives with complex plots and worlds.";
    default:
      return "Express your creativity in writing.";
  }
}

export default CreativityPage; 