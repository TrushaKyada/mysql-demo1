module.exports = (sequelize, Sequelize) => {
    const DeliverItems = sequelize.define('inventory_delivery_items', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        ready_delivery_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'inventory_ready_to_delivers',
                key: 'id'
            }
        },
        item_name: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'item_datas',
                key: 'id'
            }
        },
        available_qty: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        transfer_qty: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        is_deliver: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        tableName: 'inventory_delivery_items',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return DeliverItems;

}