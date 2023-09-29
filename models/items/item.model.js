// Edit Item module
module.exports = (sequelize, Sequelize) => {
    const items_data = sequelize.define('item_datas', {
        // Common Field
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
        material_location: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'storage_rooms',
                key: 'id'
            }
        },
        godown_name: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'godown_addresses',
                key: 'id'
            }
        },
        item_code: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        item_name: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        item_short_name: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        invoice_description: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        unit_quantity: {
            type: Sequelize.DECIMAL(10, 4),
            allowNull: true,
            defaultValue: null,
        },
        cost_per_qty: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        unit_of_measurement: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'unit_measurementdatas',
                key: 'id'
            }
        },
        tax_category: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        hsn: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'hsn_datas',
                key: 'id'
            }
        },
        // mfg_date: {
        //     type: Sequelize.DATEONLY,
        //     allowNull: true,
        // },
        exp_time: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        mrp: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: null
        },
        parent_category: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'stock_category_datas',
                key: 'id'
            }
        },
        stock_category: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'stock_category_datas',
                key: 'id'
            }
        },
        item_status: {
            type: Sequelize.BOOLEAN,
            defaultValue: null
        },
        discount_scheme: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        // Reference of sale and purchase 0 = sale , 1 = purchase item_for
        item_for: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        manage_inventory: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        rate: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: null
        },
        // Finished
        // pack_of: {
        //     type: Sequelize.STRING,
        //     allowNull: true,
        // },
        min_mfg_qty: {
            type: Sequelize.INTEGER,
            allowNull: true,
            ddefaultValue: null
        },
        mfg_time_days: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
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
        scheme_valid_by_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        // min_sale_rate: {
        //     type: Sequelize.FLOAT,
        //     allowNull: true,
        //     defaultValue: null
        // },
        batch_prefix: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        // standard_cost: {
        //     type: Sequelize.FLOAT,
        //     allowNull: true,
        //     defaultValue: null
        // },
        current_cost: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: null
        },
        barcode: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        // retail_price: {
        //     type: Sequelize.FLOAT,
        //     allowNull: true,
        //     defaultValue: null
        // },
        // distributor_price: {
        //     type: Sequelize.FLOAT,
        //     allowNull: true,
        //     defaultValue: null
        // },
        distributor_moq: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        // Raw Material
        min_order_qty: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        order_turnaround_time: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        last_purchase_rate: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: null
        },
        preferred_vendor: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        // deliver_to: {
        //     type: Sequelize.STRING,
        //     allowNull: true,
        //     defaultValue: null
        // },
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
        tableName: 'item_datas',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return items_data;

}