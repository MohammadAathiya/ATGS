import mongoose from 'mongoose'

const availabilitySchema = new mongoose.Schema({
  day: { type: String, required: true },
  slots: [{ type: String }], // e.g., ['09:00','10:00'] start times
})

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, lowercase: true },
    department: { type: String },
    maxLoadPerWeek: { type: Number, default: 12 },
    subjects: [{ type: String }], // course codes they can teach
    availability: [availabilitySchema],
  },
  { timestamps: true }
)

export default mongoose.model('Faculty', facultySchema)
