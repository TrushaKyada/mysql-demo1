module.exports = (sequelize, Sequelize) => {
    const Item_receive = sequelize.define('dispatch_item_receives', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        voucher_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'inventory_ready_to_delivers',
                key: 'id'
            }
        },
        // voucher_name:{
        //     type: Sequelize.STRING,
        //     allowNull: false,
        // },
        godown_name: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'godown_addresses',
                key: 'id'
            }
        },
        receive_date:{
            type:Sequelize.DATEONLY,
            allowNull:false,
            defaultValue:Sequelize.NOW,
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
        tableName: 'dispatch_item_receives',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return Item_receive;

}