const suid = require('rand-token').suid;

module.exports = (sequelize, Sequelize) => {
    const UserSession = sequelize.define('user_sessions',
        {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            token: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            refresh_token: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            expired_at: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false
            },
            deletedAt: {
                field: 'deleted_at',
                type: Sequelize.DATE,
                allowNull: true,
            },
            createdAt: {
                field: 'created_at',
                type: Sequelize.DATE,
                allowNull: true,
            },
            updatedAt: {
                field: 'updated_at',
                type: Sequelize.DATE,
                allowNull: true,
            },
        },
        {
            tableName: 'user_sessions',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt'] }
            }
        }
    );

    // generate token function and save to database
    UserSession.createToken = async function (userId) {
        var userSession = await UserSession.create({
            token: userId + suid(99),
            user_id: userId,
            expired_at: Date.now() + 28 * 24 * 60 * 60 * 1000
        });
        return userSession.token;
    };
    return UserSession;
}

