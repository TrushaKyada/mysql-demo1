// Add item module
module.exports = (sequelize, Sequelize) => {
    const Sale_Purchase_Item = sequelize.define('sale_purchase_items',
        {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            customer_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'customer_details',
                    key: 'id'
                }
            },
            invoice_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'sale_purchase_Invoices',
                    key: 'id'
                }
            },
            item_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'item_datas',
                    key: 'id'
                }
            },
            // Reference of sale and purchase 0 = sale , 1 = purchase item_for
            item_for: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            item_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            tax: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null
            },
            account: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null
            },
            stock_unit: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'unit_measurementdatas',
                    key: 'id'
                }
            },
            hsn: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'hsn_datas',
                    key: 'id'
                }
            },
            billing_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            shipping_quantity: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
            rate: {
                type: Sequelize.FLOAT,
                allowNull: true,
                defaultValue: 0
            },
            mrp: {
                type: Sequelize.FLOAT,
                allowNull: true,
                default: 0
            },
            net_rate: {
                type: Sequelize.FLOAT,
                allowNull: true,
                defaultValue: 0
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: "0.00"
            },
            taxed_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: "0.00"
            },
            discount_scheme: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null
            },
            free_scheme: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null
            },
            scheme_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            // quantity: {
            //     type: Sequelize.INTEGER,
            //     allowNull: true
            // },
            // cost_per_qty: {
            //     type: Sequelize.INTEGER,
            //     allowNull: true
            // },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: null
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
        },
        {
            tableName: 'sale_purchase_items',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt', 'password'] }
            }
        }
    );



    return Sale_Purchase_Item;
}