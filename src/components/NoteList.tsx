import React from 'react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Note } from "@/services/noteService";
import NoteCard from "@/components/NoteCard";
import NoteEditor from "@/components/NoteEditor";
import { PlusCircle, Bot, Search } from "lucide-react";
import AIChatBox from "@/components/AIChatBox";
import { Input } from "@/components/ui/input";

type NoteListProps = {
  notes: Note[];
  onUpdate: () => void;
  isCreative?: boolean;
  title?: string;
};

const NoteList = ({ notes = [], onUpdate, isCreative = false, title = "Your Notes" }: NoteListProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  
  const handleCreateComplete = () => {
    setIsCreating(false);
    onUpdate();
  };

  const safeNotes = Array.isArray(notes) ? notes : [];

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNotes(safeNotes);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = safeNotes.filter((note) => 
        note.title.toLowerCase().includes(lowercaseQuery) || 
        note.content.toLowerCase().includes(lowercaseQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredNotes(filtered);
    }
  }, [searchQuery, safeNotes]);
  
  // Different chat button label and dialog description based on type
  const chatButtonLabel = isCreative ? "Creative Assistant" : "Ask AI";
  const newButtonLabel = isCreative ? "New Creation" : "New Note";
  const dialogTitle = isCreative ? "Create New Writing" : "Create New Note";
  const dialogDescription = isCreative 
    ? "Express your creativity through writing."
    : "Capture your thoughts and ideas.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">{title}</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className={`flex items-center gap-1 border-blue-200 ${
                isCreative 
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700"
              }`}
              onClick={() => setIsAIChatOpen(true)}
            >
              <Bot className="h-4 w-4" />
              {chatButtonLabel}
            </Button>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className={`flex items-center gap-1 ${
                  isCreative
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                    : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                } transition-all duration-300`}>
                  <PlusCircle className="h-4 w-4" />
                  {newButtonLabel}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] glass-effect">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                  <DialogDescription>
                    {dialogDescription}
                  </DialogDescription>
                </DialogHeader>
                <NoteEditor onComplete={handleCreateComplete} isCreative={isCreative} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {filteredNotes.length === 0 ? (
        searchQuery.trim() !== "" ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground">
              No {isCreative ? 'writings' : 'notes'} found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className={`rounded-full ${isCreative ? 'bg-purple-100' : 'bg-blue-100'} p-6 mb-4 animate-float`}>
              <PlusCircle className={`h-12 w-12 ${isCreative ? 'text-purple-600' : 'text-blue-600'}`} />
            </div>
            <h3 className={`text-xl font-semibold bg-gradient-to-r ${
              isCreative 
                ? 'from-purple-700 to-pink-700' 
                : 'from-indigo-700 to-blue-700'
            } bg-clip-text text-transparent`}>
              {isCreative ? 'No creative writings yet' : 'No notes yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isCreative 
                ? 'Create your first creative writing to get started.' 
                : 'Create your first note to get started.'}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className={`${
                  isCreative
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                    : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                } transition-all duration-300`}>
                  {newButtonLabel}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                  <DialogDescription>
                    {dialogDescription}
                  </DialogDescription>
                </DialogHeader>
                <NoteEditor onComplete={handleCreateComplete} isCreative={isCreative} />
              </DialogContent>
            </Dialog>
          </div>
        )
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onUpdate={onUpdate} isCreative={isCreative} />
          ))}
        </div>
      )}
      
      <AIChatBox 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)}
        isCreative={isCreative} 
      />
    </div>
  );
};

export default NoteList;
