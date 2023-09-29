const bcrypt = require('bcryptjs')
const config = require('../../config/config')
module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define('users',
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
                    this.setDataValue('password',FUNCTIONS.encryptPassword(value));
                },
                get() {
                    const val = this.getDataValue('password')
                    return FUNCTIONS.decryptedPassword(val)
                }
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            role: {
                type: Sequelize.STRING,
                allowNull: false
            },
            mobile_number: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            profile_image: {
                type: Sequelize.STRING,
                allowNull: true,
                get() {
                    const val = this.getDataValue('profile_image')
                    return val ? `${config.host}images/profile_images/${val}` : null
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
            tableName: 'users',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt', 'password'] }
            },
            scopes: {
                withPassword: {
                    attributes: { exclude: ['deletedAt'] }
                },
            }
        }
    );

    // check  duplicate user 
    Users.isExistField = (fieldName, fieldValue) => {
        return Users.count({ where: { [fieldName]: fieldValue } }).then(count => {
            if (count != 0) {
                return true;
            }
            return false;
        });
    };

    // compare password function for admin login
    Users.comparePassword = (userPassword, hashedPassword) => bcrypt.compareSync(userPassword, hashedPassword)

    return Users;
}
