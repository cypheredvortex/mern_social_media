import { useState, useEffect } from "react";
import api from "../../lib/axios";

const ReportList = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReport = async (id) => {
    try {
      await api.delete(`/reports/${id}`);
      setReports(reports.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-2">
      {reports.map(r => (
        <div key={r._id} className="flex justify-between p-2 border rounded">
          <p>{r.reason}</p>
          <button onClick={() => deleteReport(r._id)} className="text-red-500">Delete</button>
        </div>
      ))}
    </div>
  );
};

export default ReportList;
