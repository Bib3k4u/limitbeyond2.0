import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { exerciseTemplatesApi } from "@/services/api/exerciseTemplatesApi";
import { muscleGroupsApi } from "@/services/api/muscleGroupsApi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/dialog';
import userService from '@/services/api/userService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const ExerciseList = () => {
  const { toast } = useToast();
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseTemplate[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isAdminOrTrainer, setIsAdminOrTrainer] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();
  
  // Fetch muscle groups
  useEffect(() => {
  const fetchMuscleGroups = async () => {
      try {
    const response = await muscleGroupsApi.getAll();
    if (response?.data) setMuscleGroups(response.data);
    else throw new Error("No muscle groups data received");
      } catch (error) {
        console.error("Failed to fetch muscle groups:", error);
        toast({
          title: "Error",
          description: "Failed to load muscle groups. Please try again.",
          variant: "destructive",
        });
        setError("Failed to load muscle groups. Please try again later.");
      }
    };
    
    fetchMuscleGroups();
  }, [toast]);

  // Check user role
  useEffect(() => {
    const check = async () => {
      try {
        const profile = await userService.getCurrentUserProfile();
        if (profile && (profile.roles?.includes('ADMIN') || profile.roles?.includes('TRAINER'))) {
          setIsAdminOrTrainer(true);
        }
      } catch (e) {
        // ignore
      }
    };
    check();
  }, []);
  
  // Fetch exercises
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      try {
  // Fetch exercises (cached by exerciseTemplatesApi)
        let response;
        if (selectedMuscleGroup && selectedMuscleGroup !== "all") {
          response = await exerciseTemplatesApi.getByMuscleGroup(selectedMuscleGroup);
        } else {
          response = await exerciseTemplatesApi.getAll();
        }
        
        if (response?.data) {
          const validExercises = response.data.map((exercise: any) => ({
            ...exercise,
            name: exercise.name || 'Unnamed Exercise',
            description: exercise.description || 'No description available',
            muscleGroups: exercise.muscleGroups || []
          }));
          setExercises(validExercises);
          setFilteredExercises(validExercises);
        } else {
          console.error("No data property in API response:", response);
          throw new Error("No exercises data received");
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        toast({
          title: "Error",
          description: "Failed to load exercises. Please try again.",
          variant: "destructive",
        });
        setError("Failed to load exercises. Please try again later.");
        setExercises([]);
        setFilteredExercises([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, [selectedMuscleGroup, toast]);
  
  // Filter exercises based on search term
  useEffect(() => {
    if (!exercises.length) {
      console.log("No exercises to filter");
      return;
    }
    
    console.log("Filtering exercises with search term:", searchTerm);
    const filtered = exercises.filter(exercise => {
      if (!searchTerm) return true;
      if (!exercise) return false;
      
      const lowerSearchTerm = searchTerm.toLowerCase();
      const nameMatch = exercise.name?.toLowerCase().includes(lowerSearchTerm) || false;
      const descriptionMatch = exercise.description?.toLowerCase().includes(lowerSearchTerm) || false;
      const muscleGroupMatch = exercise.muscleGroups?.some(group => 
        group.name.toLowerCase().includes(lowerSearchTerm)
      ) || false;
      
      return nameMatch || descriptionMatch || muscleGroupMatch;
    });
    
    console.log("Filtered exercises:", filtered);
    setFilteredExercises(filtered);
  }, [searchTerm, exercises]);
  
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
          <p className="text-muted-foreground">Browse and search available exercises</p>
        </div>
        {isAdminOrTrainer && (
          <div className="flex gap-2">
            <Button onClick={() => setShowBulkModal(true)} variant="outline">Bulk Upload</Button>
            <Button onClick={() => setShowCreateModal(true)}>Add Exercise</Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-lb-darker w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
            <SelectTrigger className="w-full sm:w-[180px] bg-lb-darker">
              <SelectValue placeholder="Filter by muscle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Muscle Groups</SelectItem>
              {muscleGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-lb-accent" />
        </div>
      ) : filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            if (!exercise || typeof exercise !== 'object') {
              console.warn("Skipping invalid exercise:", exercise);
              return null;
            }
            
            const {
              id = '',
              name = 'Unnamed Exercise',
              description = 'No description available',
              muscleGroups = []
            } = exercise;
            
            if (!id) {
              console.warn("Skipping exercise without ID:", exercise);
              return null;
            }
            
            return (
              <Link to={`/dashboard/exercises/${id}`} key={id}>
                <Card className="glass-card p-4 hover:translate-y-[-2px] transition-all cursor-pointer">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {muscleGroups.map((group, index) => (
                          <Badge 
                            key={group.id || index}
                            variant="outline" 
                            className={`${index === 0 ? 'bg-lb-accent/10' : 'bg-lb-accent/5'}`}
                          >
                            {group.name}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-6">
          <div className="bg-lb-darker rounded-full p-4 inline-flex mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No exercises found</h3>
          <p className="text-muted-foreground">
            {exercises.length === 0
              ? "No exercises available."
              : searchTerm
              ? "Try a different search term"
              : "Try selecting a different muscle group"}
          </p>
        </div>
      )}

      {/* Create Exercise Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-lb-card p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create Exercise</h3>
            <form onSubmit={handleSubmit(async (vals) => {
              try {
                setLoading(true);
                await exerciseTemplatesApi.create(vals);
                toast({ title: 'Created', description: 'Exercise created successfully' });
                setShowCreateModal(false);
                reset();
                // Refresh list
                const resp = await exerciseTemplatesApi.getAll();
                if (resp?.data) { setExercises(resp.data); setFilteredExercises(resp.data); }
              } catch (e) {
                console.error('Create failed', e);
                toast({ title: 'Error', description: 'Failed to create exercise', variant: 'destructive' });
              } finally { setLoading(false); }
            })}>
              <div className="space-y-2">
                <Input placeholder="Name" {...register('name', { required: true })} />
                <div>
                  <Select onValueChange={(v) => { setValue('primaryMuscleGroupId', v); }}>
                    <SelectTrigger className="w-full bg-lb-darker">
                      <SelectValue placeholder="Select primary muscle" />
                    </SelectTrigger>
                    <SelectContent>
                      {muscleGroups.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select onValueChange={(v) => { setValue('secondaryMuscleGroupId', v === '__none' ? '' : v); }}>
                    <SelectTrigger className="w-full bg-lb-darker">
                      <SelectValue placeholder="Select secondary muscle (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">None</SelectItem>
                      {muscleGroups.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Description" {...register('description')} />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="requiresWeight" {...register('requiresWeight')} />
                  <label htmlFor="requiresWeight" className="text-sm">Requires Weight</label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-lb-card p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Bulk Upload Exercises (JSON array)</h3>
            <p className="text-sm text-gray-400 mb-2">Provide a JSON array of ExerciseTemplateRequest objects. Example: {`[{"name":"Bench","primaryMuscleGroupId":"<id>","description":"...","requiresWeight":true}]`}</p>
            <textarea id="bulk" className="w-full h-48 mb-4 bg-lb-darker p-2 text-white" />
            <div className="flex gap-2">
              <Button onClick={async () => {
                try {
                  const raw = (document.getElementById('bulk') as HTMLTextAreaElement).value;
                  const parsed = JSON.parse(raw);
                  setLoading(true);
                  await exerciseTemplatesApi.bulkCreate(parsed);
                  toast({ title: 'Bulk upload', description: 'Exercises uploaded' });
                  setShowBulkModal(false);
                  const resp = await exerciseTemplatesApi.getAll();
                  if (resp?.data) { setExercises(resp.data); setFilteredExercises(resp.data); }
                } catch (e) {
                  console.error('Bulk upload failed', e);
                  toast({ title: 'Error', description: 'Bulk upload failed', variant: 'destructive' });
                } finally { setLoading(false); }
              }}>Upload</Button>
              <Button variant="outline" onClick={() => setShowBulkModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;