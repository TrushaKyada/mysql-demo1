module.exports = (sequelize, Sequelize) => {
    const serial_Number = sequelize.define('sale_purchase_serialNos', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        prefix: {
            type: Sequelize.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('prefix', value.toUpperCase());
            }
        },
        reference_type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        start: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        last_number:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        number_length: {
            type: Sequelize.INTEGER,
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
        tableName: 'sale_purchase_serialNos',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return serial_Number
}