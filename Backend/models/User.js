const { sequelize } = require("./index");
const { DataTypes } = require('sequelize');

const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    prenom: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    cin: {
        type: DataTypes.CHAR(8),
        allowNull: false,
        unique: true,
    },
    telephone: {
        type: DataTypes.CHAR(8),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('agent', 'admin'),
        defaultValue: 'agent',
    },
}, {
    timestamps: true, 
    tableName: 'users', 
    underscored: true, 
});

module.exports = { User };
