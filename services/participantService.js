const { Participant } = require("../models");

const createNewParticipant = async (participantData) => {
  return await Participant.create({
    ...participantData,
  });
};

const fetchParticipantByEmailAndEventId = async (email, eventId) => {
  return await Participant.findOne({
    where: { email, event_id: eventId },
  });
};
const fetchParticipantsByEventId = async (eventId) => {
  return await Participant.findAll({
    where: { event_id: eventId },
  });
};

module.exports = {
  createNewParticipant,
  fetchParticipantByEmailAndEventId,
  fetchParticipantsByEventId,
};
