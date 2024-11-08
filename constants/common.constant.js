const INVALID_EMAIL_MESSAGE = "Invalid email format";
const INVALID_EVENT_TITLE_MESSAGE =
  "Title should be between 5 and 150 characters";
const INVALID_START_TIME_MESSAGE = "Invalid start time format";
const INVALID_UTC_START_TIME_MESSAGE =
  "start_time must be in UTC format e.g. 2024-11-06T06:15:00.000Z";
const INVALID_END_TIME_MESSAGE = "Invalid end time format";
const INVALID_UTC_END_TIME_MESSAGE =
  "end_time must be in UTC format e.g. 2024-11-06T06:15:00.000Z";
const INVALID_TIMEZONE_MESSAGE =
  "Time zone should be a valid standard timezone string ";
const INVALID_LOCATION_MESSAGE = "Location must be a string";
const INVALID_EMAILID_MESSAGE = "Event ID must be a valid number";
const VALID_RSVP_STATUSES = ["accepted", "declined", "pending"];
const COUNTRIES_WITH_LIMITED_EVENT = ["Japan", "India"];
const RECURRENCE_TYPE_ARRAY = ["daily", "weekly", "monthly"];

module.exports = {
  VALID_RSVP_STATUSES,
  INVALID_EMAIL_MESSAGE,
  INVALID_EVENT_TITLE_MESSAGE,
  INVALID_START_TIME_MESSAGE,
  INVALID_UTC_START_TIME_MESSAGE,
  INVALID_END_TIME_MESSAGE,
  INVALID_UTC_END_TIME_MESSAGE,
  INVALID_TIMEZONE_MESSAGE,
  INVALID_LOCATION_MESSAGE,
  INVALID_EMAILID_MESSAGE,
  COUNTRIES_WITH_LIMITED_EVENT,
  RECURRENCE_TYPE_ARRAY,
};
