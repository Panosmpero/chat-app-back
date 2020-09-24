const { Schema, model } = require("mongoose");

const channelSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [
    {
      username: {
        type: String,
      },
      text: {
        type: String,
      },
      likes: [String],
      date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

const Channel = model("channel", channelSchema);

module.exports = Channel;
