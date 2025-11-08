# CSV File Format Guide for ATGS

## Required CSV Files

To generate an automated timetable, you need to upload the following CSV files:

### 1. Courses CSV
**Required Columns:**
- `name` or `courseName` or `CourseName` - Course name (e.g., "Data Structures")
- `code` or `courseCode` or `CourseCode` - Course code (e.g., "CS101")
- `faculty` or `facultyName` or `FacultyName` - Faculty member teaching the course
- `section` or `Section` - Section (e.g., "A", "B", "C")
- `hours` or `hoursPerWeek` or `HoursPerWeek` - Hours per week (e.g., 3, 4)
- `department` or `Department` - Department name (optional)

**Example:**
```csv
courseName,courseCode,facultyName,section,hoursPerWeek,department
Data Structures,CS101,Dr. Smith,A,3,Computer Science
Algorithms,CS102,Dr. Johnson,A,4,Computer Science
Database Systems,CS201,Dr. Williams,B,3,Computer Science
```

### 2. Faculty CSV
**Required Columns:**
- `name` or `facultyName` or `Name` - Faculty name
- `department` or `Department` - Department (optional)
- `email` or `Email` - Email address (optional)

**Example:**
```csv
name,department,email
Dr. Smith,Computer Science,smith@university.edu
Dr. Johnson,Computer Science,johnson@university.edu
Dr. Williams,Computer Science,williams@university.edu
```

### 3. Classrooms CSV
**Required Columns:**
- `name` or `roomNumber` or `RoomNumber` - Room number/name
- `capacity` or `Capacity` - Room capacity (optional)
- `building` or `Building` - Building name (optional)

**Example:**
```csv
roomNumber,capacity,building
Room 101,50,Block A
Room 102,60,Block A
Room 201,40,Block B
Lab 301,30,Block C
```

### 4. Departments CSV (Optional)
**Columns:**
- `name` or `Name` - Department name
- `code` or `Code` - Department code

**Example:**
```csv
name,code
Computer Science,CS
Electronics,EC
Mechanical,ME
```

### 5. Sections CSV (Optional)
**Columns:**
- `name` or `Name` - Section name
- `department` or `Department` - Department
- `semester` or `Semester` - Semester

**Example:**
```csv
name,department,semester
A,Computer Science,3
B,Computer Science,3
C,Computer Science,5
```

## How to Use

1. **Prepare your CSV files** according to the formats above
2. **Login as Admin**
3. **Go to Uploads page**
4. **Upload each CSV file** to its respective category
5. **Wait for success confirmation**
6. **Go to Generator page**
7. **Click "Generate Timetable"**
8. **View the generated timetable** in Faculty/Student sections

## Algorithm Features

The automated timetable generator:
- ✅ Avoids faculty conflicts (same faculty, same time)
- ✅ Avoids classroom conflicts (same room, same time)
- ✅ Distributes classes across Monday-Friday
- ✅ Schedules classes between 9 AM - 5 PM
- ✅ Assigns required hours per week for each course
- ✅ Color-codes courses for easy identification
- ✅ Detects and reports any scheduling conflicts

## Tips for Best Results

1. Ensure faculty names match exactly across CSV files
2. Provide enough classrooms for all courses
3. Specify realistic hours per week (typically 3-4)
4. Use consistent naming conventions
5. Include all required columns (case-insensitive)
