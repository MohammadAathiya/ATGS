import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    capacity: { type: Number, default: 40 },
    type: { type: String, enum: ['Lecture', 'Lab'], default: 'Lecture' },
    department: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model('Room', roomSchema)
