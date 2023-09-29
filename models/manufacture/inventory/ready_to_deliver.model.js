module.exports = (sequelize, Sequelize) => {
    const Ready_to_Deliver = sequelize.define('inventory_ready_to_delivers', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        voucher_number: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'sale_purchase_serialNos',
                key: 'id'
            }
        },
        serial_number:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        godown_area: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'godown_addresses',
                key: 'id'
            }
        },
        is_deliver:{
            type:Sequelize.BOOLEAN,
            allowNull:false,
            defaultValue:false
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
        tableName: 'inventory_ready_to_delivers',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return Ready_to_Deliver;

}