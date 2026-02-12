import Expense from '../models/Expense.js';
import Category from '../models/Category.js';

export const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, categoryId, startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (categoryId) query.category = categoryId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('category', 'name icon color')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Expense.countDocuments(query),
    ]);

    res.json({
      expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const { amount, category, date, notes } = req.body;
    if (!amount || !category) {
      res.status(400);
      throw new Error('Amount and category are required');
    }
    const categoryDoc = await Category.findOne({
      _id: category,
      user: req.user._id,
    });
    if (!categoryDoc) {
      res.status(400);
      throw new Error('Invalid category');
    }
    const expense = await Expense.create({
      user: req.user._id,
      amount: Number(amount),
      category,
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
    });
    const populated = await Expense.findById(expense._id).populate(
      'category',
      'name icon color'
    );
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }
    const { amount, category, date, notes } = req.body;
    if (amount !== undefined) expense.amount = Number(amount);
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes;
    await expense.save();
    expense = await Expense.findById(expense._id).populate(
      'category',
      'name icon color'
    );
    res.json(expense);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }
    res.json({ message: 'Expense removed' });
  } catch (error) {
    next(error);
  }
};
