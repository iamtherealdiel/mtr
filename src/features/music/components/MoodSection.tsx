import React from 'react';
import MoodCard from './MoodCard';

interface MoodSectionProps {
  onMoodSelect: (mood: string) => void;
}

interface Mood {
  id: string;
  name: string;
  image: string;
  backgroundColor: string;
}

const moods: Mood[] = [
  {
    id: 'happy',
    name: 'Happy',
    image: 'https://images.pexels.com/photos/1578248/pexels-photo-1578248.jpeg',
    backgroundColor: '#86efac',
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    image: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg',
    backgroundColor: '#f9a8d4',
  },
  {
    id: 'epic',
    name: 'Epic',
    image: 'https://images.pexels.com/photos/2519374/pexels-photo-2519374.jpeg',
    backgroundColor: '#fdba74',
  },
  {
    id: 'laid-back',
    name: 'Laid Back',
    image: 'https://images.pexels.com/photos/3757144/pexels-photo-3757144.jpeg',
    backgroundColor: '#fde047',
  },
  {
    id: 'euphoric',
    name: 'Euphoric',
    image: 'https://images.pexels.com/photos/3844788/pexels-photo-3844788.jpeg',
    backgroundColor: '#f472b6',
  },
  {
    id: 'quirky',
    name: 'Quirky',
    image: 'https://images.pexels.com/photos/2103864/pexels-photo-2103864.jpeg',
    backgroundColor: '#fb923c',
  },
];

const MoodSection: React.FC<MoodSectionProps> = ({ onMoodSelect }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Moods</h2>
        <button className="text-gray-400 hover:text-white transition-colors">
          View all moods
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {moods.map((mood) => (
          <MoodCard key={mood.id} mood={mood} onClick={() => onMoodSelect(mood.id)} />
        ))}
      </div>
    </div>
  );
};

export default MoodSection;