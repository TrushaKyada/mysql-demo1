module.exports = (sequelize, Sequelize) => {
    const RetailCustomer = sequelize.define('retail_customers', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        distributor_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'customer_details',
                key: 'id'
            }
        },
        retailer_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        person_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        retailer_address: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        // party_gst_nu: {
        //     type: Sequelize.STRING,
        //     allowNull: true,
        //     set(value) {
        //         this.setDataValue('party_gst_nu', value.toUpperCase());
        //     }
        // },
        retailer_phone: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        retailer_city: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        isVerified: {
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
        tableName: 'retail_customers',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return RetailCustomer
}