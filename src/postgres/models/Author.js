module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Author', {
    // email: {
    //   type: DataTypes.TEXT,
    //   allowNull: true
    // },
    authorId: {
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
    }
  }, {
      tableName: 'Authors',
      timestamps: true
    });
}
