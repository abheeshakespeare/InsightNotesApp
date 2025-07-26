import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookOpen, Brain, Clock } from "lucide-react";
import NoteList from "@/components/NoteList";
import { getAcademicNotes, Note } from "@/services/noteService";

const Dashboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await getAcademicNotes();
      setNotes(fetchedNotes || []);
    } catch (error) {
      console.error("Error loading notes:", error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadNotes();
  }, []);
  
  const totalWords = notes?.reduce(
    (acc, note) => acc + (note.content?.split(/\s+/).filter(Boolean).length || 0),
    0
  ) || 0;
  
  const stats = [
    {
      title: "Total Notes",
      value: notes?.length || 0,
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Words Written",
      value: totalWords,
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Study Topics",
      value: Array.from(new Set(notes.flatMap(note => note.tags || []))).length,
      icon: Brain,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Last Activity",
      value: notes?.[0]?.updatedAt 
        ? new Date(notes[0].updatedAt).toLocaleDateString()
        : "No activity",
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
  ];
  
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
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your personal academic knowledge hub.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.color} p-2 rounded-full`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <NoteList 
        notes={notes} 
        onUpdate={loadNotes} 
        isCreative={false}
        title="Your Academic Notes" 
      />
    </div>
  );
};

export default Dashboard;
