const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  getEventsByUserEmail,
} = require("../controllers/eventController");

const {
  handleValidationErrors,
  validateCreateEventPayload,
  validateEventId,
  validateEventEditPayload,
  validateEventsByUserEmailPayload,
  validateDeleteEventPayload,
  validateRsvpToEventPayload,
} = require("../middlewares/eventValidator");

//  API 1: POST route: create event/recurring events
router.post(
  "/create",
  validateCreateEventPayload, // Validation middleware
  handleValidationErrors, // Error handler middleware ,
  createEvent
);

//  API 2: GET route: fetch all active events
router.get("/", getAllEvents);

// API 3: GET route: fetch event by ID
router.get("/:event_id", validateEventId, handleValidationErrors, getEventById);

// API 4: POST route: for participant's RSVP to event by id
router.post(
  "/:event_id/rsvp",
  validateRsvpToEventPayload,
  handleValidationErrors,
  rsvpToEvent
);

// API 5: PUT route:  update an event by ID
router.put(
  "/:event_id",
  validateEventEditPayload,
  handleValidationErrors,
  updateEvent
);

// API 6: POST route:  fetch all events by user email as host or participant
router.post(
  "/events-by-user-email/",
  validateEventsByUserEmailPayload,
  handleValidationErrors,
  getEventsByUserEmail
);

// API 7: PUT route:  soft-delete event by id
router.put(
  "/:event_id/delete",
  validateDeleteEventPayload,
  handleValidationErrors,
  deleteEvent
);

module.exports = router;
