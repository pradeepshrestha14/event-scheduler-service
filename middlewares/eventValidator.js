const { body, param, validationResult } = require("express-validator");
const moment = require("moment-timezone");

const {
  INVALID_EMAIL_MESSAGE,
  INVALID_EVENT_TITLE_MESSAGE,
  INVALID_START_TIME_MESSAGE,
  INVALID_UTC_START_TIME_MESSAGE,
  INVALID_END_TIME_MESSAGE,
  INVALID_UTC_END_TIME_MESSAGE,

  INVALID_TIMEZONE_MESSAGE,
  INVALID_LOCATION_MESSAGE,
  INVALID_EMAILID_MESSAGE,
  VALID_RSVP_STATUSES,
  RECURRENCE_TYPE_ARRAY,
} = require("../constants/common.constant");

const {
  checkExistingEmails,
  checkNonExistingParticipantidsForEventId,
} = require("../utils/eventValidator");

// Custom validation to check if a date is in UTC
const isUTC = (value) => {
  const date = new Date(value);
  return date.toISOString() === value;
};

const isValidTimeZone = (value) => {
  return !!moment.tz.zone(value);
  //   if (!moment.tz.zone(value)) return false;
  //   // throw new Error("At least one participant is required");
  //   return true;
};

// Custom validator to check that all emails in the participants array are unique
const validateParticipantsEmails = async (participants) => {
  const emails = participants.map((participant) => participant.email);

  // Check for duplicate emails in the request payload
  const emailSet = new Set(emails);
  if (emailSet.size !== emails.length) {
    throw new Error("All participant emails must be unique within the event.");
  }

  return true;
};

// Custom validator to check that all emails in the participants array are unique and not already saved in the database
const validateParticipantsEmailsOnUpdateEvent = async (
  participants,
  { req }
) => {
  const emails = participants.map((participant) => participant.email);

  // Check for duplicate emails in the request payload
  const emailSet = new Set(emails);
  if (emailSet.size !== emails.length) {
    throw new Error("All participant emails must be unique within the event.");
  }

  // Check if any of the emails already exist in the database
  const existingEmails = await checkExistingEmails(
    emails,
    req?.params?.event_id
  );
  if (existingEmails.length > 0) {
    throw new Error(
      `The following emails are already participant for this event: ${existingEmails.join(
        ", "
      )}`
    );
  }

  return true;
};

const validateParticipantsToRemoveWithDatabase = async (
  participantIds,
  { req }
) => {
  // Check for duplicate emails in the request payload
  const idSet = new Set(participantIds);
  if (idSet.size !== participantIds.length) {
    throw new Error(
      "All participant ids must be unique for the removal from event."
    );
  }
  // Check if any of the emails already exist in the database
  const nonExistingParticipantIds =
    await checkNonExistingParticipantidsForEventId(
      participantIds,
      req?.params?.event_id
    );
  if (nonExistingParticipantIds.length > 0) {
    throw new Error(
      `The following participant ids are not participant for this event: ${nonExistingParticipantIds.join(
        ", "
      )}`
    );
  }

  return true;
};

