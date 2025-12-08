import SearchHistory from "../models/SearchHistory.js";

export async function list_searchHistory(req, res) {
  try {
    const histories = await SearchHistory.find()
      .populate("user_id", "username") 
      .sort({ createdAt: -1 });
    res.status(200).json(histories);
  } catch (error) {
    console.error("Error in list_searchHistory controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_searchHistory_by_id(req, res) {
  try {
    const history = await SearchHistory.findById(req.params.id).populate(
      "user_id",
      "username"
    );
    if (!history) {
      return res.status(404).json({ message: "Search history not found!" });
    }
    res.status(200).json(history);
  } catch (error) {
    console.error("Error in get_searchHistory_by_id controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_searchHistory(req, res) {
  try {
    const { user_id, query } = req.body;
    if (!user_id || !query) {
      return res.status(400).json({ message: "user_id and query are required!" });
    }

    const newHistory = new SearchHistory({ user_id, query });
    const savedHistory = await newHistory.save();
    res.status(201).json(savedHistory);
  } catch (error) {
    console.error("Error in create_searchHistory controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_searchHistory(req, res) {
  try {
    const { query } = req.body;

    const updatedHistory = await SearchHistory.findByIdAndUpdate(
      req.params.id,
      { query },
      { new: true }
    );

    if (!updatedHistory) {
      return res.status(404).json({ message: "Search history not found!" });
    }

    res.status(200).json(updatedHistory);
  } catch (error) {
    console.error("Error in update_searchHistory controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_searchHistory(req, res) {
  try {
    const deletedHistory = await SearchHistory.findByIdAndDelete(req.params.id);

    if (!deletedHistory) {
      return res.status(404).json({ message: "Search history not found!" });
    }

    res.status(200).json({ message: "Search history deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_searchHistory controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
