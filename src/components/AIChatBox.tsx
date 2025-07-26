import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, FileDown, PlusCircle, Sparkles } from "lucide-react";
import { getNotes, Note } from "@/services/noteService";
import { getCreativeWritings, CreativeWriting, addSelectedTextToCreativeWriting } from "@/services/creativeWritingService";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { queryGeminiWithNotes, addSelectedTextToNote, generateGeneralResponse } from "@/services/geminiService";

// Mock Gemini API response for now
const generateAIResponse = async (
  message: string, 
  notes: any[]
): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Very basic response based on notes content
  const notesContent = notes.map(note => note.content.toLowerCase()).join(" ");
  
  if (message.toLowerCase().includes("how many")) {
    return `You have ${notes.length} notes in your collection.`;
  } else if (message.toLowerCase().includes("summary")) {
    return `Here's a summary of your notes:\n\n${notes.map((note, i) => 
      `${i+1}. ${note.title}: ${note.content.substring(0, 50)}...`
    ).join("\n")}`;
  } else if (notesContent.includes(message.toLowerCase())) {
    return `Based on your notes, I found some relevant information: ${notes.find(
      note => note.content.toLowerCase().includes(message.toLowerCase())
    )?.content || ""}`;
  }
  
  return "I'm your AI assistant that can help answer questions about your notes. What would you like to know?";
};

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

type AIChatBoxProps = {
  isOpen: boolean;
  onClose: () => void;
  isCreative?: boolean;
};

const AIChatBox = ({ isOpen, onClose, isCreative = false }: AIChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: isCreative 
        ? `<p>Hello! I'm your Creative Writing Assistant. I can help you with:</p>
        <ul>
          <li>Providing ideas and inspiration for your writings</li>
          <li>Offering feedback on your stories, poems, or other creative works</li>
          <li>Helping with character development, plot, or setting</li>
          <li>Suggesting writing techniques and tips</li>
          <li>Discussing any topic that interests you, even beyond creative writing</li>
        </ul>
        <p>Feel free to ask me anything - our conversation doesn't have to be limited to what's in your notes!</p>`
        : `<p>Hello! I'm your AI assistant. I can help you with:</p>
        <ul>
          <li>Answering questions about your notes</li>
          <li>Providing insights and explanations on any topic</li>
          <li>Discussing concepts related to your notes or beyond</li>
          <li>Helping with study strategies and learning techniques</li>
          <li>Any other questions you might have - I'm not limited to just your notes!</li>
        </ul>
        <p>How can I assist you today?</p>`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showNoteOptions, setShowNoteOptions] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [notes, setNotes] = useState<Note[]>([]);
  const [writings, setWritings] = useState<CreativeWriting[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isCreative) {
          const fetchedWritings = await getCreativeWritings();
          setWritings(fetchedWritings || []);
        } else {
          const fetchedNotes = await getNotes();
          setNotes(fetchedNotes || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: `Failed to load ${isCreative ? "writings" : "notes"} for AI context`,
          variant: "destructive",
        });
      }
    };
    loadData();
  }, [isCreative]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0 && !isUserMessage(selection)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(selection.toString());
        setSelectionPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top - 10 
        });
        setShowNoteOptions(true);
      } else {
        setShowNoteOptions(false);
      }
    };

    const isUserMessage = (selection: Selection) => {
      const node = selection.anchorNode?.parentElement;
      return node?.closest('.user-message') !== null;
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response;
      // Check if the message is a greeting or general query
      const isGreeting = /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))/i.test(input.trim());
      
      if (isCreative || isGreeting) {
        // Pass the appropriate content based on whether it's for creative writing or academic notes
        const contentToUse = isCreative ? writings : notes;
        response = await generateGeneralResponse(input.trim(), isCreative, contentToUse);
      } else {
        const geminiResponse = await queryGeminiWithNotes(input.trim(), notes);
        response = typeof geminiResponse === 'object' && geminiResponse?.text ? geminiResponse.text : String(geminiResponse);
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: typeof response === 'object' ? JSON.stringify(response) : String(response),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToContent = async (contentId: string) => {
    try {
      let success;
      
      if (isCreative) {
        success = await addSelectedTextToCreativeWriting(selectedText, contentId);
      } else {
        // Fix the order of parameters to match the function signature
        success = await addSelectedTextToNote(selectedText, contentId);
      }
      
      if (success) {
        toast({
          title: "Success",
          description: `Text added to ${isCreative ? "writing" : "note"} successfully`,
        });
      } else {
        throw new Error(`Failed to add text to ${isCreative ? "writing" : "note"}`);
      }
    } catch (error) {
      console.error(`Error adding text to ${isCreative ? "writing" : "note"}:`, error);
      toast({
        title: "Error",
        description: `Failed to add text to ${isCreative ? "writing" : "note"}`,
        variant: "destructive",
      });
    } finally {
      setShowNoteOptions(false);
      setSelectedText("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className={cn(
          "border-b",
          isCreative && "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-gray-800 dark:to-gray-700"
        )}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              {isCreative ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  Creative Writing Assistant
                </>
              ) : (
                <>
                  <Bot className="h-5 w-5 mr-2 text-primary" />
                  Academic AI Assistant
                </>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col rounded-lg p-3",
                    message.isUser
                      ? "ml-auto bg-primary text-primary-foreground user-message max-w-[80%]"
                      : "mr-auto bg-muted max-w-[80%]"
                  )}
                >
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                  <span className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        <div className="p-4 border-t">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              handleSendMessage(); 
            }} 
            className="flex gap-2"
          >
            <Input
              placeholder={isCreative ? "Ask for writing ideas..." : "Ask about your notes..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Send
            </Button>
          </form>
        </div>
      </Card>
      
      {showNoteOptions && (
        <div
          className="fixed z-50"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: "translate(-50%, -100%)"
          }}
        >
          <Card className="w-56 shadow-lg">
            <CardHeader className="py-2 px-3">
              <p className="text-sm font-medium">Add to {isCreative ? "writing" : "note"}</p>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-40">
                <div className="px-2 py-1">
                  {isCreative ? (
                    writings.length > 0 ? (
                      writings.map(writing => (
                        <Button
                          key={writing.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left mb-1"
                          onClick={() => handleAddToContent(writing.id)}
                        >
                          {writing.title}
                        </Button>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground p-2">No writings available</p>
                    )
                  ) : (
                    notes.length > 0 ? (
                      notes.map(note => (
                        <Button
                          key={note.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left mb-1"
                          onClick={() => handleAddToContent(note.id)}
                        >
                          {note.title}
                        </Button>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground p-2">No notes available</p>
                    )
                  )}
                </div>
              </ScrollArea>
              <div className="p-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowNoteOptions(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIChatBox;

