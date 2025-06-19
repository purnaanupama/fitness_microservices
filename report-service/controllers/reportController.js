const { pool } = require("../db");
const { generateReport } = require("../helpers/reportGenerator");

async function processAndSaveReport(activity) {
  try {
    const base64Report = await generateReport(activity);
    const checkSql = 'SELECT * FROM reports WHERE activity_id = ?';
    const [rows] = await pool.execute(checkSql, [activity.id]);

    if (rows.length > 0) {
      console.log('Report already exists for activity:', activity.id);
      return;
    }

    const insertSql = 'INSERT INTO reports (activity_id, report_data, status) VALUES (?, ?, \'PROCESSING\')';
    const params = [activity.id, base64Report];
    const [result] = await pool.execute(insertSql, params);

    console.log('Report saved with ID:', result.insertId);

    // Update status to COMPLETED
    const updateSql = 'UPDATE reports SET status = ? WHERE activity_id = ?';
    await pool.execute(updateSql, ['COMPLETED', activity.id]);

    console.log('Report status updated to COMPLETED for activity:', activity.id);

  } catch (error) {
    console.error('Error in processAndSaveReport:', error);

    // Optional: If error happens, update status to FAILED
    if (activity?.id) {
      const failSql = 'UPDATE reports SET status = ? WHERE activity_id = ?';
      await pool.execute(failSql, ['FAILED', activity.id]);
    }
  }
}

async function getReportStatus(req, res) {
  const { activityId } = req.params;

  try {
    const sql = 'SELECT status, report_data FROM reports WHERE activity_id = ?';
    const [rows] = await pool.execute(sql, [activityId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = rows[0];

    let reportData = null;
    if (report.status === 'COMPLETED' && report.report_data) {
      if (Buffer.isBuffer(report.report_data)) {
        reportData = report.report_data.toString('base64');
      } else if (typeof report.report_data === 'string') {
        reportData = report.report_data;
      } else {
        console.warn('Unexpected report_data format:', typeof report.report_data);
      }
    }

    res.json({
      activityId,
      status: report.status,
      reportData: reportData
    });
  } catch (error) {
    console.error('Error fetching report status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}



module.exports = { processAndSaveReport, getReportStatus };