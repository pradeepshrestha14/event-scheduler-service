const moment = require("moment-timezone");

// Function to handle recurrence dates generation
const generateRecurrenceDates = (
  startDate,
  endDate,
  recurrenceType,
  endRecurrenceDate
) => {
  const dates = [];
  let currentDate = moment(startDate);
  let currentEndDate = moment(endDate);
  const endRecurrenceDateLimit = moment(endRecurrenceDate);

  while (
    currentDate.isBefore(endRecurrenceDateLimit) &&
    currentEndDate.isBefore(endRecurrenceDateLimit)
  ) {
    if (!dates.length) {
      dates.push({
        start: currentDate.clone().format(),
        end: currentEndDate.clone().format(),
      });
    }
    if (recurrenceType === "monthly") {
      currentDate = currentDate.add(1, "months");
      currentEndDate = currentEndDate.add(1, "months");
    } else if (recurrenceType === "weekly") {
      currentDate = currentDate.add(1, "weeks");
      currentEndDate = currentEndDate.add(1, "weeks");
    } else if (recurrenceType === "daily") {
      currentDate = currentDate.add(1, "days");
      currentEndDate = currentEndDate.add(1, "days");
    }

    if (
      currentDate.isBefore(endRecurrenceDateLimit) &&
      currentEndDate.isBefore(endRecurrenceDateLimit)
    ) {
      dates.push({
        start: currentDate.clone().format(),
        end: currentEndDate.clone().format(),
      });
    }
  }
  return dates;
};

// Helper function for validating start and end times
const validateEventTimes = (start_time, end_time, time_zone) => {
  const startTimeUTC = moment.tz(start_time, time_zone).utc().format();
  const endTimeUTC = moment.tz(end_time, time_zone).utc().format();

  if (moment(startTimeUTC).isSameOrAfter(endTimeUTC)) {
    return { isValid: false, message: "End time must be after start time." };
  }
  return { isValid: true };
};

module.exports = {
  generateRecurrenceDates,
  validateEventTimes,
};
