const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  message: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  replyemail: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Reply', ReplySchema);
