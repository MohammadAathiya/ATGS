import mongoose from 'mongoose'

const entrySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    start: { type: String, required: true }, // '09:00'
    end: { type: String, required: true },
    courseCode: { type: String, required: true },
    courseName: { type: String },
    faculty: { type: String, required: true }, // name or email
    classroom: { type: String, required: true }, // room code
    section: { type: String, required: true },
    department: { type: String },
    semester: { type: Number },
  },
  { _id: false }
)

const timetableSchema = new mongoose.Schema(
  {
    version: { type: Number, default: 1 },
    entries: [entrySchema],
    metadata: {
      generatedAt: { type: Date, default: Date.now },
      conflicts: [{ type: String }],
      success: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

export default mongoose.model('Timetable', timetableSchema)
