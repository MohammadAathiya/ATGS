import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String },
    credits: { type: Number, default: 3 },
    hoursPerWeek: { type: Number, default: 3 },
    type: { type: String, enum: ['Theory', 'Lab'], default: 'Theory' },
    semester: { type: Number },
    sections: [{ type: String }],
  },
  { timestamps: true }
)

export default mongoose.model('Course', courseSchema)
