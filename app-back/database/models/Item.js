let Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('item', {
        description: Sequelize.STRING,
        cost: Sequelize.REAL,
        duration: Sequelize.INTEGER,
        start_date: Sequelize.DATEONLY,
        end_date: Sequelize.DATEONLY
    });
};