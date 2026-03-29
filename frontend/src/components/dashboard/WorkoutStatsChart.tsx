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
  Filler,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Shared dark react-select styles
const darkSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.12)',
    boxShadow: 'none',
    color: 'white',
    '&:hover': { borderColor: 'rgba(249,115,22,0.6)' },
  }),
  singleValue: (base: any) => ({ ...base, color: 'white' }),
  placeholder: (base: any) => ({ ...base, color: 'rgba(255,255,255,0.35)' }),
  input: (base: any) => ({ ...base, color: 'white' }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    zIndex: 50,
  }),
  menuList: (base: any) => ({ ...base, padding: 4 }),
  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isSelected
      ? 'rgba(249,115,22,0.3)'
      : isFocused
      ? 'rgba(249,115,22,0.15)'
      : 'transparent',
    color: 'white',
    cursor: 'pointer',
    borderRadius: 4,
    marginBottom: 1,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: any) => ({ ...base, color: 'rgba(255,255,255,0.4)' }),
};

export function WorkoutStatsChart() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [muscleGroups, setMuscleGroups] = useState<any[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Fetch muscle groups once
  useEffect(() => {
    axiosInstance.get('/muscle-groups')
      .then(resp => setMuscleGroups(resp.data || []))
      .catch(() => setMuscleGroups([]));
  }, []);

  // Fetch exercises whenever muscle group changes — filter all exercises client-side
  useEffect(() => {
    if (!selectedMuscleGroup) {
      setExercises([]);
      setSelectedExercise(null);
      return;
    }
    setExercisesLoading(true);
    // Find the muscle group name for the selected ID (to match by name too)
    const mgName = muscleGroups.find(mg => mg.id === selectedMuscleGroup)?.name || selectedMuscleGroup;
    exerciseTemplatesApi.getAll()
      .then((resp: any) => {
        const all: any[] = resp.data || [];
        const filtered = all.filter(ex =>
          (ex.muscleGroups || []).some(
            (mg: any) => mg.id === selectedMuscleGroup || mg.name === mgName
          )
        );
        setExercises(filtered);
      })
      .catch(() => setExercises([]))
      .finally(() => setExercisesLoading(false));
  }, [selectedMuscleGroup, muscleGroups]);

  // Fetch stats — always load all workouts and filter client-side for reliability
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await workoutApi.getAll();
        let workouts: any[] = response?.data || [];

        // Filter by muscle group client-side
        if (selectedMuscleGroup) {
          workouts = workouts.filter((w: any) =>
            (w.sets || []).some((s: any) =>
              (s.exercise?.muscleGroups || []).some(
                (mg: any) => mg.id === selectedMuscleGroup || mg.name === selectedMuscleGroup
              )
            )
          );
        }

        // Filter by exercise client-side
        if (selectedExercise) {
          workouts = workouts
            .map((w: any) => ({
              ...w,
              sets: (w.sets || []).filter((s: any) => s.exercise?.id === selectedExercise),
            }))
            .filter((w: any) => (w.sets || []).length > 0);
        }

        const computed = processWorkoutData(workouts);
        setStats(computed);

        // Derive muscle groups from workout data if /muscle-groups didn't load
        if (muscleGroups.length === 0 && computed.muscleGroupDistribution?.length) {
          setMuscleGroups(computed.muscleGroupDistribution.map(m => ({ id: m.muscleGroup, name: m.muscleGroup })));
        }
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedMuscleGroup, selectedExercise]);

  const muscleGroupOptions = [
    { value: '', label: 'All' },
    ...muscleGroups.map(mg => ({ value: mg.id, label: mg.name })),
  ];

  const exerciseOptions = [
    { value: '', label: 'All' },
    ...exercises.map(ex => ({ value: ex.id, label: ex.name })),
  ];

  const chartData: ChartData<'line'> = {
    labels: stats?.workoutsByDate.map(d => format(new Date(d.date), 'MMM d')) ?? [],
    datasets: [
      {
        label: 'Volume (kg)',
        data: stats?.workoutsByDate.map(d => d.volume) ?? [],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        pointBackgroundColor: 'rgb(249, 115, 22)',
        pointBorderColor: 'rgba(249, 115, 22, 0.8)',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
      {
        label: 'Workouts',
        data: stats?.workoutsByDate.map(d => d.count) ?? [],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.08)',
        pointBackgroundColor: 'rgb(251, 191, 36)',
        pointBorderColor: 'rgba(251, 191, 36, 0.8)',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,15,25,0.92)',
        borderColor: 'rgba(249,115,22,0.3)',
        borderWidth: 1,
        titleColor: 'white',
        bodyColor: 'rgba(255,255,255,0.7)',
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  return (
    <Card className="p-4 sm:p-6 glass-card">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div className="w-44">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Muscle Group</label>
          <Select
            options={muscleGroupOptions}
            value={muscleGroupOptions.find(opt => opt.value === (selectedMuscleGroup ?? '')) ?? muscleGroupOptions[0]}
            onChange={opt => {
              setSelectedMuscleGroup(opt?.value || null);
              setSelectedExercise(null);
            }}
            styles={darkSelectStyles}
          />
        </div>
        <div className="w-44">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Exercise</label>
          <Select
            options={exerciseOptions}
            value={exerciseOptions.find(opt => opt.value === (selectedExercise ?? '')) ?? exerciseOptions[0]}
            onChange={opt => setSelectedExercise(opt?.value || null)}
            isDisabled={!selectedMuscleGroup || exercisesLoading}
            isLoading={exercisesLoading}
            placeholder={!selectedMuscleGroup ? 'Select group first' : 'All'}
            styles={darkSelectStyles}
          />
        </div>
      </div>

      {/* Summary stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Workouts', value: stats.totalWorkouts },
            { label: 'Completed', value: stats.completedWorkouts },
            { label: 'Total Volume', value: `${Math.round(stats.totalVolume).toLocaleString()} kg` },
          ].map(item => (
            <div key={item.label} className="text-center bg-lb-darker/60 rounded-lg py-3 px-2">
              <p className="text-lg font-bold text-white">{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Custom legend */}
      <div className="flex items-center gap-6 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-7 h-[3px] rounded-full bg-orange-500" />
          <span className="text-xs text-gray-400">Volume (kg)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-7 h-[3px] rounded-full bg-amber-400" />
          <span className="text-xs text-gray-400">Workouts</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">Loading...</div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>

      {/* Muscle group distribution */}
      {stats && stats.muscleGroupDistribution.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Most Trained</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stats.muscleGroupDistribution
              .sort((a, b) => b.count - a.count)
              .slice(0, 4)
              .map(item => (
                <div key={item.muscleGroup} className="bg-lb-darker/60 rounded-lg p-2 text-center border border-white/5">
                  <div className="text-sm font-medium text-white">{item.muscleGroup}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.count} exercises</div>
                </div>
              ))}
          </div>
        </div>
      )}
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
    const date = format(new Date(workout.scheduledDate || workout.completedDate || Date.now()), 'yyyy-MM-dd');
    let dailyVolume = 0;
    (workout.sets || []).forEach((set: any) => {
      if (set.weight && set.reps) {
        const setVolume = set.weight * set.reps;
        dailyVolume += setVolume;
        stats.totalVolume += setVolume;
      }
      (set.exercise?.muscleGroups || []).forEach((group: any) => {
        muscleGroupCounts.set(group.name, (muscleGroupCounts.get(group.name) || 0) + 1);
      });
    });
    const existing = dailyStats.get(date) || { volume: 0, count: 0 };
    dailyStats.set(date, { volume: existing.volume + dailyVolume, count: existing.count + 1 });
  });

  stats.muscleGroupDistribution = Array.from(muscleGroupCounts.entries())
    .map(([muscleGroup, count]) => ({ muscleGroup, count }));
  stats.workoutsByDate = Array.from(dailyStats.entries())
    .map(([date, s]) => ({ date, volume: s.volume, count: s.count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return stats;
}
