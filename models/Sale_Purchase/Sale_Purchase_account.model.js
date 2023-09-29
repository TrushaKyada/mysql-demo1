module.exports = (sequelize, Sequelize) => {
    const Sale_Purchase_Account = sequelize.define('sale_purchase_accounts',
        {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            account_name:{
                type: Sequelize.STRING,
                allowNull: false,
            },
            parent_account:{
                type: Sequelize.STRING,
                allowNull: false,
            },
            root_type:{
                type: Sequelize.STRING,
                allowNull: false,
            },
            account_type:{
                type: Sequelize.STRING,
                allowNull: false,
            },
            is_group:{
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
        },
        {
            tableName: 'sale_purchase_accounts',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt', 'password'] }
            }
        }
    );



    return Sale_Purchase_Account;
}