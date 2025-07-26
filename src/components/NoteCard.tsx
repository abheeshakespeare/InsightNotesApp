import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Tag, PenIcon, TrashIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Note, deleteNote } from "@/services/noteService";
import NoteEditor from "@/components/NoteEditor";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

type NoteCardProps = {
  note: Note;
  onUpdate: () => void;
  isCreative?: boolean;
};

const NoteCard = ({ note, onUpdate, isCreative = false }: NoteCardProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { id, title, content, createdAt, updatedAt, tags } = note;
  
  const handleDelete = async () => {
    try {
      await deleteNote(id);
      toast({
        title: "Success",
        description: `${isCreative ? "Writing" : "Note"} deleted successfully`,
      });
      onUpdate();
    } catch (error) {
      console.error(`Error deleting ${isCreative ? "writing" : "note"}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${isCreative ? "writing" : "note"}`,
        variant: "destructive",
      });
    }
  };
  
  const handleEditComplete = () => {
    setIsEditing(false);
    onUpdate();
  };

  const handleCardClick = () => {
    navigate(`/read/${id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  // Truncate content for preview
  const previewContent = content.length > 150
    ? content.substring(0, 150) + "..."
    : content;

  // Functions for formatting content and counting words
  const formatNoteContent = (content: string) => {
    return content.replace(/\n/g, ' ').trim();
  };

  const countWords = (content: string) => {
    return content.split(/\s+/).filter(Boolean).length;
  };

  // Simple function to get different badge styles for visual variety
  const getBadgeVariant = (index: number) => {
    const variants = ["default", "secondary", "outline", "destructive"] as const;
    return variants[index % variants.length];
  };

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:translate-y-[-2px] relative overflow-hidden group"
        onClick={handleCardClick}
      >
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handleEdit}
          >
            <PenIcon className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
            onClick={handleDeleteClick}
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg truncate">{title}</CardTitle>
          <CardDescription>
            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm line-clamp-3 mb-3">
            {formatNoteContent(content)}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex gap-2 flex-wrap">
            {tags && tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={tag}
                variant={getBadgeVariant(index)}
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
            {tags && tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {countWords(content)} words
          </p>
        </CardFooter>
      </Card>

      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Edit {isCreative ? 'Creative Writing' : 'Note'}</DialogTitle>
              <DialogDescription>
                Make changes to your {isCreative ? 'creative writing' : 'note'} here.
              </DialogDescription>
            </DialogHeader>
            <NoteEditor
              initialNote={note}
              onComplete={handleEditComplete}
              isCreative={isCreative}
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your {isCreative ? 'creative writing' : 'note'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NoteCard;
