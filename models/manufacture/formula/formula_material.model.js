module.exports = (sequelize, Sequelize) => {
    const MaterialData = sequelize.define('formula_material_datas', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        formula_id:{
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'formula_datas',
                key: 'id'
            }
        },
        material_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'item_datas',
                key: 'id'
            }
        },
        material_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        material_unit: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        material_quantity:{
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        is_packing:{
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        // is_available:{
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
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
        tableName: 'formula_material_datas',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return MaterialData;

}