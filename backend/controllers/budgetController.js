import Budget from '../models/Budget.js';

const getMonthString = (date = new Date()) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const getBudget = async (req, res, next) => {
  try {
    const month = req.query.month || getMonthString();
    const budget = await Budget.findOne({
      user: req.user._id,
      month,
    });
    res.json(budget || { month, amount: 0 });
  } catch (error) {
    next(error);
  }
};

export const setBudget = async (req, res, next) => {
  try {
    const { month = getMonthString(), amount } = req.body;
    if (amount === undefined || amount < 0) {
      res.status(400);
      throw new Error('Valid amount is required');
    }
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      { amount: Number(amount) },
      { new: true, upsert: true }
    );
    res.json(budget);
  } catch (error) {
    next(error);
  }
};
