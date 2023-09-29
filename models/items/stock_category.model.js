module.exports = (sequelize, Sequelize) => {
    const stockCategory = sequelize.define('stock_category_datas', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        parent_id: {
            type: Sequelize.BIGINT.UNSIGNED,
        },
        Category: {
            type: Sequelize.STRING,
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
        }
    },
        {
            tableName: 'stock_category_datas',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt'] }
            }
        })
    return stockCategory;
}