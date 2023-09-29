module.exports = (sequelize, Sequelize) => {
    const CustomerOtherDetails = sequelize.define('customer_other_details', {
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
        godown_area: {
            type: Sequelize.STRING,
            allowNull: true
        },
        num_of_salesman: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        num_of_deliveryman: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        num_of_vehicle: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        type_of_vehicle: {
            type: Sequelize.STRING,
            allowNull: true
        },
        price_list_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model:'price_list_details',
                key: 'id'
            }
        },
        credit_limit: {
            type: Sequelize.INTEGER,
            allowNull: true,
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
        tableName: 'customer_other_details',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return CustomerOtherDetails
}