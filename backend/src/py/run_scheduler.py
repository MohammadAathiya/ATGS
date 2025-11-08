import sys, json, os
from pathlib import Path

# Allow import of the existing algorithm file in the project root
# The repository structure has the python file at: ../../timetable generator/timetable_algorithm.py
# We compute a path relative to this script location.
CURR = Path(__file__).resolve()
ROOT = CURR.parents[3]  # .../timetable generator _harika
PY_FILE = ROOT / 'timetable generator' / 'timetable_algorithm.py'

if not PY_FILE.exists():
    print(json.dumps({
        'error': 'timetable_algorithm.py not found',
        'path': str(PY_FILE)
    }))
    sys.exit(2)

# Load the module dynamically
import importlib.util
spec = importlib.util.spec_from_file_location('timetable_algorithm', str(PY_FILE))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception as e:
        print(json.dumps({'error': f'Invalid JSON input: {e}'}))
        sys.exit(1)

    courses = payload.get('courses', [])
    faculty = payload.get('faculty', [])
    classrooms = payload.get('classrooms', [])

    # Instantiate generator
    gen = mod.TimetableGenerator()
    gen.load_from_csv_data(courses, faculty, classrooms)
    result = gen.generate()

    # Optionally include detected conflicts via method if available
    try:
        conflicts_extra = gen.detect_conflicts()
        if conflicts_extra:
            # Merge unique
            existing = set((c.get('type',''), c.get('day',''), c.get('time',''), tuple(c.get('courses',[]))) for c in result.get('conflicts', []))
            for c in conflicts_extra:
                key = (c.get('type',''), c.get('day',''), c.get('time',''), tuple(c.get('courses',[])))
                if key not in existing:
                    result.setdefault('conflicts', []).append(c)
    except Exception:
        pass

    print(json.dumps(result))


if __name__ == '__main__':
    main()
