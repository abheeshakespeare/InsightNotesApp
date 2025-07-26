import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import NoteList from "@/components/NoteList";
import AIChatBox from "@/components/AIChatBox";
import { getAcademicNotes } from "@/services/noteService";
import { Note } from "@/services/noteService";
import { toast } from "sonner";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const academicNotes = await getAcademicNotes();
      setNotes(academicNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <NoteList 
          notes={notes} 
          onUpdate={loadNotes} 
          title="Your Academic Notes"
        />
      )}

      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <AIChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  );
}
