module.exports = (sequelize, Sequelize) => {
    const DailyReport = sequelize.define('daily_reports', {
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
        distributor_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'customer_details',
                key: 'id'
            }
        },
        morning_time: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        morning_status: {
            type: Sequelize.STRING,
            set(val) {
                const morning_time = val
                const AM900 = new Date().setHours(9, 0, 0, 0) // 9 AM Today
                const AM915 = new Date().setHours(9, 15, 0, 0) // 9.15 AM Today
                let status;
                if (morning_time < AM900) {
                    status = 'green';
                }
                if (morning_time > AM900 && morning_time < AM915) {
                    status = 'orange';
                }
                if (morning_time > AM915) {
                    status = 'red';
                }
                this.setDataValue('morning_status', status)
            }
        },
        isMorningReportSubmitted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        evening_time: {
            type: Sequelize.DATE,
            allowNull: true
        },
        evening_status: {
            type: Sequelize.STRING,
            set(val) {
                const evening_time = val
                const AM2000 = new Date().setHours(20, 0, 0, 0) // 8 PM Today
                const AM2015 = new Date().setHours(20, 15, 0, 0) // 8.15 PM Today
                let status;
                if (evening_time < AM2000) {
                    status = 'green';
                }
                if (evening_time > AM2000 && evening_time < AM2015) {
                    status = 'orange';
                }
                if (evening_time > AM2015) {
                    status = 'red';
                }
                this.setDataValue('evening_status', status)
            }
        },
        isEveningReportSubmitted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false
        },
        area: {
            type: Sequelize.STRING,
            allowNull: false
        },

        productive_call: {
            type: Sequelize.STRING,
            allowNull: true
        },
        total_call: {
            type: Sequelize.STRING,
            allowNull: true
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
    }, {
        tableName: 'daily_reports',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return DailyReport
}