module.exports = (sequelize, Sequelize) => {
    const Material_receive = sequelize.define('inventory_material_receivers', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        godown_name: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'godown_addresses',
                key: 'id'
            }
        },
        purchase_invoice_number: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'sale_purchase_Invoices',
                key: 'id'
            }
        },
        receive_date:{
          type:Sequelize.DATEONLY,
          allowNull:false,
          defaultValue:Sequelize.NOW,
        },
        is_received: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
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
        tableName: 'inventory_material_receivers',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return Material_receive;

}