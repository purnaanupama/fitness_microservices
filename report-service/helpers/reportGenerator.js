const pdf = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');

async function generateReport(activity) {
  try {
    // Read HTML template
   const html = fs.readFileSync(path.join(__dirname, '..', 'templates', 'activityReport.html'), 'utf8');

    // Prepare data for template, including extra formatted date and metrics table data
    const data = {
      ...activity,
      startTimeFormatted: new Date(activity.startTime).toLocaleString(),
      metrics: [
        { metric: 'Heart Rate Zones', value: '75%' },
        { metric: 'Steps', value: '10,000' },
        { metric: 'Elevation Gain', value: '150 m' },
      ],
    };

   const document = {
  html,
  data,
  path: path.join(__dirname, '..', 'reports', 'activityReport.pdf'),
  type: '',
};

    const options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
    };

    const result = await pdf.create(document, options);
    
    // Return Base64 for API or file path
    const pdfBuffer = fs.readFileSync(result.filename);
    return pdfBuffer.toString('base64');

  } catch (error) {
    throw error;
  }
}

module.exports = { generateReport };
