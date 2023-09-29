module.exports = (sequelize, Sequelize) => {
    const CustomerPartners = sequelize.define('customer_partners', {
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
        partner_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        partner_mobile: {
            type: Sequelize.STRING,
            allowNull: false,
            // unique:true
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
        tableName: 'customer_partners',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
   // check  duplicate phone number
   CustomerPartners.isExistField = (fieldName, fieldValue) => {
    return CustomerPartners.count({ where: { [fieldName]: fieldValue } }).then(count => {
        if (count != 0) {
            return true;
        }
        return false;
    });
};

    return CustomerPartners
}