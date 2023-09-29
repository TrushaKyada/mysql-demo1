module.exports = (sequelize, Sequelize) => {
  const Item_stock = sequelize.define(
    'item_stocks',
    {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      available_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      mfg_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      item_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'item_datas',
          key: 'id'
        }
      },
      item_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mfg_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: Sequelize.NOW
      },
      exp_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      batch_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      unit_of_measurement: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'unit_measurementdatas',
          key: 'id'
        }
      },
      deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true
      },
      updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'item_stocks',
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['deletedAt'] }
      }
    }
  )

  // check duplicate entry for mfg_order_number
  //   Mfg_Order_Process.isExistField = (fieldName, fieldValue) => {
  //     return Mfg_Order_Process.count({ where: { [fieldName]: fieldValue } }).then(
  //       count => {
  //         if (count != 0) {
  //           return true
  //         }
  //         return false
  //       }
  //     )
  //   }
  return Item_stock
}
