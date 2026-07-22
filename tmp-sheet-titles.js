const { google } = require('googleapis');
const key = require('./google-key.json');
const spreadsheetId = '1qMStUrKKXCJIGT7J5f7PpJCbsqIueupLfvNncb24vaU';
(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' });
    console.log('titles:', (res.data.sheets || []).map((s) => s.properties?.title));
  } catch (err) {
    console.error('error', err?.message || err);
  }
})();
