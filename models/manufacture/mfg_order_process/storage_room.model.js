const { STRING } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const Storage_Room = sequelize.define('storage_rooms', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        // Added for room
        godown_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'godown_addresses',
                key: 'id'
            }
        },
        room_number: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        // Added Rack in room
        room_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'storage_rooms',
                key: 'id'
            }
        },
        rack_number: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        is_available: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
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
        tableName: 'storage_rooms',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })
    return Storage_Room;

}