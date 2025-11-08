import mongoose from 'mongoose'

const sectionSchema = new mongoose.Schema(
  {
    sectionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    year: { type: Number },
    department: { type: String },
    semester: { type: Number },
    strength: { type: Number, default: 40 },
  },
  { timestamps: true }
)

export default mongoose.model('Section', sectionSchema)
