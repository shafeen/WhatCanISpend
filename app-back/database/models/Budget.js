let Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('budget', {
        name: Sequelize.STRING,
        amount: Sequelize.REAL
    });
};