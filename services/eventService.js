const { Event, Participant } = require("../models");
const { Op } = require("sequelize");

const createNewEvent = async (eventData) => {
  try {
    return await Event.create({
      ...eventData,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const fetchEventsByUserEmail = async (userEmail) => {
  try {
    // Find events where the user is either the creator or a participant
    const events = await Event.findAll({
      where: {
        is_deleted: false,
        [Op.or]: [
          { creator_email: userEmail },
          { "$participants.email$": userEmail }, // Look for participant's email
        ],
      },
      include: [
        {
          model: Participant,
          as: "participants",
          attributes: ["name", "email", "rsvp_status"],
          required: false,
        },
      ],
    });

    return events;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const fetchEventById = async (eventId) => {
  try {
    const event = await Event.findOne({
      where: {
        id: eventId,
        is_deleted: false,
      },
      include: [
        {
          model: Participant,
          as: "participants",
        },
      ],
    });

    return event;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
const fetchOnlyEventById = async (eventId) => {
  try {
    return await Event.findOne({
      where: {
        id: eventId,
        is_deleted: false,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const fetchAllEvents = async () => {
  try {
    const events = await Event.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: Participant,
          as: "participants",
        },
      ],
    });
    return events;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const fetchEventByIdAndCreatorEmail = async (eventId, creatorEmail) => {
  try {
    return await Event.findOne({
      where: {
        id: eventId,
        creator_email: creatorEmail,
        is_deleted: false, // Only fetch active events
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const editEvent = async (event, data) => {
  try {
    return await event.update({ ...data });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = {
  createNewEvent,
  fetchEventsByUserEmail,
  fetchEventById,
  fetchAllEvents,
  fetchEventByIdAndCreatorEmail,
  editEvent,
  fetchOnlyEventById,
};
