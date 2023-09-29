module.exports = (sequelize, Sequelize) => {
    const Sale_Purchase_Invoice = sequelize.define('sale_purchase_Invoices', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        number_series: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'sale_purchase_serialNos',
                key: 'id'
            }
        },
        // Reference of sale and purchase 0 = sale , 1 = purchase item_for
        item_for: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        serial_number: {
            type: Sequelize.STRING,
            allowNull: false
        },
        invoice_number: {
            type: Sequelize.STRING,
            allowNull: true
        },
        is_order: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        is_cancel: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        order_reference: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            defaultValue: null,
            references: {
                model: 'sale_purchase_Invoices',
                key: 'id'
            }
        },
        payment_status: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        payment_received: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        party: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'customer_details',
                key: 'id'
            }
        },
        sales_person: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        account: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'sale_purchase_accounts',
                key: 'id'
            }
        },
        payment_day: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        billing_address: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'customer_address',
                key: 'id'
            }
        },
        shipping_address: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'customer_address',
                key: 'id'
            }
        },
        delivery_address: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'godown_addresses',
                key: 'id'
            }
        },
        purchase_invoice_number: {
            type: Sequelize.STRING,
            allowNull: true
        },
        purchase_manager: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        cash_discount: {
            type: Sequelize.STRING,
            allowNull: true
        },
        price_list_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'price_list_details',
                key: 'id'
            }
        },
        internal_notes: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        delivery_notes: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        is_submitted: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        is_return: {
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
        tableName: 'sale_purchase_Invoices',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return Sale_Purchase_Invoice
}