const db = require('../../config/db.config');
const stock_Category = db.stock_category;
const Validator = require('validatorjs')
const { Sequelize, Op } = require('sequelize');


// Common function of Get Data

const getData = async () => {
  try {
    const ManyInclude = (depth) => {
      if (depth <= 0) {
        return [];
      }

      return [
        {
          model: stock_Category,
          as: 'parent',
          attributes: ['id', 'parent_id', 'Category'],
          hierarchy: true,
          required: false,
        }
      ];
    };

    const depth = 50;
    const include = ManyInclude(depth);

    const Categorydata = await stock_Category.findAll({
      attributes: ['id', 'parent_id', 'Category'],
      include,
    });

    // if (!Categorydata.length) {
    //   return RESPONSE.error(res, 8003, 404);
    // }


    const result = await retrieveData(Categorydata);
    return result
  } catch (error) {
    return error
  }
}

// Add Stock Category
const addStockCategory = async (req, res) => {

  try {
    const { body: { Category, parent_id = null } } = req;
    const allCategory = await getData()
    const parentCategory = allCategory.filter(item => item.id == parent_id /*&& item.category != Category*/)
    if (parentCategory.length) {
      const isCategory = parentCategory.filter(item => item.category == Category)
      const isParentCategory = parentCategory[0].parent.filter(item => item.category == Category)
      if (isCategory.length || isParentCategory.length) {
        return RESPONSE.error(res, 8009, 400)
      }
    } else {
      const isParent = allCategory.filter(item => item.category == Category)
      if (isParent.length) {
        return RESPONSE.error(res, 8009, 400)
      }
    }
    const stockData = await stock_Category.create({ Category, parent_id });

    return RESPONSE.success(res, 8002, stockData)

  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}


// Get Stock Category

const getStockCategory = async (req, res) => {
  try {
    const result = await getData()
    // if (!result.length) {
    //   return RESPONSE.error(res, 8003, 404);
    // }
    return RESPONSE.success(res, result.length ? 8004 : 8003, result);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, 9999);
  }
};

//   for parent Data
const retrieveData = async (arr) => {
  const result = [];

  const extractParent = async (parentId, parentArr) => {
    const parent = arr.find((item) => item.id === parentId);
    if (parent && !parentArr.some((parent1) => parent1.id === parent.id)) {
      parentArr.push({
        id: parent.id,
        category: parent.Category,
        parent_id: parent.parent_id,
      });
      if (parent.parent_id) {
        await extractParent(parent.parent_id, parentArr);
      }
    }
  };

  await Promise.all(arr.map(async (item) => {
    const parentArray = [];
    if (item.parent_id) {
      await extractParent(item.parent_id, parentArray);
    }

    result.push({
      id: item.id,
      parent_id: item.parent_id,
      category: item.Category,
      parent: parentArray.reverse(),
    });
  }));

  return result;
};
// Update Stock Category
const editStockCategory = async (req, res) => {

  try {
    const { query: { id }, body: { parent_id, Category } } = req

    const stockCategoryData = await stock_Category.findOne({ where: { id } })

    if (!stockCategoryData) {
      return RESPONSE.error(res, 8003, 404)
    }
    const findData = await stock_Category.findOne({
      where: {
        Category,
        parent_id: parent_id !== undefined ? parent_id : null,
        id: {
          [Op.not]: id,
        },
      }
    });

    if (findData) {
      return RESPONSE.error(res, 8001);
    }
    // update
    await stock_Category.update({ parent_id, Category }, { where: { id } })

    return RESPONSE.success(res, 8007)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

// Delete Stock Category
const deleteStockCategory = async (req, res) => {
  try {
    const { query: { id } } = req

    const stockCategoryData = await stock_Category.findOne({ where: { id } })

    if (!stockCategoryData) {
      return RESPONSE.error(res, 8003, 404)
    }

    // update
    await stockCategoryData.destroy()

    return RESPONSE.success(res, 8008)
  } catch (error) {
    console.log(error)
    return RESPONSE.error(res, 9999)
  }
}

module.exports = {
  addStockCategory,
  getStockCategory,
  editStockCategory,
  deleteStockCategory,
  getData
}