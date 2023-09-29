const db = require('../../../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const GodownArea = db.godown_address
const StorageRoom = db.storage_room
// const RoomData = db.room_data
const Validator = require('validatorjs');


const addRoom = async (req, res) => {
    let validation = new Validator(req.body, {
        godown_id: "required",
        room_number: "required",
        // rack_number: "required",

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body: { godown_id, room_number } } = req
        // check godown
        const IsGodown = await GodownArea.findOne({
            where: { id: godown_id }
        })
        if (!IsGodown) {
            return RESPONSE.error(res, 7305)
        }

        //   Same godown not repeat room
        const checkRoom = await StorageRoom.findOne({
            where: {
                room_number: room_number,
                godown_id: godown_id
            }
        })
        if (checkRoom) {
            return RESPONSE.error(res, 7709)
        }

        // create Material Location
        const StorageData = await StorageRoom.create({ godown_id, room_number });

        return RESPONSE.success(res, 7709, StorageData)
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}


const getRoom = async (req, res) => {
    try {
        const { query: { id, search } } = req
        let conditionWhere = {}
        // let conditionOffset = {};
        // // Pagination
        // const page = Number(req.query.page) || 1;
        // const limit = Number(req.query.limit);
        // const offset = (page - 1) * limit;
        // // Offset condition
        // if (limit && page) {
        //     conditionOffset.limit = limit;
        //     conditionOffset.offset = offset;
        // }
        if (id) {
            conditionWhere.godown_id = id
        }
        // Search By Godown Name and room Name
        // if (search) {
        //     conditionWhere = {
        //         [Op.or]: {
        //             room_number: {
        //                 [Op.like]: `%${search}%`
        //             },
        //             "$godown_address.godown_name$": {
        //                 [Op.like]: `%${search}%`
        //             }

        //         }
        //     }
        // }

        // const StorageRoomData = await StorageRoom.findAndCountAll({
        //     where: conditionWhere,

        //     include: [
        //         {
        //             model: GodownArea,

        //         },
        //         // {
        //         //     model:StorageRoom
        //         // }
        //     ],
        //     attributes: ['id', 'godown_id', 'room_number','is_available'],
        //     order: [['createdAt', 'DESC']],
        //     ...conditionOffset,
        //     distinct: true,

        // })
        const StorageRoomData = await GodownArea.findAll({

            include: [
                {
                    model: StorageRoom,
                    where: conditionWhere,
                }
            ],

            order: [['createdAt', 'DESC']],
            // ...conditionOffset,
            // distinct: true,

        })
        if (id) {
            return RESPONSE.success(res, 7710, FUNCTIONS.transformData(StorageRoomData))
        }

        // let responseData = {
        //     chatData: StorageRoomData.rows,
        //     page_information: {
        //         totalrecords: StorageRoomData.count,
        //         lastpage: Math.ceil(StorageRoomData.count / limit),
        //         currentpage: page,
        //         previouspage: 0 + (page - 1),
        //         nextpage: page < Math.ceil(StorageRoomData.count / limit) ? page + 1 : 0
        //     }
        // };
        return RESPONSE.success(res, 7710, FUNCTIONS.transformData(StorageRoomData))


    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);

    }
}


const updateRoom = async (req, res) => {
    let validation = new Validator(req.query, {
        id: "required",

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id }, body: { room_number, godown_id } } = req
        const IsRoom = await StorageRoom.findOne({
            where: {
                id: id
            }
        })

        if (!IsRoom) {
            return RESPONSE.error(res, 7702)
        }
        // check Godown
        const IsGodown = await GodownArea.findOne({
            where: { id: godown_id }
        })
        if (!IsGodown) {
            return RESPONSE.error(res, 7305)
        }
        //   Same godown not repeat room
        const checkRoom = await StorageRoom.findOne({
            where: {
                room_number: room_number,
                godown_id: godown_id,
                id: {
                    [Op.not]: id,
                },
            }
        })

        if (checkRoom) {
            return RESPONSE.error(res, 7703)
        }

        await IsRoom.update({ room_number, godown_id })
        return RESPONSE.success(res, 7711)
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}


const deleteRoom = async (req, res) => {
    let validation = new Validator(req.query, {
        id: "required",

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id } } = req
        const IsStorageRoom = await StorageRoom.findOne({
            where: {
                id: id
            }
        })
        if (!IsStorageRoom) {
            return RESPONSE.error(res, 7702)
        }
        await IsStorageRoom.destroy({})
        return RESPONSE.success(res, 7712)
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}


module.exports = {
    addRoom,
    getRoom,
    updateRoom,
    deleteRoom
}