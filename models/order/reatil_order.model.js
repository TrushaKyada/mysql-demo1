module.exports = (sequelize, Sequelize) => {
    const RetailOrder = sequelize.define('retail_order', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        order_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
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
        },
        retailer_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'retail_customers',
                key: 'id'
            }
        },
        total_price: {
            type: Sequelize.DECIMAL(10, 2),
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

    }, {
        tableName: 'retail_orders',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return RetailOrder
}