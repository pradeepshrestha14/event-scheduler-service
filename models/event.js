module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define("Event", {
    creator_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 150],
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    start_time_local: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_time_local: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time_zone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recurrence_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    recurrence_type: {
      type: DataTypes.ENUM("daily", "weekly", "monthly"),
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Event.associate = (models) => {
    Event.hasMany(models.Participant, {
      foreignKey: "event_id",
      as: "participants",
    });
  };

  return Event;
};