// Middleware for request validation using express-validator for createEvent api
const validateCreateEventPayload = [
  body("creator_email").isEmail().withMessage(INVALID_EMAIL_MESSAGE),
  body("country")
    .isString()
    .withMessage("country should be of string type")
    .notEmpty()
    .withMessage("Country is required"),
  body("title")
    .isLength({ min: 5, max: 150 })
    .withMessage(INVALID_EVENT_TITLE_MESSAGE),
  body("start_time")
    .isISO8601()
    .withMessage(INVALID_START_TIME_MESSAGE)
    .custom(isUTC)
    .withMessage(INVALID_UTC_START_TIME_MESSAGE),
  body("end_time")
    .isISO8601()
    .withMessage(INVALID_END_TIME_MESSAGE)
    .custom(isUTC)
    .withMessage(INVALID_UTC_END_TIME_MESSAGE),
  body("time_zone")
    .isString()
    .withMessage(INVALID_TIMEZONE_MESSAGE)
    .notEmpty()
    .withMessage("Time zone is required")
    .custom(isValidTimeZone)
    .withMessage(INVALID_TIMEZONE_MESSAGE),
  body("location").optional().isString().withMessage(INVALID_LOCATION_MESSAGE),
  body("recurrence_end_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid recurrence end date format")
    .custom(isUTC)
    .withMessage(
      "recurrence_end_date must be in UTC format e.g. 2024-11-06T06:15:00.000Z"
    ),
  body("event_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage(INVALID_EMAILID_MESSAGE),
  body("participants")
    .isArray({ min: 1 })
    .withMessage("Participants should be a non-empty array")
    .custom(validateParticipantsEmails),
  body("participants.*.email")
    .isEmail()
    .withMessage("Invalid participant email format"),
  body("participants.*.name")
    .isString()
    .withMessage("Participant name must be a string"),
  body("recurrence_type")
    .optional()
    .isIn(RECURRENCE_TYPE_ARRAY)
    .withMessage(
      "recurrence_type must be one of 'daily', 'weekly' or 'monthly'"
    ), // Enum validation
];

// "recurrence_type": "daily"
// "recurrence_end_date": "2024-11-17T11:15:00.000Z"

// Middleware to validate event_id in param
const validateEventId = [
  param("event_id").isInt({ min: 1 }).withMessage(INVALID_EMAILID_MESSAGE),
];

// Middleware for request validation in updateEvent api
const validateEventEditPayload = [
  body("creator_email")
    .notEmpty()
    .withMessage("creator_email is required")
    .isEmail()
    .withMessage(INVALID_EMAIL_MESSAGE),
  body("country").notEmpty().withMessage("country is required"),
  body("title")
    .optional()
    .isLength({ min: 5, max: 150 })
    .withMessage(INVALID_EVENT_TITLE_MESSAGE),
  body("start_time")
    .optional()
    .isISO8601()
    .withMessage(INVALID_START_TIME_MESSAGE)
    .custom(isUTC)
    .withMessage(INVALID_UTC_START_TIME_MESSAGE),
  body("end_time")
    .optional()
    .isISO8601()
    .withMessage(INVALID_END_TIME_MESSAGE)
    .custom(isUTC)
    .withMessage(INVALID_UTC_END_TIME_MESSAGE),
  body("time_zone")
    .optional()
    .isString()
    .withMessage(INVALID_TIMEZONE_MESSAGE)
    .custom(isValidTimeZone)
    .withMessage(INVALID_TIMEZONE_MESSAGE),
  body("location").optional().isString().withMessage(INVALID_LOCATION_MESSAGE),
  param("event_id").isInt({ min: 1 }).withMessage(INVALID_EMAILID_MESSAGE),
  body("participantsToAdd")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Participants should be a non-empty array")
    .custom(validateParticipantsEmailsOnUpdateEvent),
  body("participantsToAdd.*.email")
    .isEmail()
    .withMessage("Invalid participant email format"),
  body("participants.*.name")
    .isString()
    .withMessage("Participant name must be a string"),
  body("participantsToRemove")
    .optional()
    .isArray()
    .withMessage("Participants should be an array of participants' ids")
    .custom(validateParticipantsToRemoveWithDatabase)
    .custom((value) => {
      // Check if each item in the array is a number greater than 0
      for (const id of value) {
        if (typeof id !== "number" || id <= 0) {
          throw new Error(
            "Each participant ID must be a number greater than 0"
          );
        }
      }

      return true;
    }),
];

// Middleware for request validation in getEventsByUserEmailPayload api
const validateEventsByUserEmailPayload = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage(INVALID_EMAIL_MESSAGE),
];

// Middleware for request validation in deleteEvent api
const validateDeleteEventPayload = [
  param("event_id").isInt({ min: 1 }).withMessage(INVALID_EMAILID_MESSAGE),
  body("creator_email")
    .notEmpty()
    .withMessage("creator_email is required")
    .isEmail()
    .withMessage(INVALID_EMAIL_MESSAGE),
];

// Middleware for request validation in rsvpToEven api
const validateRsvpToEventPayload = [
  param("event_id").isInt({ min: 1 }).withMessage(INVALID_EMAILID_MESSAGE),
  body("email")
    .notEmpty()
    .withMessage("Participant's email is required")
    .isEmail()
    .withMessage(INVALID_EMAIL_MESSAGE),
  body("rsvp_status")
    .exists({ checkFalsy: true })
    .withMessage("RSVP status is required")
    .isIn(VALID_RSVP_STATUSES)
    .withMessage(
      "RSVP status must be one of 'declined', 'accepted', or 'pending'"
    ), // Enum validation
];

// Middleware/Helper-Function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = {
  validateEventId,
  handleValidationErrors,
  validateEventEditPayload,
  validateCreateEventPayload,
  validateDeleteEventPayload,
  validateRsvpToEventPayload,
  validateEventsByUserEmailPayload,
};
