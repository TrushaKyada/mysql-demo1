module.exports = (sequelize, Sequelize) => {
    const Sale_Purchase_Currency = sequelize.define('sale_purchase_currencys',
        {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            currency_name:{
                type: Sequelize.STRING,
                allowNull: false,
            },
            symbol:{
                type: Sequelize.STRING,
                allowNull: false,
                set(value) {
                    this.setDataValue('symbol', value.toUpperCase());
                }
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
            tableName: 'sale_purchase_currencys',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt', 'password'] }
            }
        }
    );



    return Sale_Purchase_Currency;
}