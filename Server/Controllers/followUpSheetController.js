const getSheetClient = require("../Utils/googleSheet");

exports.syncFollowUpToSheet = async (req, res) => {
  try {
    const { sheetId, data } = req.body;

    if (!sheetId || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const sheets = await getSheetClient();

    const rows = data.map(record => [
      record.displayId || "",
      record.patientName || "",
      record.contact || "",
      record.location || "",
      record.trackingId || "",
      record.followUpDate || "",
      record.followUpTime || "",
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: { values: rows },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Follow-up sync error:", err.message);
    res.status(500).json({ error: "Failed to sync follow-up" });
  }
};
