const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true, },
    description: String,
    completed: {type: Boolean, default: false},
    createdAtFormatted: String,
    createdAt: String,
    color: String,
    postedBy: {type: String, required: true},
    userID: {type: String, required: true},
})

module.exports = mongoose.model('Task', taskSchema)