const Leave = require("../Models/Leave");
const LeaveStatusUpdate = require("../Models/LeaveStatusUpdate");

// GET /api/leaves
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find();

    const leavesWithStatus = await Promise.all(
      leaves.map(async (leave) => {
        const latestStatus = await LeaveStatusUpdate.findOne({ leaveId: leave._id })
          .sort({ updatedAt: -1 })
          .lean();

        return {
          ...leave.toObject(),
          status: latestStatus?.status || leave.status,
          message: latestStatus?.message || "",
          statusUpdated: latestStatus?.updatedAt || null,
        };
      })
    );

    res.json(leavesWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching leaves", error: err });
  }
};

// POST /api/leaves/:id/status
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    if (!status || !["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leaveExists = await Leave.findById(id);
    if (!leaveExists) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const newStatusUpdate = new LeaveStatusUpdate({
      leaveId: id,
      status,
      message,
    });

    await newStatusUpdate.save();

    res.json({ message: "Leave status updated", statusUpdate: newStatusUpdate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating leave status", error: err });
  }
};
