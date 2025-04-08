const MeetingHistory = require("../../model/schema/meeting");
const User = require("../../model/schema/user");
const mongoose = require("mongoose");

const add = async (req, res) => {
  try {
    const {
      agenda,
      attendes,
      attendesLead,
      location,
      related,
      dateTime,
      notes,
      createBy,
      createByContact,
      createByLead,
      category,
      duration,
    } = req.body;

    if (attendes && Array.isArray(attendes)) {
      for (const attendee of attendes) {
        if (!mongoose.Types.ObjectId.isValid(attendee)) {
          res.status(400).json({ error: "Invalid attendee value" });
        }
      }
    }

    if (attendesLead && Array.isArray(attendesLead)) {
      for (const lead of attendesLead) {
        if (!mongoose.Types.ObjectId.isValid(lead)) {
          res.status(400).json({ error: "Invalid attendesLead value" });
        }
      }
    }

    if (createByContact && !mongoose.Types.ObjectId.isValid(createByContact)) {
      res.status(400).json({ error: "Invalid createByContact value" });
    }

    if (createByLead && !mongoose.Types.ObjectId.isValid(createByLead)) {
      res.status(400).json({ error: "Invalid createByLead value" });
    }

    const meeting = {
      agenda,
      location,
      related,
      dateTime,
      notes,
      createBy,
    };

    if (createByContact) {
      meeting.createByContact = createByContact;
    }

    if (createByLead) {
      meeting.createByLead = createByLead;
    }

    if (attendes && attendes.length > 0) {
      meeting.attendes = attendes;
    }

    if (attendesLead && attendesLead.length > 0) {
      meeting.attendesLead = attendesLead;
    }

    if (duration) {
      const startDateTime = new Date(dateTime);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(startDateTime.getMinutes() + Number(duration));
      meeting.endDateTime = endDateTime;
    }

    const user = await User.findById({ _id: createBy });
    if (user) {
      user.meetingsScheduled = (user.meetingsScheduled || 0) + 1;
      await user.save();
    }

    const result = new MeetingHistory(meeting);
    await result.save();
    res.status(200).json({ result });
  } catch (err) {
    console.error("Failed to create :", err);
    res.status(400).json({ err, error: "Failed to create" });
  }
};

const index = async (req, res) => {
  try {
    const query = { ...req.query };

    if (query.createBy) {
      query.createBy = new mongoose.Types.ObjectId(query.createBy);
    }

    let result = await MeetingHistory.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "Contacts",
          localField: "attendes",
          foreignField: "_id",
          as: "contactAttendees",
        },
      },
      {
        $lookup: {
          from: "Leads",
          localField: "attendesLead",
          foreignField: "_id",
          as: "leadAttendees",
        },
      },
      {
        $lookup: {
          from: "Contacts",
          localField: "createByContact",
          foreignField: "_id",
          as: "contact",
        },
      },
      {
        $lookup: {
          from: "Leads",
          localField: "createByLead",
          foreignField: "_id",
          as: "createByrefLead",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "createBy",
          foreignField: "_id",
          as: "users",
        },
      },
      { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$createByrefLead", preserveNullAndEmptyArrays: true },
      },
      { $match: { "users.deleted": false } },
      {
        $addFields: {
          senderName: { $concat: ["$users.firstName", " ", "$users.lastName"] },
          createdByName: {
            $concat: ["$users.firstName", " ", "$users.lastName"],
          },
          deleted: {
            $cond: [
              { $eq: ["$contact.deleted", false] },
              "$contact.deleted",
              { $ifNull: ["$createByrefLead.deleted", false] },
            ],
          },
          createByName: {
            $cond: {
              if: "$contact",
              then: {
                $concat: [
                  { $ifNull: ["$contact.title", ""] },
                  " ",
                  { $ifNull: ["$contact.firstName", ""] },
                  " ",
                  { $ifNull: ["$contact.lastName", ""] },
                ],
              },
              else: { $ifNull: ["$createByrefLead.leadName", ""] },
            },
          },
        },
      },
      {
        $project: {
          contact: 0,
          createByrefLead: 0,
          users: 0,
          contactAttendees: 0,
          leadAttendees: 0,
        },
      },
    ]);

    result?.forEach((element) => {
      if (element.createByLead) {
        element.realeted = "Lead";
      }
      if (element.createByContact) {
        element.realeted = "Contact";
      }
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Failed :", err);
    res.status(400).json({ err, error: "Failed " });
  }
};

const view = async (req, res) => {
  try {
    let result = await MeetingHistory.findOne({ _id: req.params.id });

    if (!result) return res.status(404).json({ message: "no Data Found." });

    let response = await MeetingHistory.aggregate([
      { $match: { _id: result._id } },
      {
        $lookup: {
          from: "Contacts",
          localField: "attendes",
          foreignField: "_id",
          as: "attendes",
        },
      },
      {
        $lookup: {
          from: "Leads",
          localField: "attendesLead",
          foreignField: "_id",
          as: "attendesLead",
        },
      },
      {
        $lookup: {
          from: "Contacts",
          localField: "createByContact",
          foreignField: "_id",
          as: "contact",
        },
      },
      {
        $lookup: {
          from: "Leads",
          localField: "createByLead",
          foreignField: "_id",
          as: "createByrefLead",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "createBy",
          foreignField: "_id",
          as: "users",
        },
      },
      { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$createByrefLead", preserveNullAndEmptyArrays: true },
      },
      { $match: { "users.deleted": false } },
      {
        $addFields: {
          senderName: { $concat: ["$users.firstName", " ", "$users.lastName"] },
          createdByName: {
            $concat: ["$users.firstName", " ", "$users.lastName"],
          },
          deleted: {
            $cond: [
              { $eq: ["$contact.deleted", false] },
              "$contact.deleted",
              { $ifNull: ["$createByrefLead.deleted", false] },
            ],
          },
          createByName: {
            $cond: {
              if: "$contact",
              then: {
                $concat: [
                  { $ifNull: ["$contact.title", ""] },
                  " ",
                  { $ifNull: ["$contact.firstName", ""] },
                  " ",
                  { $ifNull: ["$contact.lastName", ""] },
                ],
              },
              else: { $ifNull: ["$createByrefLead.leadName", ""] },
            },
          },
        },
      },
      {
        $project: {
          contact: 0,
          createByrefLead: 0,
          users: 0,
        },
      },
    ]);

    res.status(200).json(response[0]);
  } catch (err) {
    console.error("Failed :", err);
    res.status(400).json({ err, error: "Failed " });
  }
};

const deleteData = async (req, res) => {
  try {
    const result = await MeetingHistory.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!result) {
      res.status(404).json({ message: "no Data Found" });
    }

    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (err) {
    console.error("Failed :", err);
    res.status(400).json({ err, error: "Failed " });
  }
};

const deleteMany = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "Invalid or empty ids array" });
    }

    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: `Invalid id format` });
      }
    }

    const result = await MeetingHistory.updateMany(
      { _id: { $in: ids } },
      { deleted: true }
    );

    res.status(200).json({
      message: "Meetings deleted successfully",
      count: result.modifiedCount,
    });
  } catch (err) {
    console.error("Failed :", err);
    res.status(400).json({ err, error: "Failed " });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };
