let Sequelize = require('sequelize');

module.exports = function (sequelize) {
    let BudgetType = sequelize.define('budget_type', {
        name: Sequelize.STRING
    });

    let Budget = sequelize.define('budget', {
        name: Sequelize.STRING,
        amount: Sequelize.REAL
    });

    Budget.belongsTo(BudgetType);

    let Item = sequelize.define('item', {
        description: Sequelize.STRING,
        cost: Sequelize.REAL,
        duration: Sequelize.INTEGER,
        start_date: Sequelize.DATEONLY,
        end_date: Sequelize.DATEONLY
    });

    Budget.hasMany(Item);

    return sequelize.sync();
};