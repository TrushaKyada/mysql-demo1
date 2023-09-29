const db = require('../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const Item_data = db.item_data
const Godown_Name = db.godown_address
const Storage_Room = db.storage_room
const Validator = require('validatorjs')

const getRackManagement = async (req, res) => {
    try {
        const { id, search } = req.query;
        let conditionOffset = {};

        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit);
        const offset = (page - 1) * limit;

        // Offset condition
        if (limit && page) {
            conditionOffset.limit = limit;
            conditionOffset.offset = offset;
        }
        const Rackdata = await Item_data.findAndCountAll({
            where: {
                ...(id) && { id },
                ...(search) && {
                    [Op.or]: {
                        item_name: {
                            [Op.like]: `%${search}%`
                        },
                        "$godown_address.godown_name$": {
                            [Op.like]: `%${search}%`
                        }

                    },

                },
                item_for: {[Op.in]:[0,2]}
            },
            attributes: ['id', 'item_name', 'godown_name', 'material_location', 'item_for'],
            include: [
                {
                    model: Godown_Name
                },
                {
                    model: Storage_Room,
                    include: [
                        {
                            model: Storage_Room,
                            as: "rack_data"
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            ...conditionOffset,
            distinct: true,

        })
        if (id) {
            return RESPONSE.success(res, 7801, FUNCTIONS.transformData(Rackdata.rows));
        }

        let responseData = {
            chatData: Rackdata.rows,
            page_information: {
                totalrecords: Rackdata.count,
                lastpage: Math.ceil(Rackdata.count / limit),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(Rackdata.count / limit) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, 7801, FUNCTIONS.transformData(responseData))
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

const updateRackManagement = async (req, res) => {
    let validation = new Validator(req.query, {
        id: "required"
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id }, body: { godown_name, material_location } } = req
        // check Rack data
        const RackDataManagmebnt = await Item_data.findOne({
            where: {
                id: id,
                item_for: { [Op.in]: [0, 2] }
            }
        })
        if (!RackDataManagmebnt) {
            return RESPONSE.error(res, 7803)
        }

        // check godowm 
        const checkGodown = await Godown_Name.findOne({
            where: { id: godown_name }
        });
        if (!checkGodown) {
            return RESPONSE.error(res, 7305)
        }
        // check godowm 
        const checkStorageRoom = await Storage_Room.findOne({
            where: { id: material_location }
        });
        if (!checkStorageRoom) {
            return RESPONSE.error(res, 7601)
        }

        await RackDataManagmebnt.update({ godown_name, material_location })

        return RESPONSE.success(res, 7802)

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

module.exports = {
    getRackManagement,
    updateRackManagement
}
