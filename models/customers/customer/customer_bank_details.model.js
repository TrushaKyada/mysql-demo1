module.exports = (sequelize, Sequelize) => {
    const CustomerBankDetails = sequelize.define('customer_bank_details', {
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
        bank_name: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        branch_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        bank_account_name: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        bank_account_num: {
            type: Sequelize.STRING,
            allowNull: false
        },
        branch_address: {
            type: Sequelize.TEXT,
            allowNull: false
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
        tableName: 'customer_bank_details',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return CustomerBankDetails
}