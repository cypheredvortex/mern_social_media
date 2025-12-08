import Comment from "../models/Comment.js";

export async function list_comment(req, res) {
  try {
    const { post_id } = req.query;
    let query = {};
    if (post_id) {
      query.post_id = post_id;
    }

    const comments = await Comment.find(query)
      .populate("author_id", "username profile_picture")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error in list_comment controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_comment_by_id(req, res) {
  try {
    const comment = await Comment.findById(req.params.id).populate(
      "author_id",
      "username profile_picture"
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }
    res.status(200).json(comment);
  } catch (error) {
    console.error("Error in get_comment_by_id controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_comment(req, res) {
  try {
    const { post_id, author_id, content, parent_comment_id } = req.body;

    const comment = new Comment({
      post_id,
      author_id,
      content,
      parent_comment_id: parent_comment_id || null,
    });

    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    console.error("Error in create_comment controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_comment(req, res) {
  try {
    const { content } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found!" });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error in update_comment controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_comment(req, res) {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found!" });
    }
    res.status(200).json({ message: "Comment deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_comment controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
