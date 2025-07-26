import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenIcon, TrashIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { deleteNote, Note } from "@/services/noteService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WritingCardProps {
  writing: Note;
  onUpdate: () => void;
}

export default function WritingCard({ writing, onUpdate }: WritingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteNote(writing.id);
      toast.success("Writing deleted successfully");
      onUpdate();
    } catch (error) {
      console.error("Error deleting writing:", error);
      toast.error("Failed to delete writing");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/editor/${writing.id}`);
  };

  const handleCardClick = () => {
    navigate(`/read/${writing.id}`);
  };

  const getBadgeVariant = (index: number): "default" | "secondary" | "outline" | "destructive" => {
    const variants = ["default", "secondary", "outline", "destructive"] as const;
    return variants[index % variants.length];
  };

  const formatContent = (content: string) => {
    return content.length > 150 ? content.substring(0, 150) + "..." : content;
  };

  const countWords = (content: string) => {
    return content.trim().split(/\s+/).length;
  };

  return (
    <>
      <Card 
        className="group relative overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{writing.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {writing.tags?.map((tag, index) => (
                  <Badge key={index} variant={getBadgeVariant(index)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleEdit}
              >
                <PenIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">{formatContent(writing.content)}</p>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{countWords(writing.content)} words</span>
            <span>{formatDistanceToNow(new Date(writing.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Writing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this writing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 