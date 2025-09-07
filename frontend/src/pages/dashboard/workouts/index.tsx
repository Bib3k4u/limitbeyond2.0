import { Routes, Route } from 'react-router-dom';
import WorkoutList from './WorkoutList';
import WorkoutForm from './WorkoutForm';
import WorkoutDetail from './WorkoutDetail';
import WorkoutTemplates from './WorkoutTemplates';

const Workouts = () => {
  return (
    <Routes>
      <Route index element={<WorkoutList />} />
      <Route path="new" element={<WorkoutForm />} />
      <Route path="templates" element={<WorkoutTemplates />} />
      <Route path=":id" element={<WorkoutDetail />} />
      <Route path=":id/edit" element={<WorkoutForm />} />
      <Route path="edit/:id" element={<WorkoutForm />} />
    </Routes>
  );
};

export default Workouts; 