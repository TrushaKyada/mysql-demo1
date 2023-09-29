module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define('products', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        product_name: {
            type: Sequelize.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('product_name', value.toUpperCase());
            }
        },
        product_mrp: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        product_quantity: {
            type: Sequelize.INTEGER,
        },
        retail_price: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        distributor_price: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        distributor_moq: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        status: {
            type: Sequelize.BOOLEAN,
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
        tableName: 'products',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return Product
}