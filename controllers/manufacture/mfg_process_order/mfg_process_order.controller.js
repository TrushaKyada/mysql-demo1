const db = require('../../../config/db.config')
const { Sequelize, Op } = require('sequelize')
const Item_data = db.item_data
const SerialNo_data = db.Sale_Purchase_serialNo
const mfgProcessOrder = db.mfg_order_process
const godownAddress = db.godown_address
const Formula = db.formula
const Formula_Material = db.formula_material
const MaterialLocation = db.storage_room
const unit_measurement = db.unit_measurement
const Item_Stock = db.Item_stock
const Validator = require('validatorjs')

const addMfgOrderProcess = async (req, res) => {
  let validation = new Validator(req.body, {})
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      body: {
        mfg_order_number,
        serial_number,
        bom_name,
        batch_quantity_required,
        bom_quantity,
        expected_quantity,
        godown_area /* item_planning, IsMfgProcessOrder */
      }
    } = req

    // Check bom number
    const IsBomName = await Formula.findOne({
      where: {
        id: bom_name
      },
      include: [
        {
          model: Formula_Material,
          as: 'bill_of_material',
          required: false,
          where: {
            is_packing: false
          }
        },
        {
          model: Formula_Material,
          as: 'packing_of_material',
          required: false,
          where: {
            is_packing: true
          }
        }
      ]
    })
    if (!IsBomName) {
      return RESPONSE.error(res, 7401)
    }
    // Check Serial Number
    const findnumberSRId = await SerialNo_data.findOne({
      where: {
        id: mfg_order_number
      }
    })
    if (!findnumberSRId) {
      return RESPONSE.error(res, 8208)
    }
    // Check Godown Address
    const IsGodownAddress = await godownAddress.findOne({
      where: {
        id: godown_area
      }
    })
    if (!IsGodownAddress) {
      return RESPONSE.error(res, 7305)
    }
    // // check mfg_order_number
    // if (await mfgProcessOrder.isExistField('mfg_order_number', mfg_order_number)) {
    //     return RESPONSE.error(res, 7402)
    // }
    // Check if serial number is repeated within the same mfg_order_number
    const duplicateSerialNumber = await mfgProcessOrder.findOne({
      where: {
        mfg_order_number: mfg_order_number,
        serial_number: serial_number
      }
    })

    if (duplicateSerialNumber) {
      return RESPONSE.error(res, 8209)
    }

    const MfgProcessData = await mfgProcessOrder.create({
      mfg_order_number,
      serial_number,
      bom_name,
      batch_quantity_required,
      bom_quantity,
      expected_quantity,
      godown_area,
      status: 'Raw Material Verification',
      process_count: 1 /* ...item_planning, ...item_process*/
    })

    // Update last_number field
    const serialNumberParts = MfgProcessData.serial_number.split('-')[1]
    const numericPart = parseInt(serialNumberParts)
    if (isNaN(numericPart)) {
      return RESPONSE.error(res, 8210)
    }

    const updatedSerialNumber = await SerialNo_data.update(
      { last_number: numericPart },
      {
        where: { id: findnumberSRId.id }
      }
    )
    if (!updatedSerialNumber) {
      return RESPONSE.error(res, 8208)
    }
    return RESPONSE.success(res, 7403, {
      id: MfgProcessData.id,
      Bill_of_material: IsBomName
    })
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

