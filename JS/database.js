// Define positions for each person
const positions = {
  'Keith': '教練',
  'Hugo': '教練',
  'Ivy': '教練',
  'Jeffrey': '教練',
  'Ronald': '教練',
  'Christy': '助教',
  'Vincy': '助教',
  'Chiron': '助教',
  'Alvin': '助教',
  'Anvin': '助教'
};

// Function to save availability
const saveAvailability = (name, month, timeSlots) => {
  const key = `availability_${name}_${month}`;
  localStorage.setItem(key, JSON.stringify(timeSlots)); //eg Storage {availability_Keith_08: '["2024-08-09 19:00-20:00", length: 1}
};

//Function to save exam
const saveExam = (date, type) => {
  const key = `exam_${date}`;
  //if that day key contain exam eg exam_2024-08-09_BM, return error
  localStorage.setItem(key, JSON.stringify(type));
  console.log('exam saved', key);
};

const deleteExam = (date) => {
  const key = `exam_${date}`;
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log('exam deleted', key);
  } else {
    console.log('exam not found', key);
  }
};

// Function to get availability
const getAvailability = (name, month) => {
  const key = `availability_${name}_${month}`;
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : [];
};


const getAllexam = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('exam_')) {
            try {
                data[key] = JSON.parse(localStorage.getItem(key));
            } catch (error) {
                console.error(`Error parsing JSON for key ${key}:`, error);
            }
        }
    }
    return data;
};

// Function to get all saved data
const getAllSavedData = () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('availability_')) {
      const [_, name, month] = key.split('_');
      if (!data[name]) data[name] = {};
      data[name][month] = JSON.parse(localStorage.getItem(key));
    }
  }
  return data;
}; 

// Function to get position of a person
const getPosition = (name) => {
  return positions[name] || '助教'; // Default to '助教' if not specified
};