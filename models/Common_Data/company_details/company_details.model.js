module.exports = (sequelize, Sequelize) => {
    const Price_List_Details = sequelize.define('company_details', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        for: {
            type: Sequelize.STRING,
            allowNull: false
        },
        company_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        company_address: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        contact_number: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        website: {
            type: Sequelize.STRING,
            allowNull: false
        },
        gstin_uin: {
            type: Sequelize.STRING,
            allowNull: false
        },
        gstin_cin: {
            type: Sequelize.STRING,
            allowNull: false
        },
        footer_1: {
            type: Sequelize.STRING,
            allowNull: false
        },
        footer_2: {
            type: Sequelize.STRING,
            allowNull: false
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
        tableName: 'company_details',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return Price_List_Details
}