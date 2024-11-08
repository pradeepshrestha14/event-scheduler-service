module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define("Participant", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rsvp_status: {
      type: DataTypes.ENUM("accepted", "declined", "pending"),
      defaultValue: "pending",
      allowNull: false,
    },
    event_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Events",
        key: "id",
      },
    },
  });

  Participant.associate = (models) => {
    Participant.belongsTo(models.Event, { foreignKey: "event_id" });
  };

  return Participant;
};
