import { useEffect, useState } from 'react';
import { Bell, Check, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { notificationApi } from '@/services/api/notification';
import type { WorkoutSuggestion } from '@/services/api/notification';
import { format } from 'date-fns';

export function WorkoutNotifications() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    try {
      const response = await notificationApi.getWorkoutSuggestions();
      if (response?.data) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('Error fetching workout suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workout suggestions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = async (id: string) => {
    try {
      await notificationApi.markSuggestionAsSeen(id);
      setSuggestions(suggestions.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error marking suggestion as seen:', error);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-lb-accent" />
          <div className="h-4 w-32 bg-lb-darker animate-pulse rounded"></div>
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-lb-accent" />
        <h3 className="font-semibold">Workout Suggestions</h3>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="p-3 bg-lb-darker border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-white">{suggestion.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(suggestion.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-400 hover:text-green-500 hover:bg-green-500/10"
                  onClick={() => markAsSeen(suggestion.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-lb-accent hover:text-lb-accent hover:bg-lb-accent/10"
                  onClick={() => {
                    if (suggestion.data.workoutId) {
                      window.location.href = `/dashboard/workouts/${suggestion.data.workoutId}`;
                    }
                  }}
                  disabled={!suggestion.data.workoutId}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}