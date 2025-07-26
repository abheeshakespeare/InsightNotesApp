import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getNotes, Note } from "@/services/noteService";
import { AIInsight, generateInsights } from "@/services/aiService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BrainCircuit, FileText, Loader2 } from "lucide-react";

const InsightsPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [allInsights, setAllInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
        
        // Generate insights for all notes
        setIsLoading(true);
        const insights = await generateInsights(fetchedNotes);
        setAllInsights(insights);
      } catch (error) {
        console.error("Error loading insights:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, []);

  const recommendedTags = ["important", "study", "work", "idea", "project"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">
          Discover AI-generated insights and questions from your notes.
        </p>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-1">
              <BrainCircuit className="h-4 w-4" />
              All Insights
            </TabsTrigger>
            <TabsTrigger value="byTopic" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              By Topic
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="space-y-6 mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">
                  Analyzing your notes...
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle>Questions & Answers</CardTitle>
                </div>
                <CardDescription>
                  AI-generated insights based on the content of all your notes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {allInsights.map((insight) => (
                    <AccordionItem key={insight.id} value={insight.id}>
                      <AccordionTrigger className="text-left font-medium">
                        {insight.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {insight.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="byTopic" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Topics</CardTitle>
              <CardDescription>
                Browse insights organized by topics extracted from your notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6">
                {recommendedTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm cursor-pointer hover:bg-muted">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="text-center text-muted-foreground p-6">
                <Sparkles className="h-6 w-6 mx-auto mb-2" />
                <p>Select a topic to view related insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsightsPage;
