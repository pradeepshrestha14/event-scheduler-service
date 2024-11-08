const { Op } = require("sequelize");
const moment = require("moment-timezone");

const { Participant } = require("../models");

const {
  generateRecurrenceDates,
  validateEventTimes,
} = require("../utils/timeHelper");

const {
  checkForOverlappingEvent,
  checkEventLimitForCountry,
} = require("../utils/eventValidator");

const {
  createNewEvent,
  fetchEventsByUserEmail,
  fetchEventById,
  fetchAllEvents,
  fetchEventByIdAndCreatorEmail,
  editEvent,
  fetchOnlyEventById,
} = require("../services/eventService");

const {
  createNewParticipant,
  fetchParticipantByEmailAndEventId,
  fetchParticipantsByEventId,
} = require("../services/participantService");

// create event/recurring events
const createEvent = async (req, res) => {
  try {
    const {
      creator_email,
      title,
      description,
      start_time,
      end_time,
      time_zone,
      location,
      participants,
      recurrence_type,
      recurrence_end_date,
      country,
    } = req.body;

    // Validation: "end_time should be greater than start_time"
    const timeValidation = validateEventTimes(start_time, end_time, time_zone);
    if (!timeValidation.isValid) {
      return res
        .status(400)
        .json({ success: false, error: timeValidation.message });
    }

    // single event to be created
    let allEvents = [
      {
        startTimeUTC: moment.tz(start_time, time_zone).utc().format(),
        endTimeUTC: moment.tz(end_time, time_zone).utc().format(),
        startTimeLocal: moment
          .tz(start_time, time_zone)
          .format("YYYY-MM-DD HH:mm:ss"),
        endTimeLocal: moment
          .tz(end_time, time_zone)
          .format("YYYY-MM-DD HH:mm:ss"),
        time_zone,
      },
    ];

    // Recurrence handling and recurring events creation
    const isRecuringEvents = recurrence_type && recurrence_end_date;

    if (isRecuringEvents) {
      const recurrenceDates = generateRecurrenceDates(
        moment.tz(start_time, time_zone).utc().format(),
        moment.tz(end_time, time_zone).utc().format(),
        recurrence_type,
        moment.tz(recurrence_end_date, time_zone).utc().format()
      );

      allEvents = recurrenceDates.map((dates) => {
        return {
          startTimeUTC: moment.tz(dates?.start, time_zone).utc().format(),
          endTimeUTC: moment.tz(dates?.end, time_zone).utc().format(),
          startTimeLocal: moment
            .tz(dates?.start, time_zone)
            .format("YYYY-MM-DD HH:mm:ss"),
          endTimeLocal: moment
            .tz(dates?.end, time_zone)
            .format("YYYY-MM-DD HH:mm:ss"),
          time_zone,
        };
      });
    } else if (recurrence_type || recurrence_end_date) {
      return res.status(400).json({
        success: false,
        message:
          "for recurrence event,both recurrence_type and recurrence_end_date are required",
      });
    }

    // validations and creation of single event(if isRecuringEvents=false) or recurring events (if isRecuringEvents=true)
    let eventsData = [];
    for (const event of allEvents) {
      // validation: Check if end time is after start time
      const timeValidation = validateEventTimes(
        event.startTimeUTC,
        event.endTimeUTC,
        time_zone
      );
      if (!timeValidation.isValid) {
        eventsData.push({
          success: false,
          error: timeValidation.message,
          eventData: event,
        });
        continue;
      }

      // validation: Validate for overlapping events in the same timezone
      const overlappingEvent = await checkForOverlappingEvent(
        event,
        creator_email
      );
      if (overlappingEvent) {
        eventsData.push({
          success: false,
          error:
            "This event overlaps with an existing event in the user's schedule.",
          conflicts: overlappingEvent,
          eventData: event,
        });
        continue;
      }

      //validation: Check event limit for specific countries
      const eventLimitCheck = await checkEventLimitForCountry(
        event,
        creator_email,
        country
      );
      if (eventLimitCheck.isLimitReached) {
        eventsData.push({
          success: false,
          error: eventLimitCheck.message,
          eventData: event,
        });
        continue;
      }

      // create event if all good
      const newEvent = await createNewEvent({
        creator_email,
        country,
        title,
        description,
        start_time: event?.startTimeUTC,
        end_time: event?.endTimeUTC,
        time_zone,
        location,
        start_time_local: event?.startTimeLocal,
        end_time_local: event?.endTimeLocal,
        recurrence_type,
        recurrence_end_date,
      });

      // Create participants for the created event
      const participantPromises = participants.map((participant) => {
        const { name, email } = participant;
        return createNewParticipant({
          event_id: newEvent.id, // Associate participant with the created event
          name,
          email,
        });
      });

      const createdParticipants = await Promise.all(participantPromises); // Wait for all participants to be created

      eventsData.push({
        success: true,
        message: "Event created successfully!",
        event: newEvent,
        participants: createdParticipants,
      });
      continue;
    }

    // response for recurring event creation
    if (isRecuringEvents) {
      return res.status(201).json({
        message: "Recurring Events Responses",
        events: eventsData,
      });
    }

    // response for single-event-creation when {success:false}
    if (eventsData.length && eventsData[0].success === false) {
      return res.status(400).json(eventsData.length && eventsData[0]);
    }

    // response for single-event-creation when {success:true}
    return res.status(201).json(eventsData.length && eventsData[0]);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error?.message, error });
  }
};

