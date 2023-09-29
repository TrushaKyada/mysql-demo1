const suid = require('rand-token').suid;

module.exports = (sequelize, Sequelize) => {
    const AdminSession = sequelize.define('admin_sessions',
        {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            admin_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'admin',
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
            tableName: 'admin_sessions',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt', 'password'] }
            }
        }
    );

    // generate token function and save to database
    AdminSession.createToken = async function (adminId) {
        const adminSession = await AdminSession.create({
            token: adminId + suid(99),
            admin_id: adminId,
            expired_at: Date.now() + 28 * 24 * 60 * 60 * 1000
        });
        return adminSession.token;
    };

    return AdminSession;
}

