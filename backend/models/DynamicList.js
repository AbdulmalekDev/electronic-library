import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  value: {
    type: String,
    required: [true, 'القيمة مطلوبة'],
    trim: true,
  },
  label: {
    type: String,
    required: [true, 'التسمية مطلوبة'],
    trim: true,
  },
  color: {
    type: String,
    required: [true, 'اللون مطلوب'],
    trim: true,
    default: '#cccccc'
  }
});

const dynamicListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم القائمة مطلوب'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  label: {
    type: String,
    required: [true, 'تسمية القائمة مطلوبة'],
    trim: true,
  },
  items: [itemSchema]
}, {
  timestamps: true
});

export default mongoose.model('DynamicList', dynamicListSchema);
