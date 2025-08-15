import { Routes, Route } from 'react-router-dom';
import ExerciseList from '@/pages/exercise/ExerciseList';
import ExerciseDetails from '@/pages/exercise/ExerciseDetails';

const Exercises = () => {
  return (
    <Routes>
      <Route index element={<ExerciseList />} />
      <Route path=":id" element={<ExerciseDetails />} />
    </Routes>
  );
};

export default Exercises;
