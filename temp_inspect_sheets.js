const { google } = require('googleapis');
const key = require('./google-key.json');
const SPREADSHEET_ID = '1qMStUrKKXCJIGT7J5f7PpJCbsqIueupLfvNncb24vaU';
const auth = new google.auth.GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'Atendimentos DD.40'!A1:Z120" });
    console.log('rows', resp.data.values ? resp.data.values.length : 0);
    console.log(JSON.stringify(resp.data.values, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
