module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Category', {
    categoryId: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
      tableName: 'Categories',
      timestamps: true
    });
}