const getMfgOrderProcess = async (req, res) => {
  let validation = new Validator(req.body, {})
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      query: { id, search, status }
    } = req
    let conditionWhere = {}
    let conditionOffset = {}

    // Pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit)
    const offset = (page - 1) * limit
    if (id) {
      conditionWhere.id = id
    }
    // Offset condition
    if (limit && page) {
      conditionOffset.limit = limit
      conditionOffset.offset = offset
    }
    if (search) {
      conditionWhere = {
        [Op.or]: {
          serial_number: {
            [Op.like]: `%${search}%`
          },
          batch_number: {
            [Op.like]: `%${search}%`
          },
          '$Bill_of_material.item_data.item_name$': {
            [Op.like]: `%${search}%`
          },
          '$Bill_of_material.bom_name$': {
            [Op.like]: `%${search}%`
          }
        }
      }
    }
    switch (status) {
      case 'Complete':
        conditionWhere.status = 'Complete'
        break
      case 'Processing':
        conditionWhere.status = {
          [Op.in]: [
            'Raw Material Verification',
            'Mixing',
            'Unit Packing',
            'Packing && Labeling',
            'Storage'
          ]
        }
        break
    }
    const MfgProcessDataCount = await mfgProcessOrder
      .findAndCountAll({
        where: conditionWhere,
        include: [
          {
            model: Formula,
            as: 'Bill_of_material',
            attributes: [
              'id',
              'bom_name',
              'batch_prefix',
              'batch_size',
              'createdAt',
              'updatedAt'
            ],
            include: [
              {
                model: Formula_Material,
                as: 'bill_of_material',
                required: false,
                where: {
                  is_packing: false
                },
                attributes: ['id', 'material_name', 'material_quantity'],
                include: [
                  {
                    model: Item_data,
                    attributes: [
                      'id',
                      'item_name',
                      'godown_name',
                      'material_location'
                    ],
                    include: [
                      {
                        model: godownAddress,
                        attributes: ['id', 'godown_name']
                      },
                      {
                        model: MaterialLocation,
                        include: [
                          {
                            model: MaterialLocation,
                            as: 'rack_data'
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                model: Formula_Material,
                as: 'packing_of_material',
                required: false,
                where: {
                  is_packing: true
                },
                attributes: ['id', 'material_name', 'material_quantity'],
                include: [
                  {
                    model: Item_data,
                    attributes: [
                      'id',
                      'item_name',
                      'godown_name',
                      'material_location'
                    ],
                    include: [
                      {
                        model: godownAddress,
                        attributes: ['id', 'godown_name']
                      },
                      {
                        model: MaterialLocation,
                        include: [
                          {
                            model: MaterialLocation,
                            as: 'rack_data'
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                model: Item_data,
                attributes: [
                  'id',
                  'item_name',
                  'exp_time',
                  'batch_prefix',
                  'mfg_time_days',
                  'mrp',
                  'unit_quantity',
                  'godown_name',
                  'material_location'
                ],
                include: [
                  {
                    model: unit_measurement,
                    as: 'unitofmeasurement',
                    attributes: [
                      'id',
                      'unit_of_measurement',
                      'uom_fullName',
                      'qty_deci_places'
                    ]
                  }
                  // {
                  //     model: godownAddress,
                  //     attributes: ['id', 'godown_name']
                  // },
                  // {
                  //     model: MaterialLocation,
                  //     include: [
                  //         {
                  //             model: MaterialLocation,
                  //             as: "rack_data"
                  //         }
                  //     ]
                  // },
                ]
              }
            ]
          },
          {
            model: godownAddress,
            as: 'GodownArea'
          },
          {
            model: SerialNo_data
          }
          // {
          //     model: MaterialLocation,
          //     as: 'Material_location'
          // }
        ],
        order: [['createdAt', 'DESC']],
        ...conditionOffset,
        distinct: true
      })
      .then(result => {
        result.rows = result.rows.map(item => {
          item = item.toJSON()

          // Global Function
          item.Bill_of_material.item_data.unit_quantity =
            FUNCTIONS.decimalPointSplit(
              item?.Bill_of_material?.item_data?.unit_quantity,
              item?.Bill_of_material?.item_data?.unitofmeasurement
                ?.qty_deci_places
            )
          delete item?.Bill_of_material.item_data.unitofmeasurement
          item.Bill_of_material.bill_of_material =
            item.Bill_of_material.bill_of_material.map(data => {
              let item_quantity = Number(
                item.Bill_of_material.item_data.unit_quantity
              )
              data.material_quantity = Number(
                Number(item?.bom_quantity) * Number(data?.material_quantity)
              )
              data.is_available =
                data.material_quantity > item_quantity ? true : false
              return data
            })
          item.Bill_of_material.packing_of_material =
            item.Bill_of_material.packing_of_material.map(data => {
              let item_quantity = Number(
                item.Bill_of_material.item_data.unit_quantity
              )
              data.material_quantity = Number(
                Number(item?.bom_quantity) * Number(data?.material_quantity)
              )
              data.is_available =
                data.material_quantity > item_quantity ? true : false
              return data
            })
          item.item_planning = {
            plane_rvm: item.plane_rvm,
            plane_mixing: item.plane_mixing,
            plane_unit_pkg: item.plane_unit_pkg,
            plane_pkg_lab: item.plane_pkg_lab,
            plane_storage: item.plane_storage
          }
          item.item_processing = {
            processing_rvm: item.processing_rvm,
            processing_mixing: item.processing_mixing,
            processing_unit_pkg: item.processing_unit_pkg,
            processing_pkg_lab: item.processing_pkg_lab,
            processing_storage: item.processing_storage,
            mfg_date: item.mfg_date,
            exp_date: item.exp_date,
            batch_number: item.batch_number,
            mrp: item.mrp,
            material_location: item.material_location,
            actual_quantity: item.actual_quantity
          }
          delete item.plane_rvm
          delete item.plane_mixing
          delete item.plane_unit_pkg
          delete item.plane_pkg_lab
          delete item.plane_storage
          delete item.processing_rvm
          delete item.processing_mixing
          delete item.processing_unit_pkg
          delete item.processing_pkg_lab
          delete item.processing_storage
          delete item.mfg_date
          delete item.exp_date
          delete item.batch_number
          delete item.mrp
          delete item.material_location
          delete item.actual_quantity
          return item
        })
        return result
      })

    if (id) {
      return RESPONSE.success(res, 7404, MfgProcessDataCount.rows)
    }
    let responseData = {
      chatData: MfgProcessDataCount.rows,
      page_information: {
        totalrecords: MfgProcessDataCount.count,
        lastpage: Math.ceil(MfgProcessDataCount.count / limit),
        currentpage: page,
        previouspage: 0 + (page - 1),
        nextpage:
          page < Math.ceil(MfgProcessDataCount.count / limit) ? page + 1 : 0
      }
    }
    return RESPONSE.success(res, 7404, responseData)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

const editMfgOrderProcess = async (req, res) => {
  let validation = new Validator(
    { ...req.query, ...req.body },
    {
      id: 'required',
      'item_process.processing_unit_pkg': 'numeric',
      // 'item_process.mfg_date': 'required_with:item_process.processing_unit_pkg',
      // 'item_process.exp_date': 'required_with:item_process.processing_unit_pkg',
      'item_process.processing_pkg_lab': 'numeric',
      // 'item_process.mfg_date': 'required_with:item_process.processing_pkg_lab',
      'item_process.exp_date': 'required_with:item_process.processing_pkg_lab',
      'item_process.batch_number':
        'required_with:item_process.processing_pkg_lab',
      'item_process.mrp': 'required_with:item_process.processing_pkg_lab',
      'item_process.processing_storage': 'numeric',
      'item_process.material_location':
        'required_with:item_process.processing_storage'
    }
  )
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      body: {
        /*mfg_order_number, bom_name, batch_quantity_required, bom_quantity, expected_quantity, godown_area,*/ item_planning,
        item_process
      },
      query: { id }
    } = req

    // check Mfg Process order
    const IsMfgProcessOrder = await mfgProcessOrder.findOne({
      where: {
        id: id
      },
      include: [
        {
          model: Formula,
          as: 'Bill_of_material',
          attributes: [
            'id',
            'bom_name',
            'finish_product_name',
            'batch_prefix',
            'unit_of_measurement',
            'batch_size',
            'createdAt',
            'updatedAt'
          ],
          include: [
            {
              model: Item_data,
              attributes: [
                'id',
                'item_name',
                'exp_time',
                'batch_prefix',
                'mfg_time_days',
                'mrp',
                'unit_quantity'
              ]
            }
          ]

          //   include: [
          //     {
          //       model: Formula_Material,
          //       as: 'bill_of_material',
          //       required: false,
          //       where: {
          //         is_packing: false
          //       },
          //       attributes: ['id', 'material_name', 'material_quantity'],
          //     }
          //   ]
        }
      ]
    })
    if (!IsMfgProcessOrder) {
      return RESPONSE.error(res, 7406)
    }
    const MaterialItem = await Formula_Material.findAll({
      where: { formula_id: IsMfgProcessOrder.Bill_of_material.id },
      include: [
        {
          model: Item_data,
          attributes: ['id', 'item_name', 'unit_quantity']
        }
      ]
    })

    if (IsMfgProcessOrder.status !== 'Complete') {
      //For Item Planning
      if (item_planning) {
        // if (IsMfgProcessOrder.status === null && IsMfgProcessOrder.plane_rvm == null && item_planning.plane_rvm == null) {
        //     await IsMfgProcessOrder.update({ status: "Raw Material Verification", is_status: false })
        // }
        if (
          IsMfgProcessOrder.status === 'Raw Material Verification' &&
          item_planning.plane_rvm != null
        ) {
          await IsMfgProcessOrder.update({
            status: 'Mixing',
            plane_rvm: item_planning.plane_rvm,
            is_status: false,
            process_count: 2
          })
        }
        if (
          IsMfgProcessOrder.status === 'Mixing' &&
          item_planning.plane_mixing != null &&
          IsMfgProcessOrder.plane_rvm !== null
        ) {
          await IsMfgProcessOrder.update({
            status: 'Unit Packing',
            plane_mixing: item_planning.plane_mixing,
            process_count: 3
          })
        }
        if (
          IsMfgProcessOrder.status === 'Unit Packing' &&
          item_planning.plane_unit_pkg != null &&
          IsMfgProcessOrder.plane_mixing !== null
        ) {
          await IsMfgProcessOrder.update({
            status: 'Packing && Labeling',
            plane_unit_pkg: item_planning.plane_unit_pkg,
            process_count: 4
          })
        }
        if (
          IsMfgProcessOrder.status === 'Packing && Labeling' &&
          item_planning.plane_pkg_lab != null &&
          IsMfgProcessOrder.plane_unit_pkg !== null
        ) {
          await IsMfgProcessOrder.update({
            status: 'Storage',
            plane_pkg_lab: item_planning.plane_pkg_lab,
            process_count: 5
          })
        }
        if (
          IsMfgProcessOrder.status === 'Storage' &&
          item_planning.plane_storage != null &&
          IsMfgProcessOrder.plane_pkg_lab !== null
        ) {
          await IsMfgProcessOrder.update({
            status: 'Raw Material Verification',
            plane_storage: item_planning.plane_storage,
            is_status: true,
            process_count: 1
          })
        }
      }

      for (const i of MaterialItem) {
        // For Item Processing
        if (
          item_process &&
          Number(i.material_quantity) > Number(i.item_data.unit_quantity)
        ) {
          if (
            IsMfgProcessOrder.status === 'Raw Material Verification' &&
            item_process.processing_rvm != null &&
            IsMfgProcessOrder.plane_storage !== null
          ) {
            await IsMfgProcessOrder.update({
              status: 'Mixing',
              processing_rvm: item_process.processing_rvm,
              process_count: 2
            })
          }
          if (
            IsMfgProcessOrder.status === 'Mixing' &&
            item_process.processing_mixing != null &&
            IsMfgProcessOrder.processing_rvm !== null
          ) {
            await IsMfgProcessOrder.update({
              status: 'Unit Packing',
              processing_mixing: item_process.processing_mixing,
              process_count: 3
            })
          }
          if (
            IsMfgProcessOrder.status === 'Unit Packing' &&
            item_process.processing_unit_pkg != null &&
            IsMfgProcessOrder.processing_mixing !== null
          ) {
            if (item_process.exp_date <= item_process.mfg_date) {
              return RESPONSE.error(res, 'Expire Date is not valid')
            }
            let UnitData = {
              status: 'Packing && Labeling',
              processing_unit_pkg: item_process.processing_unit_pkg,
              mfg_date: item_process.mfg_date,
              exp_date: item_process.exp_date,
              process_count: 4
            }
            await IsMfgProcessOrder.update(UnitData)
          }
          if (
            IsMfgProcessOrder.status === 'Packing && Labeling' &&
            item_process.processing_pkg_lab != null &&
            IsMfgProcessOrder.processing_unit_pkg !== null
          ) {
            // if (item_process.exp_date <= item_process.mfg_date) {
            //     return RESPONSE.error(res, "Expire Date is not valid")
            // }
            // const batch_prefix = IsMfgProcessOrder.Bill_of_material.batch_prefix
            let PkgLabData = {
              status: 'Storage',
              processing_pkg_lab: item_process.processing_pkg_lab,
              /* mfg_date: item_process.mfg_date, exp_date: item_process.exp_date,*/ batch_number:
                item_process.batch_number,
              mrp: item_process.mrp,
              process_count: 5
            }
            await IsMfgProcessOrder.update(PkgLabData)
          }
          if (
            IsMfgProcessOrder.status === 'Storage' &&
            item_process.processing_storage != null &&
            IsMfgProcessOrder.processing_pkg_lab !== null
          ) {
            if (item_process.material_location) {
              const material_Location = await MaterialLocation.findOne({
                where: {
                  id: item_process.material_location
                }
              })
              if (!material_Location) {
                return RESPONSE.error(res, 7708)
              }
            }
            await IsMfgProcessOrder.update({
              status: 'Complete',
              processing_storage: item_process.processing_storage,
              material_location: item_process.material_location,
              process_count: 5,
              actual_quantity: item_process.actual_quantity
            })
            const total_quantity = Number(
              Number(i.material_quantity) *
                Number(IsMfgProcessOrder.bom_quantity)
            )
            await Item_data.decrement('unit_quantity', {
              by: total_quantity,
              where: { id: i.material_id }
            })

            await Item_data.increment('unit_quantity', {
              by: item_process.actual_quantity,
              where: {
                id: IsMfgProcessOrder.Bill_of_material.finish_product_name
              }
            })

            await Item_Stock.create({
              available_quantity: item_process.actual_quantity,
              mfg_quantity: item_process.actual_quantity,
              batch_number: IsMfgProcessOrder.batch_number,
              mfg_date: IsMfgProcessOrder.mfg_date,
              exp_date: IsMfgProcessOrder.exp_date,
              unit_of_measurement:
                IsMfgProcessOrder.Bill_of_material.unit_of_measurement,
              item_name: IsMfgProcessOrder.Bill_of_material.item_data.item_name,
              item_id: IsMfgProcessOrder.Bill_of_material.item_data.id
            })
          }
        }
      }
    }

    return RESPONSE.success(res, {
      status:
        IsMfgProcessOrder.status === 'Complete'
          ? 'Process is Completed'
          : `${
              item_planning && IsMfgProcessOrder.is_status === false
                ? 'Item Planning'
                : 'Item Process'
            } is ${IsMfgProcessOrder.status} `
    })
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

const deleteMfgOrderProcess = async (req, res) => {
  let validation = new Validator(req.query, {
    id: 'required'
  })
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0]
    return RESPONSE.error(res, validation.errors.first(firstMessage))
  }
  try {
    const {
      query: { id }
    } = req
    // check Mfg Process order
    const IsMfgProcessOrder = await mfgProcessOrder.findOne({
      where: {
        id: id
      }
    })
    if (!IsMfgProcessOrder) {
      return RESPONSE.error(res, 7406)
    }
    if (IsMfgProcessOrder.status === 'Complete') {
      return RESPONSE.error(res, 7405)
    }

    await IsMfgProcessOrder.destroy()
    return RESPONSE.success(res, 7407)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

module.exports = {
  addMfgOrderProcess,
  getMfgOrderProcess,
  editMfgOrderProcess,
  deleteMfgOrderProcess
}
