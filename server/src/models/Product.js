const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Product title is required'],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Description is required']
  },
  category: { 
    type: String, 
    required: true,
    enum: [
      'AI Prompt', 
      'AI Template', 
      'AI Automation', 
      'ChatGPT Tools', 
      'Gemini Tools', 
      'Canva Template', 
      'Excel Automation', 
      'PHP Script', 
      'WordPress Plugin', 
      'AI Agent'
    ]
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  fileUrl: { 
    type: String, 
    required: [true, 'Product file is required']
  },
  previewUrl: { 
    type: String 
  },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  maxDownloads: { 
    type: Number, 
    default: 3 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);