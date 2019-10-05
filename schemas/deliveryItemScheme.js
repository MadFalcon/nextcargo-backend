const mongoose = require('mongoose');

const deliveryItemScheme = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  deliveryItemNumber: {
    type: Number,
    unique: true,
    required: true
  },
  userFCs: String,
  userPhone: String,
  userAddres: String,
  addresseeFCs: String,
  addresseePhone: String,
  toCountry: String,
  shippingMethod: String,
  toCity: String,
  weight: Number,
  price: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  decoratedDate: Date,
  createdDate: {
    type: Date,
    default: Date.now
  },
  reservatedDate: Date,
  completedDate: Date,
  isCompleted: {
    type: String,
    default: 'inIdle' // reserved,inProcess,completed
  },
  addressPhoto: String,
  passPhoto: String,
});
const DeliveryItem = mongoose.model('DeliveryItem', deliveryItemScheme);
module.exports = DeliveryItem;
