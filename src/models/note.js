import { model, Schema } from 'mongoose';

// {
//    "title": "LOTR",
//     "content":  "great books",
//     "tag": "Todo"
// }

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      enum: [
        'Work',
        'Personal',
        'Meeting',
        'Shopping',
        'Ideas',
        'Travel',
        'Finance',
        'Health',
        'Important',
        'Todo',
      ],
      default: 'Todo',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Note = model('notes', noteSchema);
