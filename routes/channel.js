const router = require("express").Router();
const Channel = require("../models/channel");
const { handleError } = require("../helpers/errorHandler");

// get all channels
router.get("/get", async (req, res) => {
  console.log("get all channels")
  try {
    const channels = await Channel.find({});
    if (!channels) return handleError(res, 404, "Failed to get channels");

    res.status(200).send(channels);
  } catch (error) {
    handleError(res, 400, error.message);
  }
});

// get a channel's messages
router.get("/get/:channel", async (req, res) => {
  console.log("get a channel's messages")
  try {
    const { channel } = req.params;
    const ch = await Channel.findOne({ title: channel }).select("messages -_id")
    if (!ch) return handleError(res, 404, "Channel not found in DB");
    res.status(200).send(ch.messages.reverse());
  } catch (error) {
    handleError(res, 400, error.message);    
  }
})

// create new channel
router.post("/newchannel", async (req, res) => {
  console.log("new channel")
  try {
    const { channel } = req.body;

    const ch = new Channel({ title: channel });
    const newChannel = await ch.save();
    if (!newChannel) return handleError(res, 401, "Failed to create channel");

    res.status(200).send(`Channel: ${newChannel.title} created`);
  } catch (error) {
    console.log(error)
    handleError(res, 400, error.message);
  }
});

// add message to channel
router.put("/add/:channel", async (req, res) => {
  console.log("message")
  try {
    const { username, message } = req.body;
    const { channel } = req.params;

    const ch = await Channel.findOneAndUpdate(
      { title: channel },
      { $push: { messages: { username, text: message } } },
      { new: true }
    );

    if (!ch) return handleError(res, 401, "Failed to add message");
    res.status(200).send(ch);

  } catch (error) {
    handleError(res, 400, error.message);
  }
});

// add like to a message
router.put("/reaction", async (req, res) => {
  console.log("like")
  try {
    const { usernameId, messageId } = req.body;

    const likedMessage = await Channel.findOneAndUpdate(
      { "messages._id": messageId },
      { $addToSet: { "messages.$.likes": usernameId } },
      { new: true }
    );
    if (!likedMessage) return handleError(res, 404, "Not found");
    console.log(likedMessage);
    res.status(200).send("OK");

  } catch (error) {
    console.log("==========================", error)
    handleError(res, 400, error.message);
  }
});

// REMOVE A MESSAGE -- replace message with --[Message Removed]--
router.put("/remove", async (req, res) => {
  console.log("remove")
  try {
    const { messageId } = req.body;
    console.log(messageId, typeof messageId)

    // == delete message ==
    // const aaa = await Channel.findOneAndUpdate(
    //   { "messages._id": messageId },
    //   { $pull: { messages: { _id: messageId } } },
    //   { new: true }
    // );

    // == replace with new object and remove likes (replaces _id) ==
    // const removedMessage = await Channel.findOneAndUpdate(
    //   { "messages._id": messageId },
    //   { $set: { messages: { text: "[Message Removed]" } } },
    //   { new: true }
    // )

    // == replace text keep subdoc id ==
    const removedMessage = await Channel.findOneAndUpdate(
      { "messages._id": messageId },
      { $set: { "messages.$.text": "[Message Removed]" } },
      { new: true }
    )
    if (!removedMessage) return handleError(res, 404, "Not found");
    console.log(removedMessage);
    res.status(200).send("OK");

  } catch (error) {
    console.log("==========================", error)
    handleError(res, 400, error.message);
  }
});

module.exports = router;
