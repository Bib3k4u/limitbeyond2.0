
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HelpCircle, Search } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "How do I update my personal information?",
    answer: "To update your personal information, go to Dashboard > Account Settings. There you can edit your name, email, phone number, and other details."
  },
  {
    question: "How do I submit feedback?",
    answer: "To submit feedback, navigate to the Feedback section in the sidebar. Click on the 'Create New Feedback' button, fill in the details, and submit the form."
  },
  {
    question: "How do I start a diet consultation?",
    answer: "To initiate a diet consultation, go to the Diet Chat section. Click on 'New Diet Chat', provide a title and your initial query, and submit the form. A trainer will respond to your query."
  },
  {
    question: "How do I view my assigned trainer?",
    answer: "Your assigned trainer information is visible on your Dashboard overview and also in your Account Settings page."
  },
  {
    question: "What if I need to change my password?",
    answer: "You can change your password in the Account Settings section. Click on the 'Change Password' button and follow the instructions."
  }
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">Find answers to common questions and get support.</p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-10 bg-lb-darker"
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions about using LimitBeyond.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                )) : (
                  <p className="text-center py-4 text-muted-foreground">No results found for "{searchQuery}"</p>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Need More Help?
              </CardTitle>
              <CardDescription>Contact our support team for assistance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                If you couldn't find the answers you're looking for, our support team is here to help.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <Button>Contact Support</Button>
                <Button variant="outline">Submit a Ticket</Button>
              </div>
              
              <div className="pt-4 border-t border-lb-accent/10 mt-4">
                <p className="text-sm text-muted-foreground">
                  Support Hours: <br />
                  Monday - Friday: 9AM - 5PM <br />
                  Response Time: Within 24 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
