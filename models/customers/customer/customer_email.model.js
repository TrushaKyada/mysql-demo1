module.exports = (sequelize, Sequelize) => {
    const CustomerEmail = sequelize.define('customer_emails', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        customer_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'customer_details',
                key: 'id'
            }
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            // unique:true,
            set(value) {
                this.setDataValue('email', value.toLowerCase());
            }
        },
        is_active:{
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue:true
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
        tableName: 'customer_emails',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
   // check  duplicate Email
   CustomerEmail.isExistField = (fieldName, fieldValue) => {
    return CustomerEmail.count({ where: { [fieldName]: fieldValue } }).then(count => {
        if (count != 0) {
            return true;
        }
        return false;
    });
};

    return CustomerEmail
}