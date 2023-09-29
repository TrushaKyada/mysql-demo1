module.exports = (sequelize, Sequelize) => {
    const CustomerGST = sequelize.define('customer_gsts', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        customer_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'customer_details',
                key: 'id'
            }
        },
        gst_num: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue : null
        },
        is_active:{
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue:true
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
        tableName: 'customer_gsts',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return CustomerGST
}