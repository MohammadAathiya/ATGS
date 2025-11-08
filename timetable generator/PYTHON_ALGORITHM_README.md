# Python Timetable Generation Algorithm

## Overview

This is a standalone Python implementation of an advanced automated timetable generation algorithm using **Constraint Satisfaction Problem (CSP)** with **Backtracking** and **Heuristics**.

## Features

### ✅ Algorithm Features
- **Constraint Satisfaction Problem (CSP)** approach
- **Backtracking** for optimal solutions
- **Heuristic optimization** for better scheduling
- **Conflict detection** (faculty, classroom, section)
- **Load balancing** across days
- **Flexible time slots** (Monday-Friday, 9 AM - 5 PM)
- **JSON export** for integration with frontend

### ✅ Constraints Handled
1. **Faculty Constraints**: No faculty double-booking
2. **Classroom Constraints**: No room conflicts
3. **Section Constraints**: No overlapping classes for same section
4. **Time Constraints**: Weekdays only, business hours
5. **Hours Distribution**: Respects hours per week for each course

### ✅ Heuristics Used
1. **Most Constrained First**: Courses with more hours scheduled first
2. **Day Distribution**: Spreads classes evenly across the week
3. **Morning Preference**: Prefers earlier time slots
4. **Conflict Minimization**: Avoids back-to-back scheduling when possible

## Installation

### Requirements
- Python 3.7 or higher
- No external dependencies (uses only standard library)

### Setup
```bash
# No installation needed! Just run the script
python timetable_algorithm.py
```

## Usage

### Method 1: Run with Sample Data
```bash
python timetable_algorithm.py
```

This will:
- Generate a timetable with sample data
- Print the timetable to console
- Export to `generated_timetable.json`
- Show statistics and conflicts

### Method 2: Use as a Module

```python
from timetable_algorithm import TimetableGenerator

# Create generator instance
generator = TimetableGenerator()

# Load your CSV data
courses_data = [
    {
        'courseCode': 'CS101',
        'courseName': 'Data Structures',
        'facultyName': 'Dr. Smith',
        'section': 'A',
        'hoursPerWeek': 3
    },
    # ... more courses
]

faculty_data = [
    {
        'name': 'Dr. Smith',
        'department': 'Computer Science'
    },
    # ... more faculty
]

classrooms_data = [
    {
        'roomNumber': 'Room 101',
        'capacity': 50
    },
    # ... more classrooms
]

# Load data
generator.load_from_csv_data(courses_data, faculty_data, classrooms_data)

# Generate timetable
result = generator.generate()

# Access results
schedule = result['schedule']  # List of scheduled classes
conflicts = result['conflicts']  # List of conflicts
success = result['success']  # True if no conflicts
statistics = result['statistics']  # Usage statistics

# Print timetable
generator.print_timetable()

# Export to JSON
generator.export_to_json('my_timetable.json')
```

### Method 3: Load from CSV Files

```python
import csv
from timetable_algorithm import TimetableGenerator

def load_csv(filename):
    with open(filename, 'r') as f:
        return list(csv.DictReader(f))

# Load CSV files
courses = load_csv('courses.csv')
faculty = load_csv('faculty.csv')
classrooms = load_csv('classrooms.csv')

# Generate timetable
generator = TimetableGenerator()
generator.load_from_csv_data(courses, faculty, classrooms)
result = generator.generate()

# Export
generator.export_to_json('output.json')
```

## Input Data Format

### Courses Data
```python
{
    'courseCode': 'CS101',        # Required: Course code
    'courseName': 'Data Structures',  # Required: Course name
    'facultyName': 'Dr. Smith',   # Required: Faculty teaching
    'section': 'A',               # Required: Section
    'hoursPerWeek': 3,            # Required: Hours per week
    'department': 'CS'            # Optional: Department
}
```

### Faculty Data
```python
{
    'name': 'Dr. Smith',          # Required: Faculty name
    'department': 'CS',           # Optional: Department
    'email': 'smith@edu.com'      # Optional: Email
}
```

### Classrooms Data
```python
{
    'roomNumber': 'Room 101',     # Required: Room number
    'capacity': 50,               # Optional: Capacity
    'building': 'Block A'         # Optional: Building
}
```

## Output Format

