let Sequelize = require('sequelize');

module.exports = function (sequelize) {
    let BudgetType = require('./database/models/BudgetType')(sequelize);

    let Budget = require('./database/models/Budget')(sequelize);

    Budget.belongsTo(BudgetType);

    let Item = require('./database/models/Item')(sequelize);

    Budget.hasMany(Item);

    return sequelize.sync().then(() => {
        return {
            BudgetType: BudgetType,
            Budget: Budget,
            Item: Item
        }
    });
};