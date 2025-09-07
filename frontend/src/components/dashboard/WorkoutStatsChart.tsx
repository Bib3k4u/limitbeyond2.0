import { useEffect, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { Card } from '@/components/ui/card';
import { workoutApi } from '@/services/api/workoutApi';
import { exerciseTemplatesApi } from '@/services/api/exerciseTemplatesApi';
import { axiosInstance } from '@/services/api/axiosInstance';
import { WorkoutStats } from '@/types/workout';
import { Line } from 'react-chartjs-2';
import Select from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function WorkoutStatsChart() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [muscleGroups, setMuscleGroups] = useState<any[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  useEffect(() => {
    const fetchMuscleGroups = async () => {
      try {
        const resp = await axiosInstance.get('/muscle-groups');
        setMuscleGroups(resp.data || []);
      } catch (e) {
        console.debug('No /muscle-groups endpoint; will use derived muscle groups from stats');
        setMuscleGroups([]);
      }
    };
    fetchMuscleGroups();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = subMonths(endDate, 1);
        let response;
        if (selectedExercise) {
          response = await workoutApi.getByDateRange(startDate.toISOString(), endDate.toISOString());
        } else if (selectedMuscleGroup) {
          response = await workoutApi.getByMuscleGroup(selectedMuscleGroup);
        } else {
          response = await workoutApi.getByDateRange(startDate.toISOString(), endDate.toISOString());
        }
        const workouts = response?.data || [];
        let processedWorkouts = workouts;
        if (selectedExercise) {
          processedWorkouts = workouts.map((w: any) => {
            return {
              ...w,
              sets: (w.sets || []).filter((s: any) => s.exercise && s.exercise.id === selectedExercise)
            };
          }).filter((w: any) => (w.sets || []).length > 0);
        }
        const stats: WorkoutStats = processWorkoutData(processedWorkouts);
        setStats(stats);
        if ((!muscleGroups || muscleGroups.length === 0) && stats.muscleGroupDistribution) {
          const derived = stats.muscleGroupDistribution.map(m => ({ id: m.muscleGroup, name: m.muscleGroup }));
          setMuscleGroups(derived);
        }
        if (selectedMuscleGroup) {
          try {
            const etResp = await exerciseTemplatesApi.getByMuscleGroup(selectedMuscleGroup);
            setExercises(etResp.data || []);
          } catch (e) {
            console.error('Failed to fetch exercises for muscle group', e);
            setExercises([]);
          }
        } else {
          setExercises([]);
        }
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedMuscleGroup, selectedExercise]);

  if (loading || !stats) {
    return (
      <Card className="p-4">
        <div className="h-[350px] flex items-center justify-center">
          Loading stats...
        </div>
      </Card>
    );
  }

  const chartData: ChartData<'line'> = {
    labels: stats.workoutsByDate.map(d => format(new Date(d.date), 'MMM d')),
    datasets: [
      {
        label: 'Volume (kg)',
        data: stats.workoutsByDate.map(d => d.volume),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Workouts',
        data: stats.workoutsByDate.map(d => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Workout Volume & Frequency',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const muscleGroupOptions = [
    { value: '', label: 'All' },
    ...muscleGroups.map(mg => ({ value: mg.id, label: mg.name }))
  ];

  const exerciseOptions = [
    { value: '', label: 'All' },
    ...exercises.map(ex => ({ value: ex.id, label: ex.name }))
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-48">
          <label className="text-sm font-medium">Muscle Group</label>
          <Select
            className="mt-1 text-black"
            classNamePrefix="select"
            options={muscleGroupOptions}
            value={muscleGroupOptions.find(opt => opt.value === selectedMuscleGroup)}
            onChange={(selectedOption) => {
              setSelectedMuscleGroup(selectedOption?.value || null);
              setSelectedExercise(null);
            }}
            styles={{
              option: (provided, state) => ({
                ...provided,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                color: 'white',
                ':hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                },
              }),
              control: (provided) => ({
                ...provided,
                backgroundColor: 'transparent',
                borderColor: '#ccc',
                color: 'white',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: 'white',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }),
            }}
          />
        </div>
        <div className="w-48">
          <label className="text-sm font-medium">Exercise</label>
          <Select
            className="mt-1 text-black"
            classNamePrefix="select"
            options={exerciseOptions}
            value={exerciseOptions.find(opt => opt.value === selectedExercise)}
            onChange={(selectedOption) => {
              setSelectedExercise(selectedOption?.value || null);
            }}
            isDisabled={exercises.length === 0}
            styles={{
              option: (provided, state) => ({
                ...provided,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                color: 'white',
                ':hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                },
              }),
              control: (provided) => ({
                ...provided,
                backgroundColor: 'transparent',
                borderColor: '#ccc',
                color: 'white',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: 'white',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }),
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{stats.totalWorkouts}</h3>
          <p className="text-sm text-muted-foreground">Total Workouts</p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{stats.completedWorkouts}</h3>
          <p className="text-sm text-muted-foreground">Completed Workouts</p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{Math.round(stats.totalVolume).toLocaleString()} kg</h3>
          <p className="text-sm text-muted-foreground">Total Volume</p>
        </div>
      </div>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-2">Most Trained Muscle Groups</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stats.muscleGroupDistribution
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map((item) => (
              <div
                key={item.muscleGroup}
                className="bg-lb-darker rounded-lg p-2 text-center"
              >
                <div className="text-sm font-medium">{item.muscleGroup}</div>
                <div className="text-xs text-muted-foreground">
                  {item.count} exercises
                </div>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}

function processWorkoutData(workouts: any[]): WorkoutStats {
  const stats: WorkoutStats = {
    totalWorkouts: workouts.length,
    completedWorkouts: workouts.filter(w => w.completed).length,
    totalVolume: 0,
    muscleGroupDistribution: [],
    workoutsByDate: [],
  };
  const muscleGroupCounts = new Map<string, number>();
  const dailyStats = new Map<string, { volume: number; count: number }>();
  workouts.forEach(workout => {
    const date = format(new Date(workout.scheduledDate || workout.completedDate), 'yyyy-MM-dd');
    let dailyVolume = 0;
    workout.sets.forEach(set => {
      if (set.completed && set.weight && set.reps) {
        const setVolume = set.weight * set.reps;
        dailyVolume += setVolume;
        stats.totalVolume += setVolume;
      }
      set.exercise.muscleGroups.forEach(group => {
        const count = muscleGroupCounts.get(group.name) || 0;
        muscleGroupCounts.set(group.name, count + 1);
      });
    });
    const existing = dailyStats.get(date) || { volume: 0, count: 0 };
    dailyStats.set(date, {
      volume: existing.volume + dailyVolume,
      count: existing.count + 1,
    });
  });
  stats.muscleGroupDistribution = Array.from(muscleGroupCounts.entries())
    .map(([muscleGroup, count]) => ({ muscleGroup, count }));
  stats.workoutsByDate = Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      date,
      volume: stats.volume,
      count: stats.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return stats;
}
