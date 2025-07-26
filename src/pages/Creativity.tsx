import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PenTool, Plus, Book, Feather, Edit3, Heart, PenIcon, TrashIcon, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { getCreativeWritings, CreativeWriting, deleteCreativeWriting } from "@/services/creativeWritingService";
import AIChatBox from "@/components/AIChatBox";

const categories = [
  { name: "Poetry", icon: <Feather className="h-5 w-5" />, color: "text-purple-500", description: "Express yourself through verse and rhythm" },
  { name: "Short Stories", icon: <Book className="h-5 w-5" />, color: "text-pink-500", description: "Craft concise narratives with impact" },
  { name: "Journal", icon: <Edit3 className="h-5 w-5" />, color: "text-blue-500", description: "Document your thoughts and experiences" },
  { name: "Novel", icon: <Heart className="h-5 w-5" />, color: "text-red-500", description: "Develop your longer works and narratives" },
];

const CategoryCard = ({ category, onClick }: { category: any; onClick: () => void }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <div className={category.color}>{category.icon}</div>
          <CardTitle className="text-xl">{category.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{category.description}</CardDescription>
      </CardContent>
    </Card>
  );
};

const WritingCard = ({ writing, onClick }: { writing: CreativeWriting; onClick: () => void }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigate(`/editor/${writing.id}?type=creative`);
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCreativeWriting(writing.id);
      toast.success("Writing deleted successfully");
      // Reload writings by clicking on the same category if selected
      window.location.reload();
    } catch (error) {
      console.error("Error deleting writing:", error);
      toast.error("Failed to delete writing");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:translate-y-[-2px] relative overflow-hidden group"
        onClick={onClick}
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
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg truncate">{writing.title}</CardTitle>
          <CardDescription>
            {formatDistanceToNow(writing.updatedAt, { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm line-clamp-3 mb-3">
            {writing.content}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0">
          {writing.category && (
            <Badge variant={
              writing.category === "Poetry" ? "outline" :
              writing.category === "Short Stories" ? "secondary" :
              writing.category === "Journal" ? "default" :
              writing.category === "Novel" ? "destructive" : "default"
            }>
              {writing.category}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground">
            {writing.tags && writing.tags.length > 0
              ? writing.tags.slice(0, 2).join(", ") + (writing.tags.length > 2 ? "..." : "")
              : "No tags"}
          </p>
        </CardFooter>
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
};

const EmptyState = ({ onNewWriting }: { onNewWriting: () => void }) => (
  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
    <PenTool className="h-12 w-12 mb-5" />
    <h2 className="text-2xl font-bold mt-6 mb-2">
      No writings yet
    </h2>
    <p className="text-muted-foreground mb-6">
      Start your creative journey by adding your first writing piece.
    </p>
    <Button 
      variant="default" 
      onClick={onNewWriting}
    >
      <Plus className="mr-2 h-4 w-4" /> Create your first writing
    </Button>
  </div>
);

export default function CreativityPage() {
  const [writings, setWritings] = useState<CreativeWriting[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  
  const bgGradient = "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700";
  
  useEffect(() => {
    const loadWritings = async () => {
      setIsLoading(true);
      try {
        const data = await getCreativeWritings(selectedCategory || undefined);
        setWritings(data);
      } catch (error) {
        console.error("Error loading creative writings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWritings();
  }, [selectedCategory]);
  
  const handleNewWriting = (category?: string) => {
    // Navigate to editor with category pre-selected if provided
    navigate("/editor/new?type=creative" + (category ? `&category=${category}` : ""));
  };
  
  const handleWritingClick = (writing: CreativeWriting) => {
    navigate(`/editor/${writing.id}?type=creative`);
  };
  
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`p-6 rounded-lg mb-8 ${bgGradient}`}>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Your Creative Space
        </h1>
        <p className="text-muted-foreground">
          Express yourself through writing, poetry, and storytelling
        </p>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {categories.map((category) => (
            <CategoryCard 
              key={category.name}
              category={category}
              onClick={() => handleCategoryClick(category.name)}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory ? `${selectedCategory} Writings` : "All Writings"}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={toggleChat}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Ask AI Assistant</span>
            </Button>
            <Button 
              onClick={() => handleNewWriting(selectedCategory || undefined)}
            >
              <Plus className="mr-2 h-4 w-4" /> New Writing
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-gray-700 rounded-full mb-4"></div>
              <div className="h-4 w-24 bg-purple-100 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : writings.length === 0 ? (
          <EmptyState onNewWriting={() => handleNewWriting(selectedCategory || undefined)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {writings.map((writing) => (
              <WritingCard 
                key={writing.id}
                writing={writing} 
                onClick={() => handleWritingClick(writing)}
              />
            ))}
          </div>
        )}
      </div>

      <AIChatBox 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        isCreative={true}
      />
    </div>
  );
} 