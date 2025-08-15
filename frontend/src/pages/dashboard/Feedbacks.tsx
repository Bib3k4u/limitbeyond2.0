import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '@/services/api/userService';
import feedbackService, { Feedback, CreateFeedbackRequest, FeedbackResponseRequest } from '@/services/api/feedbackService';
import { format } from 'date-fns';
import { Loader2, MessageSquare, Send, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedbacksProps {
  userProfile: UserProfile | null;
}

const Feedbacks: React.FC<FeedbacksProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [respondFormOpen, setRespondFormOpen] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<Feedback | null>(null);
  const [responseContent, setResponseContent] = useState('');
  const [newFeedback, setNewFeedback] = useState<CreateFeedbackRequest>({
    title: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<{ id: string; title: string; content: string } | null>(null);
  const [editingResponse, setEditingResponse] = useState<{ feedbackId: string; index: number; content: string } | null>(null);

  const isMember = userProfile?.roles?.includes('MEMBER');
  const isAdmin = userProfile?.roles?.includes('ADMIN');
  const isTrainer = userProfile?.roles?.includes('TRAINER');

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getAllFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast({
        title: "Error",
        description: "Failed to load feedbacks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchFeedbacks();
    }
  }, [userProfile]);

  const handleCreateFeedback = async () => {
    if (!newFeedback.title.trim() || !newFeedback.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await feedbackService.createFeedback(newFeedback);
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been submitted successfully.",
      });
      setNewFeedback({ title: '', content: '' });
      setCreateFormOpen(false);
      fetchFeedbacks();
    } catch (error) {
      console.error('Error creating feedback:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondToFeedback = async () => {
    if (!activeFeedback || !responseContent.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const responseData: FeedbackResponseRequest = {
        content: responseContent,
      };
      await feedbackService.respondToFeedback(activeFeedback.id, responseData);
      toast({
        title: "Response Submitted",
        description: "Your response has been submitted successfully.",
      });
      setResponseContent('');
      setRespondFormOpen(false);
      fetchFeedbacks();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFeedback = async () => {
    if (!editingFeedback) return;

    setSubmitting(true);
    try {
      await feedbackService.updateFeedback(editingFeedback.id, {
        title: editingFeedback.title,
        content: editingFeedback.content,
      });
      toast({
        title: "Feedback Updated",
        description: "Your feedback has been updated successfully.",
      });
      setEditingFeedback(null);
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await feedbackService.deleteFeedback(feedbackId);
      toast({
        title: "Feedback Deleted",
        description: "Your feedback has been deleted successfully.",
      });
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete your feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateResponse = async () => {
    if (!editingResponse) return;

    setSubmitting(true);
    try {
      await feedbackService.updateFeedbackResponse(
        editingResponse.feedbackId,
        editingResponse.index,
        editingResponse.content
      );
      toast({
        title: "Response Updated",
        description: "Your response has been updated successfully.",
      });
      setEditingResponse(null);
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating response:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResponse = async (feedbackId: string, responseIndex: number) => {
    if (!window.confirm('Are you sure you want to delete this response?')) {
      return;
    }

    try {
      await feedbackService.deleteFeedbackResponse(feedbackId, responseIndex);
      toast({
        title: "Response Deleted",
        description: "Your response has been deleted successfully.",
      });
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting response:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete your response. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isMember ? "My Feedback" : "Feedback Management"}
          </h1>
          <p className="text-muted-foreground">
            {isMember 
              ? "Submit and track your feedback" 
              : "View and respond to member feedback"
            }
          </p>
        </div>
        
        {isMember && (
          <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-lb-card border border-lb-accent/10">
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
                <DialogDescription>
                  Share your thoughts, suggestions, or concerns with our team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    placeholder="Feedback title"
                    value={newFeedback.title}
                    onChange={(e) => setNewFeedback({...newFeedback, title: e.target.value})}
                    className="bg-lb-darker"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">Details</label>
                  <Textarea
                    id="content"
                    placeholder="Describe your feedback in detail"
                    value={newFeedback.content}
                    onChange={(e) => setNewFeedback({...newFeedback, content: e.target.value})}
                    className="h-32 bg-lb-darker"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateFormOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateFeedback}
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Feedback
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
      ) : feedbacks.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center h-40 space-y-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isMember 
                ? "You haven't submitted any feedback yet." 
                : "No feedback has been submitted yet."
              }
            </p>
            {isMember && (
              <Button 
                onClick={() => setCreateFormOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Submit Feedback
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {feedbacks.map((feedback) => (
              <AccordionItem key={feedback.id} value={feedback.id} className="glass-card mb-4 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4">
                  <AccordionTrigger className="flex-1 hover:no-underline">
                    <div className="flex-1 text-left flex flex-col">
                      <span className="font-medium">{feedback.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(feedback.createdAt), 'PPpp')}
                      </span>
                    </div>
                  </AccordionTrigger>
                  {(feedback.memberId === userProfile?.id || isAdmin) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingFeedback({
                          id: feedback.id,
                          title: feedback.title,
                          content: feedback.content,
                        })}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Feedback
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteFeedback(feedback.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Feedback
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <AccordionContent className="border-t border-white/5">
                  <div className="p-4">
                    <p className="whitespace-pre-wrap">{feedback.content}</p>
                  </div>
                  
                  {feedback.responses && feedback.responses.length > 0 && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <h4 className="font-medium px-4 mb-2">Responses</h4>
                      <div className="space-y-3">
                        {feedback.responses.map((response, idx) => (
                          <div key={idx} className="bg-lb-darker/60 p-4 mx-4 rounded-md relative group">
                            {editingResponse?.feedbackId === feedback.id && editingResponse?.index === idx ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingResponse.content}
                                  onChange={(e) => setEditingResponse({
                                    ...editingResponse,
                                    content: e.target.value
                                  })}
                                  className="bg-lb-darker"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingResponse(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleUpdateResponse}
                                    disabled={submitting}
                                  >
                                    {submitting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Save'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="whitespace-pre-wrap">{response.content}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {format(new Date(response.responseTime), 'PPpp')}
                                </p>
                                {(isAdmin || (isTrainer && response.responderId === userProfile?.id)) && (
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingResponse({
                                          feedbackId: feedback.id,
                                          index: idx,
                                          content: response.content
                                        })}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Response
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteResponse(feedback.id, idx)}
                                          className="text-red-500"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Response
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(isAdmin || isTrainer) && (
                    <div className="p-4 border-t border-white/5 mt-4">
                      <Dialog open={respondFormOpen && activeFeedback?.id === feedback.id} onOpenChange={(open) => {
                        setRespondFormOpen(open);
                        if (open) setActiveFeedback(feedback);
                        else setActiveFeedback(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full flex items-center gap-2"
                            onClick={() => setActiveFeedback(feedback)}
                          >
                            <Send className="h-4 w-4" />
                            Respond
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-lb-card border border-lb-accent/10">
                          <DialogHeader>
                            <DialogTitle>Respond to Feedback</DialogTitle>
                            <DialogDescription>
                              Provide your response to the member's feedback.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="bg-lb-darker p-3 rounded-md">
                              <h5 className="font-medium">{feedback.title}</h5>
                              <p className="text-sm mt-1">{feedback.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(feedback.createdAt), 'PPpp')}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="response" className="text-sm font-medium">Your Response</label>
                              <Textarea
                                id="response"
                                placeholder="Type your response here..."
                                value={responseContent}
                                onChange={(e) => setResponseContent(e.target.value)}
                                className="h-32 bg-lb-darker"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setRespondFormOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleRespondToFeedback}
                              disabled={submitting || !responseContent.trim()}
                              className="flex items-center gap-2"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4" />
                                  Submit Response
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Edit Feedback Dialog */}
      <Dialog open={!!editingFeedback} onOpenChange={(open) => !open && setEditingFeedback(null)}>
        <DialogContent className="bg-lb-card border border-lb-accent/10">
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
            <DialogDescription>
              Update your feedback details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
              <Input
                id="edit-title"
                placeholder="Feedback title"
                value={editingFeedback?.title || ''}
                onChange={(e) => setEditingFeedback(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="bg-lb-darker"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-content" className="text-sm font-medium">Details</label>
              <Textarea
                id="edit-content"
                placeholder="Describe your feedback in detail"
                value={editingFeedback?.content || ''}
                onChange={(e) => setEditingFeedback(prev => prev ? { ...prev, content: e.target.value } : null)}
                className="h-32 bg-lb-darker"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFeedback(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateFeedback}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Update Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedbacks;
