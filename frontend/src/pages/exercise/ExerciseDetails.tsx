import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Dumbbell, Loader2, Weight } from 'lucide-react';
import { exerciseTemplatesApi } from '@/services/api/exerciseTemplatesApi';
import { useToast } from '@/hooks/use-toast';

interface MuscleGroup {
  id: string;
  name: string;
}

interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  description: string;
  requiresWeight: boolean;
}

const ExerciseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [exercise, setExercise] = useState<ExerciseTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) {
        setError("Missing exercise ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await exerciseTemplatesApi.getById(id);
        
        if (!response || !response.data) {
          throw new Error("Failed to fetch exercise details");
        }
        
        setExercise(response.data);
      } catch (error) {
        console.error("Failed to fetch exercise details:", error);
        setError("Failed to load exercise details. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load exercise details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-lb-accent mb-4" />
        <p className="text-muted-foreground">Loading exercise details...</p>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-[400px] text-center flex flex-col items-center justify-center space-y-4">
        <div className="bg-lb-darker rounded-full p-4 inline-flex mb-2">
          <Dumbbell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">{error || "Exercise not found"}</h3>
        <p className="text-muted-foreground mb-4">
          {error 
            ? "An error occurred while loading the exercise. Please try again." 
            : "The exercise you're looking for doesn't exist or has been removed."}
        </p>
        <Link to="/dashboard/exercises">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercise Library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
        <Link to="/dashboard/exercises">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-grow min-w-0">
          <h1 className="text-2xl font-bold truncate">{exercise.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {exercise.muscleGroups.map((group, index) => (
              <Badge 
                key={group.id || index}
                variant="outline" 
                className={`${index === 0 ? 'bg-lb-accent/10' : 'bg-lb-accent/5'}`}
              >
                {group.name}
              </Badge>
            ))}
            {exercise.requiresWeight && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                <Weight className="h-3 w-3 mr-1" />
                Requires Weight
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Card className="glass-card">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Description</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-lb-text whitespace-pre-wrap">
              {exercise.description || "No description available."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExerciseDetails;