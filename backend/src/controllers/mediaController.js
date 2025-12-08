import Media from "../models/Media.js";

export async function list_media(req, res) {
  try {
    const mediaFiles = await Media.find().sort({ createdAt: -1 });
    res.status(200).json(mediaFiles);
  } catch (error) {
    console.error("Error in list_media controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_media_by_id(req, res) {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found!" });
    }
    res.status(200).json(media);
  } catch (error) {
    console.error("Error in get_media_by_id controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_media(req, res) {
  try {
    const { uploader_id, url, type, size, post_id } = req.body;

    const media = new Media({
      uploader_id,
      url,
      type,
      size,
      post_id: post_id || null, 
    });

    const savedMedia = await media.save();
    res.status(201).json(savedMedia);
  } catch (error) {
    console.error("Error in create_media controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_media(req, res) {
  try {
    const { url, type, size, post_id } = req.body;

    const updatedMedia = await Media.findByIdAndUpdate(
      req.params.id,
      { url, type, size, post_id: post_id || null },
      { new: true }
    );

    if (!updatedMedia) {
      return res.status(404).json({ message: "Media not found!" });
    }

    res.status(200).json(updatedMedia);
  } catch (error) {
    console.error("Error in update_media controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_media(req, res) {
  try {
    const deletedMedia = await Media.findByIdAndDelete(req.params.id);
    if (!deletedMedia) {
      return res.status(404).json({ message: "Media not found!" });
    }
    res.status(200).json({ message: "Media deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_media controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
