module.exports = (sequelize, Sequelize) => {
    const Shipment = sequelize.define('shipment', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        number_Series: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'dispatch_item_receives',
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
        transfer_quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        item_location: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'storage_rooms',
                key: 'id'
            }
        },
        receive_quantity:{
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        // is_deliver: {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: false
        // },
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
        tableName: 'shipment',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return Shipment;

}