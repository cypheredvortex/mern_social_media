import Report from "../models/Report.js";

export async function list_report(req, res) {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error in list_report controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_report_by_id(req, res) {
  try {
    const report = await Report.findById(req.params.id).populate("reporter_id", "username email");
    if (!report) {
      return res.status(404).json({ message: "Report not found!" });
    }
    res.status(200).json(report);
  } catch (error) {
    console.error("Error in get_report_by_id controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_report(req, res) {
  try {
    const { reporter_id, target_id, target_type, reason } = req.body;

    if (!reporter_id || !target_id || !target_type || !reason) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const report = new Report({
      reporter_id,
      target_id,
      target_type,
      reason,
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    console.error("Error in create_report controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_report(req, res) {
  try {
    const { reason, status } = req.body;

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { reason, status },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found!" });
    }

    res.status(200).json(updatedReport);
  } catch (error) {
    console.error("Error in update_report controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_report(req, res) {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Report not found!" });
    }

    res.status(200).json({ message: "Report deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_report controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
