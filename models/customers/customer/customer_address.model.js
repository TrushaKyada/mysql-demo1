// module.exports = (sequelize, Sequelize) => {
//     const DistibutorAddress = sequelize.define('distributor_address', {
//         id: {
//             type: Sequelize.BIGINT.UNSIGNED,
//             allowNull: false,
//             autoIncrement: true,
//             primaryKey: true
//         },
//         distributor_id: {
//             type: Sequelize.BIGINT.UNSIGNED,
//             allowNull: false,
//             references: {
//                 model: 'distibutor_details',
//                 key: 'id'
//             }
//         },
//         address: {
//             type: Sequelize.TEXT,
//             allowNull: false
//         },
//         landmark: {
//             type: Sequelize.STRING,
//             allowNull: true
//         },
//         pin_code: {
//             type: Sequelize.STRING,
//             allowNull: false
//         },
//         city:{
//             type: Sequelize.STRING,
//             allowNull: false
//         },
//         state: {
//             type: Sequelize.STRING,
//             allowNull: false
//         },
//         deletedAt: {
//             field: 'deleted_at',
//             type: Sequelize.DATE,
//             allowNull: true,
//         },
//         createdAt: {
//             field: 'created_at',
//             type: Sequelize.DATE,
//             allowNull: true,
//         },
//         updatedAt: {
//             field: 'updated_at',
//             type: Sequelize.DATE,
//             allowNull: true,
//         },

//     }, {
//         tableName: 'distributor_address',
//         paranoid: true,
//         defaultScope: {
//             attributes: { exclude: ['deletedAt'] }
//         }
//     })

//     return DistibutorAddress
// }
module.exports = (sequelize, Sequelize) => {
    const customerAddress = sequelize.define('customer_address', {
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
        // address_key:{
        //     type: Sequelize.INTEGER,
        //     allowNull: false,
        // },
        type_of_address: {
            type: Sequelize.ENUM('Both', 'Billing Address', 'Shipping Address'),
            allowNull: false
        },
        address_name: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        address_line_1: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        address_line_2: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false
        },
        state: {
            type: Sequelize.STRING,
            allowNull: false
        },
        postal_code: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        country: {
            type: Sequelize.STRING,
            allowNull: false,

        },
        place_of_supply: {
            type: Sequelize.STRING,
            allowNull: false,

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
        tableName: 'customer_address',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return customerAddress
}