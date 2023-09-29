const bcrypt = require('bcryptjs')

module.exports = (sequelize, Sequelize) => {
    const Admin = sequelize.define('admin',
        {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                set(value) {
                    this.setDataValue('email', value.toLowerCase());
                }
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
                set(value) {
                    this.setDataValue('password', bcrypt.hashSync(value, 10));
                }
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            mobile_number: {
                type: Sequelize.BIGINT.UNSIGNED,
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
            tableName: 'admin',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt', 'password'] }
            },
            scopes: {
                withPassword: {
                    attributes: { exclude: ['deletedAt'] },
                }
            }

        })

        // compare password function for admin login

    Admin.comparePassword = (adminPassword, hashedPassword) => bcrypt.compareSync(adminPassword, hashedPassword)

    return Admin;
}