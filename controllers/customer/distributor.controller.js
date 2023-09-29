const db = require('../../config/db.config')


const Distibutor = db.customer_details
const Distibutor_parter = db.customer_parters
const Distibutor_pan = db.customer_pan
const Distibutor_gst = db.customer_gst
const Distibutor_email = db.customer_emails
const Distibutor_addreses = db.customer_address
const Distibutor_bank = db.customer_bank_details
const Distibutor_other = db.customer_other_details
const Validator = require('validatorjs')


const addDistibutor = async (req, res) => {
    let validation = new Validator(req.body, {
        personal_details: 'required',
        partner_details: 'required',
        pan_nums: 'required',
        gst_nums: 'required',
        emails: 'required',
        address: 'required',
        bank_details: 'required',
        other_details: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    const t = await db.sequelize.transaction();
    try {

        const { id: user_id } = req.user
        let { personal_details, partner_details, pan_nums, gst_nums, emails, address: maltiAddress, bank_details, other_details } = req.body

        if (partner_details.length < 1 || pan_nums.length < 1 || gst_nums.length < 1 || emails.length < 1 || maltiAddress.length < 1 || bank_details.length < 1) {
            return RESPONSE.error(res, 5006)
        }

        const isDistributor = await Distibutor.findOne({
            where: { firm_name: personal_details.firm_name }
        })

        if(isDistributor){
            await t.rollback();
            return RESPONSE.error(res, 5008)
        }

        // adding user id to personal details
        personal_details.user_id = user_id

        // creatind distributor details
        const distributor = await Distibutor.create(personal_details, { transaction: t })

        const addDistID = (arr) => {
            return arr.map(item => {
                item.distributor_id = distributor.id
                return item
            })
        }

        // adding distributor id to parter details
        partner_details = addDistID(partner_details)
        // creating partners
        await Distibutor_parter.bulkCreate(partner_details, { transaction: t })

        // adding distributor id to pan numbers
        pan_nums = addDistID(pan_nums)
        // creating pans
        await Distibutor_pan.bulkCreate(pan_nums, { transaction: t })

        // adding distributor id to gst numbers
        gst_nums = addDistID(gst_nums)
        // creating gst
        await Distibutor_gst.bulkCreate(gst_nums, { transaction: t })

        // adding distributor id to email
        emails = addDistID(emails)
        // creating email
        await Distibutor_email.bulkCreate(emails, { transaction: t })

        // adding distributor id to address
        maltiAddress = addDistID(maltiAddress)
        
        // creating address
        await Distibutor_addreses.bulkCreate(maltiAddress, { transaction: t })

        // adding distributor id to bank details
        bank_details = addDistID(bank_details)
        // creating bank details
        await Distibutor_bank.bulkCreate(bank_details, { transaction: t })

        // adding distributor id to other details
        other_details.distributor_id = distributor.id
        // creating other details
        await Distibutor_other.create(other_details, { transaction: t })



        await t.commit();
        return RESPONSE.success(res, 4002)
    } catch (error) {
        await t.rollback();
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}
const allDistibutor = async (req, res) => {
    try {
        const { city, distributor } = req.query
      
        let cityObj = {}
        if (distributor) {
            cityObj.distributor_id = distributor
        }
        if (city) {
            cityObj.city= city
        }
        const distributors = await Distibutor.findAll({
         
            attributes: ['id', 'firm_name'],
            include: [{
                model: Distibutor_addreses,
                where:cityObj,
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'distributor_id', 'id'] }
            }]
        })
        return RESPONSE.success(res, 5005, distributors)
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 9999)
    }
}

module.exports = { addDistibutor, allDistibutor }