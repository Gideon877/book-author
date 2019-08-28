module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Book', {
    bookId: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    authorId:{
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
      tableName: 'Books',
      timestamps: true
    });
}
