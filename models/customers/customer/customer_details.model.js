module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define('customer_details', {
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
        // Reference of sale and purchase 0 = sale , 1 = purchase item_for
        item_for: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        firm_name: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        firm_type: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        incepted: {
            type: Sequelize.STRING,
            allowNull: true
        },
        outstanding_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        role: {
            type: Sequelize.STRING,
            allowNull: false
        },
        sales_person: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        currency: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'sale_purchase_currencys',
                key: 'id'
            }
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
        // delivery_address: {
        //     type: Sequelize.BIGINT.UNSIGNED,
        //     allowNull: true,
        //     references: {
        //         model: 'godown_addresses',
        //         key: 'id'
        //     }
        // },
        account: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'sale_purchase_accounts',
                key: 'id'
            }
        },
        credit_note: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        payment_day: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        landline_num_1: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        landline_num_2: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        is_verified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        tableName: 'customer_details',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    // check  duplicate landline number
    Customer.isExistField = (fieldName, fieldValue) => {
        return Customer.count({ where: { [fieldName]: fieldValue } }).then(count => {
            if (count != 0) {
                return true;
            }
            return false;
        });
    };
    return Customer
}