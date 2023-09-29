module.exports = (sequelize, Sequelize) => {
    const Sale_Purchase_Payment = sequelize.define('sale_purchase_payments', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        // customer_id: {
        //     type: Sequelize.BIGINT.UNSIGNED,
        //     allowNull: false,
        //     references: {
        //         model: 'customer_details',
        //         key: 'id'
        //     }
        // },
        number_series: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'sale_purchase_serialNos',
                key: 'id'
            }
        },
        serial_number: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // invoice_id:{
        //     type: Sequelize.BIGINT.UNSIGNED,
        //     allowNull: true,
        //     references: {
        //         model: 'sale_purchase_Invoices',
        //         key: 'id'
        //     }
        // },
        party: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'customer_details',
                key: 'id'
            }
        },
        payment_type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        posting_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        from_account: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'sale_purchase_accounts',
                key: 'id'
            }
        },
        to_account: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'sale_purchase_accounts',
                key: 'id'
            }
        },
        payment_method: {
            type: Sequelize.STRING,
            allowNull: false
        },
        clearance_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        cheque_no: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        ref_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        amount: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        write_off: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        // Reference of sale and purchase 0 = sale , 1 = purchase item_for
        item_for: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        is_submitted: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        is_cancel: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
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
        tableName: 'sale_purchase_payments',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return Sale_Purchase_Payment;
}