module.exports = (sequelize, Sequelize) => {
    const formulaData = sequelize.define('formula_datas', {
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
        bom_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        finish_product_name: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'item_datas',
                key: 'id'
            }
        },
        unit_of_measurement: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'unit_measurementdatas',
                key: 'id'
            }
        },
        // bill_of_material: {
        //     type: Sequelize.BIGINT.UNSIGNED,
        //     allowNull: false,
        //     references: {
        //         model: 'formula_material_datas',
        //         key: 'id'
        //     }
        // },
        // packing_of_material: {
        //     type: Sequelize.BIGINT.UNSIGNED,
        //     allowNull: false,
        //     references: {
        //         model: 'formula_material_datas',
        //         key: 'id'
        //     }
        // },
        batch_prefix: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        batch_size: {
            type: Sequelize.FLOAT,
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
        tableName: 'formula_datas',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return formulaData;

}