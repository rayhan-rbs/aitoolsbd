const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: [true, 'Order amount is required']
  },
  platformCommission: { 
    type: Number, 
    required: true 
  },
  sellerEarning: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  downloadLinkToken: { 
    type: String 
  },
  linkExpiresAt: { 
    type: Date 
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'card'],
    default: 'bkash'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);