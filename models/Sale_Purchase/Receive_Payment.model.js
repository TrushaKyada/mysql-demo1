module.exports = (sequelize, Sequelize) => {
    const Received_Payment = sequelize.define('received_payments', {
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
        serial_number: {
            type: Sequelize.STRING,
            allowNull: false
        },
        invoice_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'sale_purchase_Invoices',
                key: 'id'
            }
        },
        payment_id:{
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'sale_purchase_payments',
                key: 'id'
            }
        },
        invoice_payment: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
       date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        // Reference of sale and purchase 0 = sale , 1 = purchase item_for
        item_for: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        total_amount:{
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        write_off: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
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
        tableName: 'received_payments',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return Received_Payment;
}