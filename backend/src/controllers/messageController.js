import Message from "../models/Message.js";

export async function list_message(req, res) {
  try {
    const { sender_id, receiver_id } = req.query;

    const filter = {};
    if (sender_id) filter.sender_id = sender_id;
    if (receiver_id) filter.receiver_id = receiver_id;

    const messages = await Message.find(filter).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in list_message controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_message_by_id(req, res) {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found!" });
    }
    res.status(200).json(message);
  } catch (error) {
    console.error("Error in get_message_by_id controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_message(req, res) {
  try {
    const { sender_id, receiver_id, content, media_url } = req.body;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({ message: "Sender and receiver are required!" });
    }

    const message = new Message({
      sender_id,
      receiver_id,
      content,
      media_url,
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error in create_message controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_message(req, res) {
  try {
    const { content, media_url, status } = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { content, media_url, status },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found!" });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error in update_message controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_message(req, res) {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found!" });
    }

    res.status(200).json({ message: "Message deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_message controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