// fetch all events by user email as host or participant
const getEventsByUserEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find events where the user is either the creator or a participant
    const events = await fetchEventsByUserEmail(email);
    if (!events.length) {
      return res.status(404).json({
        success: false,
        message: "No events found for the specified user.",
      });
    }

    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving events." });
  }
};

// fetch event by ID
const getEventById = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Find the event by ID with is_deleted set to false
    const event = await fetchEventById(event_id);

    // If the event doesn't exist or is deleted
    if (!event) {
      return res
        .status(404)
        .json({ error: "Event not found or has been deleted" });
    }

    return res.status(200).json({ success: true, event });
  } catch (error) {
    console.error("Error fetching event:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the event" });
  }
};

// fetch all active events for admins
const getAllEvents = async (req, res) => {
  try {
    // Fetch all events where is_deleted is false, including participants
    const events = await fetchAllEvents();

    return res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ error: "An error occurred while fetching events" });
  }
};

// soft-delete event by id
const deleteEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { creator_email } = req.body;

    if (!creator_email) {
      return res.status(400).json({ error: "Creator email is required" });
    }

    // Find the event by ID and check the creator email
    const event = await fetchEventByIdAndCreatorEmail(event_id, creator_email);

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found or already deleted, or you are not the creator",
      });
    }

    // Soft delete the event by setting isDeleted to true
    editEvent(event, { is_deleted: true });

    res.status(200).json({
      success: true,
      message: "Event deleted successfully (soft delete)",
      event,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the event" });
  }
};

// update an event by ID
const updateEvent = async (req, res) => {
  const { event_id } = req.params;
  const {
    creator_email,
    country,
    title,
    description,
    start_time,
    end_time,
    time_zone,
    location,
    participantsToAdd, // Array of participants to add
    participantsToRemove, // Array of participant IDs to remove
  } = req.body;

  try {
    // Find the event by ID
    const event = await fetchOnlyEventById(event_id);

    // Check if the event exists
    if (!event) {
      return res
        .status(404)
        .json({ success: false, error: "Event not found." });
    }

    // Check if the request is coming from the creator of the event
    if (event.creator_email !== creator_email || event.country !== country) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to edit this event.",
        creator_email,
        country,
      });
    }

    // Validate start and end times
    if (start_time || end_time) {
      const startTimeUTC = moment.tz(start_time, time_zone).utc().format();
      const endTimeUTC = moment.tz(end_time, time_zone).utc().format();

      if (moment(startTimeUTC).isSameOrAfter(endTimeUTC)) {
        return res
          .status(400)
          .json({ error: "End time must be after start time." });
      }
    }

    let startTimeUTC;
    let endTimeUTC;
    let startTimeLocal;
    let endTimeLocal;
    if (start_time || end_time) {
      startTimeUTC = start_time
        ? moment.tz(start_time, time_zone).utc().format()
        : event.start_time;
      endTimeUTC = end_time
        ? moment.tz(end_time, time_zone).utc().format()
        : event.end_time;

      startTimeLocal = moment
        .tz(startTimeUTC, time_zone)
        .format("YYYY-MM-DD HH:mm:ss");
      endTimeLocal = moment
        .tz(endTimeUTC, time_zone)
        .format("YYYY-MM-DD HH:mm:ss");

      // Run validation only if time fields are provided
      if (moment(startTimeUTC).isSameOrAfter(endTimeUTC)) {
        return res
          .status(400)
          .json({ error: "End time must be after start time." });
      }
    }

    // Update the event details
    await editEvent(event, {
      title,
      description,
      start_time: startTimeUTC,
      end_time: endTimeUTC,
      time_zone,
      location,
      start_time_local: startTimeLocal,
      end_time_local: endTimeLocal,
    });

    // Add new participants if provided
    if (participantsToAdd && participantsToAdd.length > 0) {
      const newParticipants = participantsToAdd.map((participant) => ({
        name: participant?.name,
        email: participant?.email,
        event_id: event.id,
      }));
      await Participant.bulkCreate(newParticipants);
    }

    // Remove participants if IDs are provided
    if (participantsToRemove && participantsToRemove.length > 0) {
      await Participant.destroy({
        where: {
          id: { [Op.in]: participantsToRemove },
          event_id: event.id,
        },
      });
    }

    // Fetch updated participants
    const updatedParticipants = await fetchParticipantsByEventId(event?.id);

    // Respond with the updated event data
    return res.status(200).json({
      message: "Event updated successfully!",
      event: {
        ...event.toJSON(),
        participants: updatedParticipants,
      },
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the event." });
  }
};

// participant's RSVP to event by id
const rsvpToEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { email, rsvp_status } = req.body;

    // Check if the event exists
    const event = await fetchOnlyEventById(event_id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Check if the participant exists
    const participant = await fetchParticipantByEmailAndEventId(
      email,
      event_id
    );

    if (!participant) {
      return res.status(404).json({
        error: `No participant found with email ${email} for event ID ${event_id}.`,
      });
    }

    // Update the RSVP status for the participant
    participant.rsvp_status = rsvp_status;
    await participant.save();

    // Send success response with participant details
    res.status(200).json({
      message: "RSVP updated successfully",
      event,
      participant: {
        id: participant.id,
        email: participant.email,
        event_id: participant.event_id,
        rsvp_status: participant.rsvp_status,
      },
    });
  } catch (error) {
    console.error("Error handling RSVP:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the RSVP status." });
  }
};

module.exports = {
  createEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  getEventsByUserEmail,
  rsvpToEvent,
  deleteEvent,
};
