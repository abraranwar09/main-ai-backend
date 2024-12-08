const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: String,
    content: String,
    name: String,
    function_call: mongoose.Schema.Types.Mixed,
    tool_calls: [mongoose.Schema.Types.Mixed],
    tool_call_id: String
}, { _id: false });

module.exports = messageSchema; 