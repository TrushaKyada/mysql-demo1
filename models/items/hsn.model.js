module.exports = (sequelize, Sequelize) => {
    const hsn = sequelize.define('hsn_datas',{
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        // user_id: {
        //     type: Sequelize.BIGINT.UNSIGNED,
        //     allowNull: false,
        //     references: {
        //         model: 'users',
        //         key: 'id'
        //     }
        // },
        hsn_code:{
            type:Sequelize.INTEGER,
            allowNull:false
        },
        hsn_description:{
            type:Sequelize.TEXT,
            allowNull:false
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
        tableName: 'hsn_datas',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    });
    return hsn;
}