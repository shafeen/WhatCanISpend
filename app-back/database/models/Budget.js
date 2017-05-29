let Sequelize = require('sequelize');

// TODO: consider using the paranoid option
module.exports = (sequelize) => {
    return sequelize.define('budget', {
        name: Sequelize.STRING,
        amount: Sequelize.REAL
    });
};