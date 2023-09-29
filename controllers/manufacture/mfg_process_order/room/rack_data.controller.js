const db = require('../../../../config/db.config')
const { Sequelize, Op } = require('sequelize');
const GodownArea = db.godown_address
const StorageRoom = db.storage_room
// const RoomData = db.room_data
const Validator = require('validatorjs');


const addRack = async (req, res) => {
    let validation = new Validator(req.body, {
        // godown_id: "required",
        // room_id: "required",
        rack_number: "required",

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { body: { /*godown_id,*/ room_id, rack_number } } = req
        // check godown
        // if (godown_id) {
        //     const IsGodown = await GodownArea.findOne({
        //         where: { id: godown_id }
        //     })
        //     if (!IsGodown) {
        //         return RESPONSE.error(res, 7305)
        //     }
        // }
        // check room
        const IsRoom = await StorageRoom.findOne({
            where: { id: room_id }
        })
        if (!IsRoom) {
            return RESPONSE.error(res, 7702)
        }
        //  check Rack 
        const checkRack = await StorageRoom.findOne({
            where: {
                rack_number: rack_number,
                room_id: room_id,
            }
        })
        if (checkRack) {
            return RESPONSE.error(res, 7703)
        }

        // create Material Location
        const StorageData = await StorageRoom.create({ room_id, rack_number });

        return RESPONSE.success(res, 7704, StorageData)

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}

// const getRack = async (req, res) => {
//     try {
//         const { query: { id, search ,godown_id} } = req
//         let conditionWhere = {}
//         let conditionOffset = {};
//         // Pagination
//         const page = Number(req.query.page) || 1;
//         const limit = Number(req.query.limit);
//         const offset = (page - 1) * limit;
//         // // Offset condition
//         // if (limit && page) {
//         //     conditionOffset.limit = limit;
//         //     conditionOffset.offset = offset;
//         // }
//         if (id) {
//             // conditionWhere.id  = id
//             conditionWhere = {
//                 [Op.or]: [{ id: id }, { room_id: id }]
//             }
//         }
//         if (godown_id) {
//             // conditionWhere.godown_id  = godown_id
//             conditionWhere = {
//                 [Op.or]: [{ id: id }, { room_id: id },{godown_id:godown_id}]
//             }
//         }
//         // Search By Godown Name and room Name
//         // if (search) {
//         //     conditionWhere = {
//         //         [Op.or]: {
//         //             // room_name: {
//         //             //     [Op.like]: `%${search}%`
//         //             // },
//         //             rack_number: {
//         //                 [Op.like]: `%${search}%`
//         //             },
//         //             // "$godown_address.godown_name$": {
//         //             //     [Op.like]: `%${search}%`
//         //             // }

//         //         }
//         //     }
//         // }
//         // const StorageRoomData = await StorageRoom.findAll({
//         //     where: conditionWhere,
//         //     include: [
//         //         {
//         //             model: StorageRoom,
//         //             as: "room_data",
//         //             include: [
//         //                 {
//         //                     model: GodownArea,
//         //                 },
//         //             ]

//         //         }
//         //     ],
//         //     attributes: ['id', 'room_id', 'rack_number', 'is_available'],
//         //     order: [['createdAt', 'DESC']],
//         //     // ...conditionOffset,
//         //     distinct: true,

//         // })
//         const StorageRoomData = await StorageRoom.findAll({
//             where: conditionWhere,
//             include: [
//                 {
//                     model: GodownArea,
//                 },
//             ],
//             order: [['createdAt', 'DESC']],
//             ...conditionOffset,
//             distinct: true,

//         })

//         const getNestedComments = (arr, mainArr) => {
//             let replyArr = [];

//             for (let i of arr) {
//                 // Convert the Sequelize model to a plain JSON object
//                 i = i.toJSON();

//                 // Initialize the reply array for the current room data
//                 i['rack_data'] = [];

//                 for (let j of mainArr) {
//                     if (i.id === j.room_id) {
//                         i['rack_data'].push(j);
//                     }
//                 }

//                 replyArr.push(i);
//             }

//             return replyArr;
//         };

//         let mainComments = StorageRoomData.filter(item => item.room_id === null)
//         let response = getNestedComments(mainComments, StorageRoomData)

//         if (id) {
//             return RESPONSE.success(res, 7005, FUNCTIONS.transformData(response))
//         }

//         // let responseData = {
//         //     chatData: StorageRoomData.rows,
//         //     page_information: {
//         //         totalrecords: StorageRoomData.count,
//         //         lastpage: Math.ceil(StorageRoomData.count / limit),
//         //         currentpage: page,
//         //         previouspage: 0 + (page - 1),
//         //         nextpage: page < Math.ceil(StorageRoomData.count / limit) ? page + 1 : 0
//         //     }
//         // };
//         return RESPONSE.success(res, 7005, FUNCTIONS.transformData(response))
//     } catch (error) {
//         console.log(error);
//         return RESPONSE.error(res, 9999);

//     }
// }
const getRack = async (req, res) => {
    try {
        const { query: { id, godown_id } } = req
        let conditionWhere = {}

        if (id) {
            conditionWhere = { id }

        }
        if (godown_id) {
            conditionWhere = { godown_id: godown_id }
        }
        const roomDatas = await StorageRoom.findAll({

            where: conditionWhere,
            order: [['createdAt', 'DESC']],

        })
        let roomIds = roomDatas.map(item => item.id)
        let rackData = await StorageRoom.findAll({

            where: { room_id: { [Op.in]: roomIds } },

        }).then((data) => {
            return data.map(item => item.toJSON())
        })
        let response = roomDatas.map(item => {
            item = item.toJSON();
            item.rack_data = rackData.filter(i => item.id == i.room_id)
            return item;
        })

        if (id) {
            return RESPONSE.success(res, 7705, FUNCTIONS.transformData(response))
        }

        return RESPONSE.success(res, 7705, FUNCTIONS.transformData(response))
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);

    }
}
const editRack = async (req, res) => {
    let validation = new Validator(req.query, {
        id: "required",

    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { query: { id }, body: { room_id, rack_number } } = req
        // check room
        const IsRoom = await StorageRoom.findOne({
            where: { id: room_id }
        })
        if (!IsRoom) {
            return RESPONSE.error(res, 7702)
        }
        const IsStorageRoom = await StorageRoom.findOne({
            where: {
                id: id
            }
        })
        if (!IsStorageRoom) {
            return RESPONSE.error(res, 7701)
        }

        //  check Rack 
        const checkRack = await StorageRoom.findOne({
            where: {
                rack_number: rack_number,
                room_id: room_id,
                id: {
                    [Op.not]: id
                }
            }
        })
        if (checkRack) {
            return RESPONSE.error(res, 7703)
        }
        await IsStorageRoom.update({ room_id, rack_number })
        return RESPONSE.success(res, 7706)
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}
const deleteRack = async (req, res) => {
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
            return RESPONSE.error(res, 7701)
        }
        await IsStorageRoom.destroy({})
        return RESPONSE.success(res, 7707)
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 9999);
    }
}
module.exports = {
    addRack,
    getRack,
    editRack,
    deleteRack
}