import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '@/services/api/userService';
import dietChatService, { DietChat, CreateDietChatRequest, DietChatReplyRequest } from '@/services/api/dietChatService';
import { format } from 'date-fns';
import { Loader2, MessageSquare, Send, Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import userService from '@/services/api/userService';

interface DietChatsProps {
  userProfile: UserProfile | null;
}

const DietChats: React.FC<DietChatsProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [chats, setChats] = useState<DietChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<DietChat | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [newChat, setNewChat] = useState<CreateDietChatRequest>({
    title: '',
    initialQuery: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ index: number; content: string } | null>(null);
  const [editingChat, setEditingChat] = useState<{ id: string; title: string } | null>(null);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, UserProfile>>({});

  const isMember = userProfile?.roles?.includes('MEMBER');
  const isAdmin = userProfile?.roles?.includes('ADMIN');
  const isTrainer = userProfile?.roles?.includes('TRAINER');

  const fetchMemberProfiles = async () => {
    try {
      const members = await userService.getAllMembers();
      const profileMap = members.reduce((acc, member) => {
        acc[member.id] = member;
        return acc;
      }, {} as Record<string, UserProfile>);
      setMemberProfiles(profileMap);
    } catch (error) {
      console.error('Error fetching member profiles:', error);
    }
  };

  const fetchDietChats = async () => {
    try {
      const data = await dietChatService.getAllDietChats();
      setChats(data);
      
      // Fetch member profiles for admins and trainers
      if (isAdmin || isTrainer) {
        fetchMemberProfiles();
      }
      
      // Update selected chat if it exists
      if (selectedChat) {
        const updatedSelectedChat = data.find(chat => chat.id === selectedChat.id);
        if (updatedSelectedChat) {
          setSelectedChat(updatedSelectedChat);
        }
      }
      // If there's only one chat, automatically select it (good for members)
      else if (data.length === 1 && isMember) {
        setSelectedChat(data[0]);
      }
    } catch (error) {
      console.error('Error fetching diet chats:', error);
      toast({
        title: "Error",
        description: "Failed to load diet chats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Start polling when component mounts
  useEffect(() => {
    if (userProfile) {
      fetchDietChats();
      // Poll every 5 seconds
      pollingIntervalRef.current = setInterval(fetchDietChats, 5000);
    }

    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateChat = async () => {
    if (!newChat.title.trim() || !newChat.initialQuery.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await dietChatService.createDietChat(newChat);
      toast({
        title: "Diet Chat Created",
        description: "Your diet chat has been created successfully.",
      });
      setNewChat({ title: '', initialQuery: '' });
      setCreateFormOpen(false);
      await fetchDietChats();
    } catch (error) {
      console.error('Error creating diet chat:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create your diet chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedChat || !replyContent.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const replyData: DietChatReplyRequest = {
        content: replyContent,
      };
      await dietChatService.replyToDietChat(selectedChat.id, replyData);
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      setReplyContent('');
      await fetchDietChats();
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateChat = async () => {
    if (!editingChat || !editingChat.title.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await dietChatService.updateDietChatTitle(editingChat.id, {
        title: editingChat.title,
        initialQuery: selectedChat?.initialQuery || ''
      });
      toast({
        title: "Chat Updated",
        description: "Chat title has been updated successfully.",
      });
      setEditingChat(null);
      await fetchDietChats();
    } catch (error) {
      console.error('Error updating chat:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await dietChatService.deleteDietChat(chatId);
      toast({
        title: "Chat Deleted",
        description: "Chat has been deleted successfully.",
      });
      setSelectedChat(null);
      await fetchDietChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage || !selectedChat) {
      return;
    }

    setSubmitting(true);
    try {
      await dietChatService.updateMessage(selectedChat.id, editingMessage.index, editingMessage.content);
      toast({
        title: "Message Updated",
        description: "Message has been updated successfully.",
      });
      setEditingMessage(null);
      await fetchDietChats();
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageIndex: number) => {
    if (!selectedChat || !window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await dietChatService.deleteMessage(selectedChat.id, messageIndex);
      toast({
        title: "Message Deleted",
        description: "Message has been deleted successfully.",
      });
      await fetchDietChats();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isMember ? "My Diet Chat" : "Diet Chats"}
          </h1>
          <p className="text-muted-foreground">
            {isMember 
              ? "Chat with trainers about your diet plan" 
              : "View and respond to diet-related queries"
            }
          </p>
        </div>
        
        {isMember && (
          <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Diet Chat
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-lb-card border border-lb-accent/10">
              <DialogHeader>
                <DialogTitle>Start a New Diet Chat</DialogTitle>
                <DialogDescription>
                  Describe your dietary concerns or questions for our trainers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    placeholder="Chat title"
                    value={newChat.title}
                    onChange={(e) => setNewChat({...newChat, title: e.target.value})}
                    className="bg-lb-darker"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="initialQuery" className="text-sm font-medium">Your Question</label>
                  <Textarea
                    id="initialQuery"
                    placeholder="Describe your diet question or concern..."
                    value={newChat.initialQuery}
                    onChange={(e) => setNewChat({...newChat, initialQuery: e.target.value})}
                    className="h-32 bg-lb-darker"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateFormOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateChat}
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Start Chat
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-lb-accent" />
        </div>
      ) : chats.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center h-40 space-y-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isMember 
                ? "You haven't started any diet chats yet." 
                : "No diet chats have been created yet."
              }
            </p>
            {isMember && (
              <Button 
                onClick={() => setCreateFormOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Diet Chat
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
          <Card className="glass-card col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="space-y-1 pb-2 flex-shrink-0">
              <CardTitle className="text-xl">Conversations</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-lb-darker text-sm h-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-1 px-2">
                  {filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                      <div key={chat.id} className="flex items-center">
                        <Button 
                          variant={selectedChat?.id === chat.id ? "default" : "ghost"}
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => setSelectedChat(chat)}
                        >
                          <div className="truncate">
                            <div className="font-medium truncate">
                              {isAdmin || isTrainer ? (
                                <>
                                  {memberProfiles[chat.memberId] ? (
                                    `${memberProfiles[chat.memberId].firstName} ${memberProfiles[chat.memberId].lastName}`
                                  ) : (
                                    'Loading...'
                                  )}
                                  <div className="text-xs text-muted-foreground truncate">
                                    {chat.title}
                                  </div>
                                </>
                              ) : (
                                chat.title
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(chat.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </Button>
                        {(chat.memberId === userProfile?.id || isAdmin) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingChat({ id: chat.id, title: chat.title })}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Title
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteChat(chat.id)} className="text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Chat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No chats found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            {isMember && (
              <CardFooter className="pt-0 flex-shrink-0">
                <Button 
                  className="w-full mt-2"
                  onClick={() => setCreateFormOpen(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card className="glass-card col-span-1 lg:col-span-3 flex flex-col h-full overflow-hidden">
            {selectedChat ? (
              <>
                <CardHeader className="pb-2 flex-shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      {isAdmin || isTrainer ? (
                        <>
                          <CardTitle>
                            {memberProfiles[selectedChat.memberId] ? (
                              `${memberProfiles[selectedChat.memberId].firstName} ${memberProfiles[selectedChat.memberId].lastName}`
                            ) : (
                              'Loading...'
                            )}
                          </CardTitle>
                          <CardDescription>
                            {selectedChat.title}
                            <br />
                            Started on {format(new Date(selectedChat.createdAt), 'PPp')}
                          </CardDescription>
                        </>
                      ) : (
                        <>
                          <CardTitle>{selectedChat.title}</CardTitle>
                          <CardDescription>
                            Started on {format(new Date(selectedChat.createdAt), 'PPp')}
                          </CardDescription>
                        </>
                      )}
                    </div>
                    {(selectedChat.memberId === userProfile?.id || isAdmin) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingChat({ id: selectedChat.id, title: selectedChat.title })}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Title
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteChat(selectedChat.id)} className="text-red-500">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4">
                      {selectedChat.messages.map((msg, idx) => {
                        const isCurrentUser = userProfile?.id === msg.senderId || 
                          (isMember && msg.senderRole === 'MEMBER') ||
                          (isTrainer && msg.senderRole === 'TRAINER') ||
                          (isAdmin && msg.senderRole === 'ADMIN');

                        return (
                          <div 
                            key={idx} 
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="" />
                                <AvatarFallback className={
                                  msg.senderRole === 'MEMBER' 
                                    ? 'bg-blue-500' 
                                    : msg.senderRole === 'TRAINER' 
                                      ? 'bg-green-500' 
                                      : 'bg-purple-500'
                                }>
                                  {msg.senderRole[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-2">
                                {editingMessage?.index === idx ? (
                                  <div className="flex items-end gap-2">
                                    <Input
                                      value={editingMessage.content}
                                      onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                                      className="min-w-[200px]"
                                    />
                                    <div className="space-x-2">
                                      <Button 
                                        size="sm" 
                                        onClick={handleUpdateMessage}
                                        disabled={submitting}
                                      >
                                        {submitting ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          'Save'
                                        )}
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => setEditingMessage(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className={`rounded-lg px-3 py-2 group relative ${
                                      isCurrentUser 
                                        ? 'bg-lb-accent text-white' 
                                        : 'bg-lb-darker'
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                      {format(new Date(msg.timestamp), 'h:mm a')}
                                      {msg.edited && ' (edited)'}
                                    </p>
                                    {isCurrentUser && (
                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                              <MoreVertical className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingMessage({ index: idx, content: msg.content })}>
                                              <Edit className="h-4 w-4 mr-2" />
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteMessage(idx)} className="text-red-500">
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="border-t border-lb-accent/10 pt-3 flex-shrink-0">
                  {(isMember || isTrainer || isAdmin) && (
                    <div className="w-full flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="flex-grow bg-lb-darker"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                      />
                      <Button
                        disabled={submitting || !replyContent.trim()}
                        onClick={handleSendReply}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No Chat Selected</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  {filteredChats.length > 0
                    ? "Select a conversation from the sidebar to start chatting"
                    : isMember
                      ? "Start a new diet chat to get advice from our trainers"
                      : "No diet chats available at the moment"
                  }
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Edit Chat Title Dialog */}
      <Dialog open={!!editingChat} onOpenChange={(open) => !open && setEditingChat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chat Title</DialogTitle>
            <DialogDescription>
              Change the title of this chat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={editingChat?.title || ''}
                onChange={(e) => setEditingChat(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="bg-lb-darker"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChat(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateChat}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              Update Title
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DietChats;
