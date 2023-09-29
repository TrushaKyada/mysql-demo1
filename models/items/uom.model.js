module.exports = (sequelize, Sequelize) => {
    const unit_measurement = sequelize.define('unit_measurementdatas', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        unit_of_measurement: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
            set(value) {
                this.setDataValue('unit_of_measurement', value.toUpperCase());
            }
        },
        uom_fullName: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
            set(value) {
                this.setDataValue('uom_fullName', value.toUpperCase());
            }
        },
        qty_deci_places: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
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
        }
    },
        {
            tableName: 'unit_measurementdatas',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt'] }
            }
        })
    return unit_measurement
}