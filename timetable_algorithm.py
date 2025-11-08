"""
Automated Timetable Generation Algorithm
Using Constraint Satisfaction Problem (CSP) with Backtracking
Author: ATGS System
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Set, Tuple, Optional
from dataclasses import dataclass, asdict
from collections import defaultdict


@dataclass
class Course:
    """Course data structure"""
    code: str
    name: str
    faculty: str
    section: str
    hours_per_week: int
    department: str = "General"
    course_type: str = "Theory"  # Theory or Lab
    
    def __hash__(self):
        return hash(f"{self.code}-{self.section}")


@dataclass
class Faculty:
    """Faculty data structure"""
    name: str
    department: str
    email: str = ""
    max_hours_per_day: int = 6
    max_hours_per_week: int = 18
    unavailable: Set[str] = None  # normalized keys like "Monday-09:00"
    
    def __post_init__(self):
        if self.unavailable is None:
            self.unavailable = set()
    
    def __hash__(self):
        return hash(self.name)


@dataclass
class Classroom:
    """Classroom data structure"""
    room_number: str
    capacity: int
    building: str = ""
    room_type: str = "Lecture"  # Lecture or Lab
    
    def __hash__(self):
        return hash(self.room_number)


@dataclass
class TimeSlot:
    """Time slot data structure"""
    day: str
    start_time: str
    end_time: str
    
    def __hash__(self):
        return hash(f"{self.day}-{self.start_time}")
    
    def __eq__(self, other):
        return self.day == other.day and self.start_time == other.start_time


@dataclass
class ScheduleEntry:
    """Single timetable entry"""
    course: Course
    faculty: Faculty
    classroom: Classroom
    time_slot: TimeSlot
    
    def to_dict(self):
        """Convert to dictionary for JSON export"""
        return {
            'id': f"{self.course.code}-{self.course.section}-{self.time_slot.day}-{self.time_slot.start_time}",
            'title': f"{self.course.code} - {self.course.name}",
            'courseCode': self.course.code,
            'courseName': self.course.name,
            'faculty': self.faculty.name,
            'section': self.course.section,
            'classroom': self.classroom.room_number,
            'day': self.time_slot.day,
            'startTime': self.time_slot.start_time,
            'endTime': self.time_slot.end_time,
            'department': self.course.department,
            'backgroundColor': self._get_color()
        }
    
    def _get_color(self):
        """Generate consistent color for course"""
        colors = [
            '#667eea', '#764ba2', '#f093fb', '#4facfe',
            '#43e97b', '#fa709a', '#a8edea', '#38f9d7'
        ]
        hash_val = sum(ord(c) for c in self.course.code)
        return colors[hash_val % len(colors)]


class TimetableGenerator:
    """
    Advanced Timetable Generation Algorithm
    Uses Constraint Satisfaction with Backtracking and Heuristics
    """
    
    def __init__(self):
        self.courses: List[Course] = []
        self.faculty_list: List[Faculty] = []
        self.classrooms: List[Classroom] = []
        self.time_slots: List[TimeSlot] = []
        self.schedule: List[ScheduleEntry] = []
        self.conflicts: List[Dict] = []
        
        # Constraint tracking
        self.faculty_schedule: Dict[Tuple[Faculty, TimeSlot], bool] = {}
        self.classroom_schedule: Dict[Tuple[Classroom, TimeSlot], bool] = {}
        self.section_schedule: Dict[Tuple[str, TimeSlot], bool] = {}
        self.faculty_hours_week: Dict[str, int] = {}
        self.section_strengths: Dict[str, int] = {}
        
        # Generate time slots (Monday-Friday, 9 AM - 5 PM)
        self._generate_time_slots()
    
    def _generate_time_slots(self):
        """Generate all possible time slots"""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        times = [
            ('09:00', '10:00'),
            ('10:00', '11:00'),
            ('11:00', '12:00'),
            ('12:00', '13:00'),
            ('14:00', '15:00'),
            ('15:00', '16:00'),
            ('16:00', '17:00'),
        ]
        
        for day in days:
            for start, end in times:
                self.time_slots.append(TimeSlot(day, start, end))
    
    def load_from_csv_data(self, courses_data: List[Dict], 
                           faculty_data: List[Dict], 
                           classrooms_data: List[Dict]):
        """Load data from CSV dictionaries"""
        
        # Load courses
        for row in courses_data:
            course = Course(
                code=row.get('courseCode', row.get('code', 'UNKNOWN')),
                name=row.get('courseName', row.get('name', 'Unknown Course')),
                faculty=row.get('facultyName', row.get('faculty', 'TBA')),
                section=row.get('section', row.get('Section', 'A')),
                hours_per_week=int(row.get('hoursPerWeek', row.get('hours', 3))),
                department=row.get('department', row.get('Department', 'General')),
                course_type=row.get('type', row.get('Type', 'Theory'))
            )
            self.courses.append(course)
        
        # Load faculty
        for row in faculty_data:
            # Parse unavailable slots like "Mon:09:00" or "Monday:09:00"
            unavail_raw = row.get('unavailable_slots', row.get('UnavailableSlots', row.get('unavailable', '')))
            unavailable = set()
            if isinstance(unavail_raw, str) and unavail_raw.strip():
                parts = [p.strip() for p in unavail_raw.split(',') if p.strip()]
                name_map = {
                    'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday',
                    'Monday': 'Monday', 'Tuesday': 'Tuesday', 'Wednesday': 'Wednesday', 'Thursday': 'Thursday', 'Friday': 'Friday'
                }
                for p in parts:
                    if ':' in p:
                        day, time = p.split(':', 1)
                        day = name_map.get(day.strip(), day.strip())
                        time = time.strip()
                        # normalize to HH:MM
                        if len(time) == 4 and time[1] == ':':
                            time = '0' + time
                        if len(time) == 5 and time[2] == ':':
                            unavailable.add(f"{day}-{time}")
            faculty = Faculty(
                name=row.get('name', row.get('Name', 'Unknown')),
                department=row.get('department', row.get('Department', 'General')),
                email=row.get('email', row.get('Email', '')),
                unavailable=unavailable
            )
            self.faculty_list.append(faculty)
        
        # Load classrooms
        for row in classrooms_data:
            classroom = Classroom(
                room_number=row.get('roomNumber', row.get('name', 'Unknown')),
                capacity=int(row.get('capacity', row.get('Capacity', 50))),
                building=row.get('building', row.get('Building', '')),
                room_type=row.get('type', row.get('Type', 'Lecture'))
            )
            self.classrooms.append(classroom)
    
    def generate(self) -> Dict:
        """
        Main generation algorithm using CSP with backtracking
        Returns: Dictionary with schedule and conflicts
        """
        print("=" * 60)
        print("AUTOMATED TIMETABLE GENERATION")
        print("=" * 60)
        print(f"Courses: {len(self.courses)}")
        print(f"Faculty: {len(self.faculty_list)}")
        print(f"Classrooms: {len(self.classrooms)}")
        print(f"Time Slots: {len(self.time_slots)}")
        print("=" * 60)
        
        self.schedule = []
        self.conflicts = []
        self.faculty_schedule = {}
        self.classroom_schedule = {}
        self.section_schedule = {}
        self.faculty_hours_week = {}
        
        # Heuristic pre-sorting (MRV-lite): courses with fewer feasible slots first
        def feasible_count(course: Course) -> int:
            fac = self._find_faculty(course.faculty)
            if not fac:
                return 0
            return len(self._get_available_slots(course, fac))

        sorted_courses = sorted(
            self.courses,
            key=lambda c: (feasible_count(c), -c.hours_per_week)
        )
        
        # Group courses by section for better scheduling
        courses_by_section = defaultdict(list)
        for course in sorted_courses:
            courses_by_section[course.section].append(course)
        
        # Schedule each section
        for section, section_courses in courses_by_section.items():
            # MRV within section
            section_courses.sort(key=lambda c: (feasible_count(c), -c.hours_per_week))
            print(f"\nScheduling Section {section}...")
            for course in section_courses:
                success = self._schedule_course(course)
                if not success:
                    self.conflicts.append({
                        'course': course.name,
                        'code': course.code,
                        'section': course.section,
                        'reason': 'Could not find sufficient available slots'
                    })
        
        print("\n" + "=" * 60)
        print(f"✅ Generated {len(self.schedule)} schedule entries")
        print(f"⚠️  Found {len(self.conflicts)} conflicts")
        print("=" * 60)
        
        return {
            'schedule': [entry.to_dict() for entry in self.schedule],
            'conflicts': self.conflicts,
            'success': len(self.conflicts) == 0,
            'statistics': self._get_statistics()
        }
    
    def _schedule_course(self, course: Course) -> bool:
        """
        Schedule a single course using backtracking
        Returns: True if successfully scheduled required hours
        """
        required_hours = course.hours_per_week
        scheduled_hours = 0
        
        # Find faculty object
        faculty = self._find_faculty(course.faculty)
        if not faculty:
            print(f"  ⚠️  Faculty not found: {course.faculty}")
            return False
        
        # Try to schedule required hours
        attempts = 0
        max_attempts = len(self.time_slots) * 2
        
        while scheduled_hours < required_hours and attempts < max_attempts:
            attempts += 1
            
            # Get available time slots using heuristics
            available_slots = self._get_available_slots(course, faculty)
            
            if not available_slots:
                break
            
            # Choose best slot (spread across week)
            time_slot = self._choose_best_slot(available_slots, course)
            
            # Find available classroom
            classroom = self._find_available_classroom(time_slot, course)
            
            if classroom:
                # Enforce faculty weekly hour limit
                fname = faculty.name
                used = self.faculty_hours_week.get(fname, 0)
                if used >= faculty.max_hours_per_week:
                    # cannot assign more hours to this faculty this week
                    continue
                # Create schedule entry
                entry = ScheduleEntry(course, faculty, classroom, time_slot)
                self.schedule.append(entry)
                
                # Mark as used
                self.faculty_schedule[(faculty, time_slot)] = True
                self.classroom_schedule[(classroom, time_slot)] = True
                self.section_schedule[(course.section, time_slot)] = True
                self.faculty_hours_week[fname] = used + 1
                
                scheduled_hours += 1
                print(f"  ✓ Scheduled {course.code} on {time_slot.day} at {time_slot.start_time}")
        
        return scheduled_hours >= required_hours
    
    def _get_available_slots(self, course: Course, faculty: Faculty) -> List[TimeSlot]:
        """Get all available time slots for a course"""
        available = []
        
        for slot in self.time_slots:
            # Check faculty availability
            if (faculty, slot) in self.faculty_schedule:
                continue
            # Check faculty unavailability
            if f"{slot.day}-{slot.start_time}" in (faculty.unavailable or set()):
                continue
            
            # Check section availability (no overlapping classes for same section)
            if (course.section, slot) in self.section_schedule:
                continue
            
            # Check if classroom available
            if self._has_available_classroom(slot, course):
                available.append(slot)
        
        return available
    
    def _choose_best_slot(self, available_slots: List[TimeSlot], course: Course) -> TimeSlot:
        """
        Choose best slot using heuristics:
        1. Spread classes across different days
        2. Prefer morning slots for theory courses
        3. Avoid back-to-back classes when possible
        """
        if not available_slots:
            return None
        
        # Count classes per day for this section
        day_counts = defaultdict(int)
        for entry in self.schedule:
            if entry.course.section == course.section:
                day_counts[entry.time_slot.day] += 1
        
        # LCV-lite ordering: prefer slots with more room options and better day balance
        def rooms_available_for(slot: TimeSlot, course: Course) -> int:
            count = 0
            required_type = 'Lab' if str(course.course_type).lower().startswith('lab') else 'Lecture'
            strength = self.section_strengths.get(course.section, 0)
            for classroom in self.classrooms:
                if (classroom, slot) in self.classroom_schedule:
                    continue
                if required_type == 'Lab' and str(getattr(classroom, 'room_type', 'Lecture')).lower() != 'lab':
                    continue
                if strength and classroom.capacity < strength:
                    continue
                count += 1
            return count

        available_slots.sort(
            key=lambda s: (
                day_counts[s.day],              # fewer existing classes that day
                -rooms_available_for(s, course),# more room options is better
                s.start_time                    # earlier times preferred
            )
        )
        return available_slots[0]
    
    def _find_available_classroom(self, time_slot: TimeSlot, course: Course) -> Optional[Classroom]:
        """Find an available classroom obeying type and capacity"""
        # determine required type and section strength
        required_type = 'Lab' if str(course.course_type).lower().startswith('lab') else 'Lecture'
        strength = self.section_strengths.get(course.section, 0)
        for classroom in self.classrooms:
            if (classroom, time_slot) in self.classroom_schedule:
                continue
            # type match (lab needs lab room; theory can use lecture room)
            if required_type == 'Lab' and str(getattr(classroom, 'room_type', 'Lecture')).lower() != 'lab':
                continue
            # capacity
            if strength and classroom.capacity < strength:
                continue
            return classroom
        return None
    
    def _has_available_classroom(self, time_slot: TimeSlot, course: Course) -> bool:
        """Check if any classroom meets constraints for this course"""
        required_type = 'Lab' if str(course.course_type).lower().startswith('lab') else 'Lecture'
        strength = self.section_strengths.get(course.section, 0)
        for classroom in self.classrooms:
            if (classroom, time_slot) in self.classroom_schedule:
                continue
            if required_type == 'Lab' and str(classroom.__dict__.get('type', 'Lecture')).lower() != 'lab':
                continue
            if strength and classroom.capacity < strength:
                continue
            return True
        return False
    
    def _find_faculty(self, faculty_name: str) -> Optional[Faculty]:
        """Find faculty by name"""
        for faculty in self.faculty_list:
            if faculty.name == faculty_name:
                return faculty
        return None
    
    def _get_statistics(self) -> Dict:
        """Generate statistics about the timetable"""
        unique_faculty = set(entry.faculty.name for entry in self.schedule)
        unique_classrooms = set(entry.classroom.room_number for entry in self.schedule)
        unique_sections = set(entry.course.section for entry in self.schedule)
        
        # Classes per day
        classes_per_day = defaultdict(int)
        for entry in self.schedule:
            classes_per_day[entry.time_slot.day] += 1
        
        return {
            'total_classes': len(self.schedule),
            'unique_faculty': len(unique_faculty),
            'unique_classrooms': len(unique_classrooms),
            'unique_sections': len(unique_sections),
            'classes_per_day': dict(classes_per_day),
            'utilization': {
                'faculty': f"{len(unique_faculty)}/{len(self.faculty_list)}",
                'classrooms': f"{len(unique_classrooms)}/{len(self.classrooms)}"
            }
        }
    
    def detect_conflicts(self) -> List[Dict]:
        """Detect any conflicts in the generated schedule"""
        conflicts = []
        
        # Check faculty conflicts
        faculty_slots = defaultdict(list)
        for entry in self.schedule:
            key = (entry.faculty.name, entry.time_slot.day, entry.time_slot.start_time)
            faculty_slots[key].append(entry)
        
        for key, entries in faculty_slots.items():
            if len(entries) > 1:
                conflicts.append({
                    'type': 'faculty_conflict',
                    'faculty': key[0],
                    'day': key[1],
                    'time': key[2],
                    'courses': [e.course.code for e in entries]
                })
        
        # Check classroom conflicts
        classroom_slots = defaultdict(list)
        for entry in self.schedule:
            key = (entry.classroom.room_number, entry.time_slot.day, entry.time_slot.start_time)
            classroom_slots[key].append(entry)
        
        for key, entries in classroom_slots.items():
            if len(entries) > 1:
                conflicts.append({
                    'type': 'classroom_conflict',
                    'classroom': key[0],
                    'day': key[1],
                    'time': key[2],
                    'courses': [e.course.code for e in entries]
                })
        
        return conflicts
    
    def export_to_json(self, filename: str = 'timetable.json'):
        """Export timetable to JSON file"""
        result = self.generate()
        with open(filename, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\n✅ Timetable exported to {filename}")
        return result
    
    def print_timetable(self):
        """Print timetable in readable format"""
        print("\n" + "=" * 80)
        print("GENERATED TIMETABLE")
        print("=" * 80)
        
        # Group by day
        by_day = defaultdict(list)
        for entry in self.schedule:
            by_day[entry.time_slot.day].append(entry)
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        for day in days:
            if day in by_day:
                print(f"\n{day}:")
                print("-" * 80)
                entries = sorted(by_day[day], key=lambda e: e.time_slot.start_time)
                for entry in entries:
                    print(f"  {entry.time_slot.start_time}-{entry.time_slot.end_time} | "
                          f"{entry.course.code:8} | {entry.course.name:25} | "
                          f"{entry.faculty.name:20} | {entry.classroom.room_number:10} | "
                          f"Sec {entry.course.section}")


# Example usage and testing
if __name__ == "__main__":
    # Sample data
    sample_courses = [
        {'courseCode': 'CS101', 'courseName': 'Data Structures', 'facultyName': 'Dr. Smith', 'section': 'A', 'hoursPerWeek': 3},
        {'courseCode': 'CS102', 'courseName': 'Algorithms', 'facultyName': 'Dr. Johnson', 'section': 'A', 'hoursPerWeek': 4},
        {'courseCode': 'CS201', 'courseName': 'Database Systems', 'facultyName': 'Dr. Williams', 'section': 'B', 'hoursPerWeek': 3},
        {'courseCode': 'CS301', 'courseName': 'Operating Systems', 'facultyName': 'Dr. Brown', 'section': 'A', 'hoursPerWeek': 4},
        {'courseCode': 'CS302', 'courseName': 'Computer Networks', 'facultyName': 'Dr. Davis', 'section': 'B', 'hoursPerWeek': 3},
    ]
    
    sample_faculty = [
        {'name': 'Dr. Smith', 'department': 'Computer Science'},
        {'name': 'Dr. Johnson', 'department': 'Computer Science'},
        {'name': 'Dr. Williams', 'department': 'Computer Science'},
        {'name': 'Dr. Brown', 'department': 'Computer Science'},
        {'name': 'Dr. Davis', 'department': 'Computer Science'},
    ]
    
    sample_classrooms = [
        {'roomNumber': 'Room 101', 'capacity': 50},
        {'roomNumber': 'Room 102', 'capacity': 60},
        {'roomNumber': 'Room 201', 'capacity': 40},
        {'roomNumber': 'Lab 301', 'capacity': 30},
    ]
    
    # Create generator
    generator = TimetableGenerator()
    
    # Load data
    generator.load_from_csv_data(sample_courses, sample_faculty, sample_classrooms)
    
    # Generate timetable
    result = generator.generate()
    
    # Print timetable
    generator.print_timetable()
    
    # Check for conflicts
    conflicts = generator.detect_conflicts()
    if conflicts:
        print("\n⚠️  CONFLICTS DETECTED:")
        for conflict in conflicts:
            print(f"  - {conflict}")
    
    # Export to JSON
    generator.export_to_json('generated_timetable.json')
    
    # Print statistics
    print("\n" + "=" * 80)
    print("STATISTICS")
    print("=" * 80)
    stats = result['statistics']
    for key, value in stats.items():
        print(f"{key}: {value}")
