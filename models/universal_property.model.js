module.exports = (sequelize, Sequelize) => {
    const universal_Property = sequelize.define('universal_propertys', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        // unit start
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
            defaultValue: null
        },
        // unit stop
        // category start
        stock_category: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        parent_category: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
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
            tableName: 'universal_propertys',
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ['deletedAt'] }
            }
        })
    return universal_Property
}