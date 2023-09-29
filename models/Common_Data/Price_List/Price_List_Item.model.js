module.exports = (sequelize, Sequelize) => {
    const Price_List_Item = sequelize.define('price_list_items', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        price_list_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'price_list_details',
                key: 'id'
            }
        },
        item_name: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'item_datas',
                key: 'id'
            }
        },
        item_name_text: {
            type: Sequelize.STRING,
            allowNull:false
        },
        rate: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        free_scheme: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        discount_scheme: {
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
        },
    }, {
        tableName: 'price_list_items',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return Price_List_Item
}