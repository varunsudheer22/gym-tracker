# Gym Tracker Requirements - Set-Based Workout System

## **Core Functionality**
1. **Workout Program Management**
   - Predefined workout days (Push A, Pull A, Legs A, etc.)
   - Ability to add custom exercises to any day
   - Exercise prescription format: "Exercise Name - SetsxReps, RIR"

2. **Set-Based Logging**
   - Track per-set metrics: Weight, Reps, RIR (Reps in Reserve)
   - Dynamic set addition/removal
   - Exercise notes field

3. **Progress Tracking**
   - Line charts for:
     - Max weight progression per exercise
     - Total volume (weight x reps) over time
   - Date-filtered workout history

4. **Data Visualization**
   - Recharts implementation with dual Y-axes
   - Responsive chart container
   - Recent entries display with set details

## **Tech Stack**
- **Frontend**: 
  - Next.js 14 (App Router)
  - React State Management: useState
  - UI: Shadcn/ui Cards + Lucide React Icons
  - Charts: Recharts
- **Data Structure**:
  ```typescript
  interface WorkoutEntry {
    id: number;
    day: string;
    exercise: string;
    date: string;
    sets: Array<{
      weight: string;
      reps: string;
      rir: string;
    }>;
    notes: string;
  }


---

### **Page Structure Analysis**  

#### **Current Component Structure**
```bash
/components
└── ui/                    # Shadcn components
     ├── card.tsx
     ├── card-header.tsx
     └── card-title.tsx

/pages
└── WorkoutTracker.tsx     # Monolithic component (needs refactoring)

/app
├── (dashboard)
│   └── page.tsx           # Main dashboard with workout programs
│
├── /log-workout
│   └── page.tsx           # Set-based logging interface
│
├── /progress
│   └── page.tsx           # Full-page progress charts
│
├── /components
│   ├── WorkoutProgramManager.tsx  # Day/exercise configuration
│   ├── SetLogger.tsx              # Set input controls
│   ├── ProgressChart.tsx          # Recharts implementation
│   └── RecentEntries.tsx          # Workout history list
│
├── /hooks
│   └── useWorkoutData.ts  # Custom hook for state management
│
└── /lib
    ├── workoutUtils.ts    # Calculation helpers
    └── types.ts           # TypeScript interfaces

    // Proposed useWorkoutData hook
const useWorkoutData = () => {
  const [workoutData, setWorkoutData] = useState<WorkoutEntry[]>([]);
  const [programs, setPrograms] = useState<WorkoutProgram>({});

  const addEntry = (entry: Omit<WorkoutEntry, 'id'>) => {
    setWorkoutData(prev => [...prev, { ...entry, id: Date.now() }]);
  };

  return { workoutData, programs, addEntry };
};

// SetLogger.tsx
const SetLogger = ({ sets, onUpdate, onAdd, onRemove }) => (
  <div className="space-y-2">
    {sets.map((set, index) => (
      <div key={index} className="flex gap-2 items-center">
        <input
          type="number"
          placeholder="Weight"
          className="w-24 p-2 border rounded"
          value={set.weight}
          onChange={(e) => onUpdate(index, 'weight', e.target.value)}
        />
        {/* ... other inputs ... */}
      </div>
    ))}
  </div>
);

// workoutUtils.ts
export const getExerciseHistory = (data: WorkoutEntry[], exercise: string) => {
  return data
    .filter(entry => entry.exercise === exercise)
    .map(entry => ({
      date: entry.date,
      maxWeight: Math.max(...entry.sets.map(set => parseFloat(set.weight) || 0)),
      totalVolume: entry.sets.reduce((acc, set) => 
        acc + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0)
    }));
};