module.exports = (sequelize, Sequelize) => {
    const Sale_Purchase_TAXTotal = sequelize.define('sale_purchase_taxes_totals', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        invoice_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'sale_purchase_Invoices',
                key: 'id'
            }
        },
        customer_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'customer_details',
                key: 'id'
            }
        },
        total_igst_rate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        total_sgst_rate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        total_cgst_rate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        total_igst_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        total_sgst_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        total_cgst_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        // status_key:{
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        // },
        total_gst_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        total_gst_rate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        grant_total: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: "0.00"
        },
        total_discount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: "0.00"
        },
        total_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: "0.00"
        },
        round_off: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: "0.00"
        },
        is_return: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        // total_amount: {
        //     type: new Sequelize.VIRTUAL,
        //     get() {
        //         let total_igst_amount = this.getDataValue('total_igst_amount')
        //         let total_cgst_amount = this.getDataValue('total_cgst_amount')
        //         let total_sgst_amount = this.getDataValue('total_sgst_amount')
        //         let grant_total = this.getDataValue('grant_total')
        //         let round_off = this.getDataValue('round_off')
        //         let amount = 0
        //         if (total_igst_amount == '0.00') {
        //             amount = ((Number(grant_total) + Number(round_off)) - Number(total_cgst_amount).toFixed(2) - Number(total_sgst_amount)).toFixed(2)
        //         } else {
        //             amount = ((Number(grant_total)+ Number(round_off)) - Number(total_igst_amount)).toFixed(2)
        //         }
        //         // amount = Number(amount)

        //         return amount;
        //     }
        // },
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
        tableName: 'sale_purchase_taxes_totals',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return Sale_Purchase_TAXTotal
}