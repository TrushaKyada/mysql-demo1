module.exports = (sequelize, Sequelize) => {
    const Mfg_Order_Process = sequelize.define('mfg_order_processes', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        mfg_order_number: {
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
        bom_name: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'formula_datas',
                key: 'id'
            }
        },
        batch_quantity_required: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        bom_quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        expected_quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        godown_area: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'godown_addresses',
                key: 'id'
            }
        },
        status: {
            type: Sequelize.ENUM("Complete", "Processing", "Mixing", "Unit Packing", "Storage", "Raw Material Verification", "Packing && Labeling"),
            // defaultValue: "Processing"
        },
        is_status: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        process_count: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        plane_rvm: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        plane_mixing: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        plane_unit_pkg: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        plane_pkg_lab: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        plane_storage: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        processing_rvm: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        processing_mixing: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        processing_unit_pkg: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        processing_pkg_lab: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        processing_storage: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        mfg_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: Sequelize.NOW,
        },
        exp_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        batch_number: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        mrp: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
        },
        material_location: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'storage_rooms',
                key: 'id'
            }
        },
        actual_quantity: {
            type: Sequelize.INTEGER,
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
        tableName: 'mfg_order_processes',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    // check duplicate entry for mfg_order_number
    Mfg_Order_Process.isExistField = (fieldName, fieldValue) => {
        return Mfg_Order_Process.count({ where: { [fieldName]: fieldValue } }).then(count => {
            if (count != 0) {
                return true;
            }
            return false;
        });
    };
    return Mfg_Order_Process;

}