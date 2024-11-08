const { Event } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment-timezone");

const { fetchEventById } = require("../services/eventService");
const {
  COUNTRIES_WITH_LIMITED_EVENT,
} = require("../constants/common.constant");

// Helper function to check for overlapping events
const checkForOverlappingEvent = async (event, creator_email) => {
  return await Event.findOne({
    where: {
      creator_email,
      is_deleted: false,
      [Op.or]: [
        {
          start_time: { [Op.lt]: event.endTimeUTC },
          end_time: { [Op.gt]: event.startTimeUTC },
        },
      ],
    },
  });
};

// Helper function to check event limit for certain countries
const checkEventLimitForCountry = async (event, creator_email, country) => {
  if (COUNTRIES_WITH_LIMITED_EVENT.includes(country)) {
    const startOfWeek = moment
      .tz(event.startTimeUTC, event.time_zone)
      .startOf("week")
      .utc()
      .format();

    const existingEventsCount = await Event.count({
      where: {
        creator_email,
        start_time: { [Op.gte]: startOfWeek },
        is_deleted: false,
      },
    });

    if (existingEventsCount >= 3) {
      return {
        isLimitReached: true,
        message: `Event creation limit reached for ${country}. Only 3 events per week allowed.`,
      };
    }
  }
  return { isLimitReached: false };
};

const checkExistingEmails = async (emails, eventId) => {
  const event = await fetchEventById(eventId);
  const associatedEmails = event?.participants.map((itm) => itm?.email);
  return emails.filter((email) => associatedEmails.includes(email));
};

const checkNonExistingParticipantidsForEventId = async (
  participantIds,
  eventId
) => {
  const event = await fetchEventById(eventId);
  const associatedParticipantIds = event?.participants.map((itm) => itm?.id);
  return participantIds.filter(
    (pId) => !associatedParticipantIds.includes(pId)
  );
};

module.exports = {
  checkForOverlappingEvent,
  checkEventLimitForCountry,
  checkExistingEmails,
  checkNonExistingParticipantidsForEventId,
};
