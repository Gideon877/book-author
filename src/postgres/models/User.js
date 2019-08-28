module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User', {
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    surname: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'Users',
    timestamps: true
  });
};
