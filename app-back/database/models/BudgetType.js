let Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('budget_type', {
        name: Sequelize.STRING
    });
};