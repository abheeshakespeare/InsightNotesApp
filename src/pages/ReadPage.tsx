import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getNote, deleteNote, Note } from "@/services/noteService";
import { toast } from "sonner";

const ReadPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (id) {
          const foundNote = await getNote(id);
          if (foundNote) {
            setNote(foundNote);
          } else {
            navigate("/notes");
          }
        }
      } catch (err) {
        setError("Failed to load note. Please try again.");
        console.error("Error fetching note:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);
  
  const handleEdit = () => {
    navigate(`/editor/${id}`);
  };
  
  const handleDelete = async () => {
    try {
      if (id) {
        await deleteNote(id);
        toast.success("Note deleted successfully");
        navigate("/notes");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      toast.error("Failed to delete note");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 h-64">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/notes")}
          >
            Back to Notes
          </Button>
        </div>
      </div>
    );
  }
  
  if (!note) {
    return (
      <div className="flex items-center justify-center p-6 h-64">
        <div className="text-center">
          <p className="text-gray-500">Note not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/notes")}
          >
            Back to Notes
          </Button>
        </div>
      </div>
    );
  }
  
  const formattedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          className="gap-1 hover:bg-blue-50 transition-colors"
          onClick={() => navigate("/notes")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="gap-1 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-black-100 text-blue-700 transition-all duration-300"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <Button 
              variant="destructive" 
              className="gap-1 bg-gradient-to-r from-red-500 to-rose-400 hover:from-red-600 hover:to-rose-500 transition-all duration-300"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <AlertDialogContent className="glass-effect">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your note.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="transition-colors hover:bg-slate-100">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-rose-400 hover:from-red-600 hover:to-rose-500"
                >Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Card className="overflow-hidden card-hover border-blue-100 bg-indigo-50/20">
        <CardHeader className="header-gradient border-b border-blue-100">
          <CardTitle className="text-2xl text-indigo-900">{note.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4 text-blue-500" />
            <span>Last updated on {formattedDate}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Tag className="h-4 w-4 text-black-500 mr-1" />
            {note.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="highlight-badge"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <Separator className="bg-indigo-100" />
        <CardContent className="prose prose-sm max-w-none">
          <div className="whitespace-pre-line">{note.content}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadPage; 