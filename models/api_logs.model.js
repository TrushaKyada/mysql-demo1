module.exports = (sequelize, Sequelize) => {
    const apiLogs = sequelize.define('api_logs', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        api_method: {
            type: Sequelize.STRING
        },
        api_url: {
            type: Sequelize.STRING
        },
    }, {
        tableName: 'api_logs'
    })

    return apiLogs
}