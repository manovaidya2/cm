const getSheetClient = require("../Utils/googleSheet");

exports.syncPatientsToSheet = async (req, res) => {
  try {
    const { sheetId, data } = req.body;
    if (!sheetId || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const sheets = await getSheetClient();
    const clearRange = "Sheet1!A2:E1000";

    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: clearRange,
    });

    const rows = data.map(p => [
      p.name || "",
      p.age || "",
      p.contact || "",
      p.email || "",
      p.status || ""
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      resource: { values: rows },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Sheet sync failed:", err.message);
    res.status(500).json({ error: "Failed to sync to sheet" });
  }
};


// exports.syncFollowUpToSheet = async (req, res) => {
//   try {
//     const { sheetId, record } = req.body;

//     if (!sheetId || !record) {
//       return res.status(400).json({ error: "Missing data" });
//     }

//     const sheets = await getSheetClient();

//     const values = [[
//       record.displayId,
//       record.patientName,
//       record.contact,
//       record.location,
//       record.trackingId || "-",
//       record.followUpDate,
//       record.followUpTime,
//     ]];

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: sheetId,
//       range: "Sheet1!G2", // Append after patient list (G onwards)
//       valueInputOption: "RAW",
//       insertDataOption: "INSERT_ROWS",
//       resource: { values },
//     });

//     res.json({ success: true });
//   } catch (error) {
//     console.error("❌ Follow-up sheet sync failed:", error);
//     res.status(500).json({ error: "Failed to sync follow-up" });
//   }
// };