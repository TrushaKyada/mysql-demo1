module.exports = (sequelize, Sequelize) => {
    const Transporter_Details = sequelize.define('transporter_details', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        transfer_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        transfer_address: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        mobile_number: {
            type: Sequelize.STRING,
            allowNull: false
        },
        gst: {
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
        tableName: 'transporter_details',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
// check  duplicate user 
Transporter_Details.isExistField = (fieldName, fieldValue) => {
    return Transporter_Details.count({ where: { [fieldName]: fieldValue } }).then(count => {
        if (count != 0) {
            return true;
        }
        return false;
    });
};
    return Transporter_Details
}