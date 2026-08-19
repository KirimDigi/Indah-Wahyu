/**
 * GOOGLE APPS SCRIPT FOR RSVP & WISHES DATABASE
 * 
 * SPREADSHEET ID: 1zLi3iBAoQJEXHRklqvZBtL0P0-fNzeVOaUwqad3osws
 * SHEET NAME: Sheet1
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions -> Apps Script.
 * 3. Delete any existing code and paste this script.
 * 4. Ensure your sheet has these header columns in Row 1:
 *    A: timestamp | B: nama tamu | C: ucapan | D: konfirmasi kehadiran | E: jumlah tamu
 * 5. Click Deploy -> New Deployment.
 * 6. Select "Web App".
 * 7. Set "Execute as" to "Me".
 * 8. Set "Who has access" to "Anyone" (important for web integration!).
 * 9. Click Deploy, authorize permissions, and copy the Web App URL.
 * 10. Replace the GOOGLE_SCRIPT_URL variable value at the bottom of index.html with your Web App URL.
 */

const SPREADSHEET_ID = '1zLi3iBAoQJEXHRklqvZBtL0P0-fNzeVOaUwqad3osws';
const SHEET_NAME = 'Sheet1';

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // If the sheet has only headers or is empty
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        total: 0,
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    
    // Find column indexes based on headers, falling back to standard columns if not found
    let timestampIdx = headers.indexOf('timestamp');
    let namaTamuIdx = headers.indexOf('nama tamu');
    let ucapanIdx = headers.indexOf('ucapan');
    let konfirmasiIdx = headers.indexOf('konfirmasi kehadiran');
    let jumlahTamuIdx = headers.indexOf('jumlah tamu');
    
    if (timestampIdx === -1) timestampIdx = 0;
    if (namaTamuIdx === -1) namaTamuIdx = 1;
    if (ucapanIdx === -1) ucapanIdx = 2;
    if (konfirmasiIdx === -1) konfirmasiIdx = 3;
    if (jumlahTamuIdx === -1) jumlahTamuIdx = 4;
    
    const comments = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Skip row if both name and comment are blank
      if (!row[namaTamuIdx] && !row[ucapanIdx]) continue;
      
      comments.push({
        timestamp: row[timestampIdx],
        nama: row[namaTamuIdx],
        ucapan: row[ucapanIdx],
        konfirmasi: row[konfirmasiIdx],
        jumlah: row[jumlahTamuIdx]
      });
    }
    
    // Sort to show newest first (reverse the append order)
    comments.reverse();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      total: comments.length,
      data: comments
    })).setMimeType(ContentService.MimeType.JSON);
       
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    let params;
    if (e.postData && e.postData.contents) {
      // Try to parse JSON if sent via JSON
      try {
        params = JSON.parse(e.postData.contents);
      } catch (ex) {
        // Fallback to query parameters
        params = e.parameter;
      }
    } else {
      params = e.parameter;
    }
    
    // Map parameter names from form inputs
    const nama = params.nama || params.author || '';
    const ucapan = params.ucapan || params.comment || '';
    const konfirmasi = params.konfirmasi || params.attendance || '';
    const jumlah = params.jumlah || params.guest || '0';
    
    if (!nama || !ucapan) {
      throw new Error('Nama and Ucapan fields are required.');
    }
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const timestamp = new Date();
    
    // Append a new row to the sheet
    sheet.appendRow([timestamp, nama, ucapan, konfirmasi, jumlah]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'RSVP successfully recorded!'
    })).setMimeType(ContentService.MimeType.JSON);
       
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
