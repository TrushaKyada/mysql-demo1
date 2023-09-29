module.exports = (sequelize, Sequelize) => {
    const Sale_Purchase_TAX = sequelize.define('sale_purchase_taxes', {
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
        total_gst: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        sgst_rate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        cgst_rate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        sgst_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        cgst_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        igst_rate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        igst_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        taxed_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        discounted_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: "0.00"
        },
        is_return: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        // amount: {
        //     type: new Sequelize.VIRTUAL,
        //     get() {
        //         let igst_amount = this.getDataValue("igst_amount");
        //         let cgst_amount = this.getDataValue("cgst_amount");
        //         let sgst_amount = this.getDataValue("sgst_amount");
        //         let taxed_amount = this.getDataValue("taxed_amount");
        //         if (igst_amount == '0.00') {
        //             amount = (Number(taxed_amount) - (Number(sgst_amount) + Number(cgst_amount))).toFixed(2)
        //         } else {
        //             amount = (Number(taxed_amount - igst_amount)).toFixed(2)
        //         }
        //       return amount
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
        tableName: 'sale_purchase_taxes',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ['deletedAt'] }
        }
    })

    return Sale_Purchase_TAX
}