### JSON Output Structure
```json
{
  "schedule": [
    {
      "id": "CS101-A-Monday-09:00",
      "title": "CS101 - Data Structures",
      "courseCode": "CS101",
      "courseName": "Data Structures",
      "faculty": "Dr. Smith",
      "section": "A",
      "classroom": "Room 101",
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "department": "Computer Science",
      "backgroundColor": "#667eea"
    }
  ],
  "conflicts": [],
  "success": true,
  "statistics": {
    "total_classes": 17,
    "unique_faculty": 5,
    "unique_classrooms": 4,
    "classes_per_day": {
      "Monday": 4,
      "Tuesday": 3,
      "Wednesday": 4,
      "Thursday": 3,
      "Friday": 3
    }
  }
}
```

## Algorithm Details

### 1. Constraint Satisfaction Problem (CSP)
The algorithm treats timetable generation as a CSP where:
- **Variables**: Each course-hour combination
- **Domain**: Available time slots
- **Constraints**: Faculty, classroom, section availability

### 2. Backtracking Search
- Tries to assign time slots to courses
- Backtracks when constraints are violated
- Uses heuristics to guide search

### 3. Optimization Heuristics

#### Most Constrained First
```python
sorted_courses = sorted(courses, 
                       key=lambda c: c.hours_per_week, 
                       reverse=True)
```

#### Day Distribution
```python
# Prefer days with fewer classes
available_slots.sort(key=lambda s: (day_counts[s.day], s.start_time))
```

#### Conflict Avoidance
- Checks faculty schedule before assignment
- Checks classroom availability
- Checks section conflicts

### 4. Time Complexity
- **Worst Case**: O(d^n) where d = domain size, n = number of variables
- **Average Case**: Much better due to heuristics and pruning
- **Typical Runtime**: < 1 second for 50-100 courses

## Integration with React Frontend

The JSON output is compatible with the React frontend:

```javascript
// In React app
const response = await fetch('generated_timetable.json')
const data = await response.json()

// Use in FullCalendar
const events = data.schedule.map(entry => ({
  id: entry.id,
  title: entry.title,
  start: new Date(`2024-01-01 ${entry.startTime}`),
  end: new Date(`2024-01-01 ${entry.endTime}`),
  extendedProps: {
    faculty: entry.faculty,
    room: entry.classroom,
    section: entry.section
  }
}))
```

## Advanced Usage

### Custom Time Slots
```python
generator = TimetableGenerator()
# Modify time slots
generator.time_slots = [
    TimeSlot('Monday', '08:00', '09:00'),
    TimeSlot('Monday', '09:00', '10:00'),
    # ... custom slots
]
```

### Custom Constraints
```python
# Add maximum hours per day for faculty
for faculty in generator.faculty_list:
    faculty.max_hours_per_day = 4
```

### Conflict Resolution
```python
result = generator.generate()

if not result['success']:
    print("Conflicts found:")
    for conflict in result['conflicts']:
        print(f"  - {conflict['course']}: {conflict['reason']}")
```

## Performance Tips

1. **Limit Time Slots**: Fewer slots = faster generation
2. **Adequate Resources**: Ensure enough classrooms and faculty
3. **Reasonable Hours**: Keep hours per week realistic (3-5)
4. **Section Grouping**: Group courses by section for better optimization

## Troubleshooting

### Issue: "Could not find sufficient available slots"
**Solution**: 
- Add more classrooms
- Reduce hours per week
- Add more time slots

### Issue: Faculty conflicts
**Solution**:
- Ensure faculty names match exactly
- Check faculty availability
- Reduce concurrent courses

### Issue: Slow generation
**Solution**:
- Reduce number of courses
- Increase number of classrooms
- Optimize time slots

## Example Output

```
============================================================
AUTOMATED TIMETABLE GENERATION
============================================================
Courses: 5
Faculty: 5
Classrooms: 4
Time Slots: 35
============================================================

Scheduling Section A...
  ✓ Scheduled CS101 on Monday at 09:00
  ✓ Scheduled CS101 on Tuesday at 09:00
  ✓ Scheduled CS101 on Wednesday at 09:00
  ...

============================================================
✅ Generated 17 schedule entries
⚠️  Found 0 conflicts
============================================================

Monday:
--------------------------------------------------------------------------------
  09:00-10:00 | CS101    | Data Structures           | Dr. Smith            | Room 101   | Sec A
  10:00-11:00 | CS102    | Algorithms                | Dr. Johnson          | Room 102   | Sec A
  ...
```

## License

This algorithm is part of the ATGS (Automated Timetable Generator & Scheduler) system.

## Support

For issues or questions, refer to the main project documentation.
