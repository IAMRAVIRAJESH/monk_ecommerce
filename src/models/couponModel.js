const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const CouponSchema = sequelize.define(
  "coupon",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discount_details: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    conditioning: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = { CouponSchema };
