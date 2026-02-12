import Category from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({
      name: 1,
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) {
      res.status(400);
      throw new Error('Category name is required');
    }
    const category = await Category.create({
      user: req.user._id,
      name: name.trim(),
      icon: icon || '📁',
      color: color || '#6366f1',
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    const { name, icon, color } = req.body;
    if (name !== undefined) category.name = name.trim();
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    await category.save();
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    res.json({ message: 'Category removed' });
  } catch (error) {
    next(error);
  }
};
