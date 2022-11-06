const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    price: Number,
    products:Array,
    username: String,
    address:Object,

});

module.exports = mongoose.model('orders', OrderSchema);