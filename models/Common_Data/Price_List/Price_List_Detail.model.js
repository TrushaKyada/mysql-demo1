module.exports = (sequelize, Sequelize) => {
    const Price_List_Details = sequelize.define('price_list_details', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        price_list_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        is_price_enable: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        for_sale: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        for_purchase: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
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
        tableName: 'price_list_details',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return Price_List_Details
}