module.exports = (sequelize, Sequelize) => {
    const Godown_Address = sequelize.define('godown_addresses', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        godown_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address_type: {
            type: Sequelize.ENUM('All', 'Godown', 'Manufacture'),
            allowNull: false
        },
        address_line_1: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address_line_2: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false
        },
        state: {
            type: Sequelize.STRING,
            allowNull: false
        },
        enter_country: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        postal_code: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
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
        tableName: 'godown_addresses',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return Godown_Address;

}