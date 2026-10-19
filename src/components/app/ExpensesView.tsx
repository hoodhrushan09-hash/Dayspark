import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  PieChart,
  Calendar,
  Filter,
  CheckCircle2,
  Sliders,
  CreditCard,
} from 'lucide-react';
import { Expense, Budget, ExpenseCategory } from '../../types';
import {
  createExpense,
  updateExpense,
  deleteExpense,
  saveBudget,
} from '../../services/expenseService';
import { useAuth } from '../../contexts/AuthContext';
import { getTodayString } from '../../lib/dates';

interface ExpensesViewProps {
  expenses: Expense[];
  budget: Budget | null;
}

const CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Health & Fitness',
  'Entertainment',
  'Education',
  'Shopping',
  'Work & Business',
  'Personal',
  'Other',
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  INR: '₹',
};

export const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, budget }) => {
  const { currentUser, userProfile, updateProfileData } = useAuth();
  const todayStr = getTodayString();
  const currentMonthKey = todayStr.slice(0, 7); // YYYY-MM

  const currencyCode = userProfile?.preferredCurrency || budget?.currency || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || '$';

  // Modal & Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [date, setDate] = useState(todayStr);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  // Budget settings modal
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [monthlyLimitInput, setMonthlyLimitInput] = useState(
    budget?.monthlyLimit?.toString() || '2000'
  );

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');

  // Filtered expenses for calculations
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthKey));

  // Spending totals
  const totalSpentThisMonth = monthExpenses
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => Math.round((sum + e.amount) * 100) / 100, 0);

  const totalIncomeThisMonth = monthExpenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => Math.round((sum + e.amount) * 100) / 100, 0);

  const todaySpent = expenses
    .filter((e) => e.date === todayStr && e.type === 'expense')
    .reduce((sum, e) => Math.round((sum + e.amount) * 100) / 100, 0);

  // Past 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  const weekSpent = expenses
    .filter((e) => e.date >= sevenDaysAgoStr && e.type === 'expense')
    .reduce((sum, e) => Math.round((sum + e.amount) * 100) / 100, 0);

  // Budget status
  const monthlyBudgetLimit = budget?.monthlyLimit || 2000;
  const budgetRatio = Math.min(100, Math.round((totalSpentThisMonth / monthlyBudgetLimit) * 100));

  // Category Breakdown
  const categoryTotals: Record<string, number> = {};
  monthExpenses
    .filter((e) => e.type === 'expense')
    .forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !amount || parseFloat(amount) <= 0) return;

    const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;

    if (editingExpense) {
      await updateExpense(currentUser.uid, editingExpense.id, {
        amount: parsedAmount,
        type,
        category,
        date,
        description: description.trim(),
        notes: notes.trim(),
        paymentMethod,
      });
    } else {
      await createExpense(currentUser.uid, {
        amount: parsedAmount,
        type,
        category,
        date,
        description: description.trim(),
        notes: notes.trim(),
        paymentMethod,
      });
    }

    closeModal();
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingExpense(null);
    setAmount('');
    setDescription('');
    setNotes('');
  };

  const handleEditClick = (item: Expense) => {
    setEditingExpense(item);
    setAmount(item.amount.toString());
    setType(item.type);
    setCategory(item.category);
    setDate(item.date);
    setDescription(item.description);
    setNotes(item.notes || '');
    setPaymentMethod(item.paymentMethod || 'Credit Card');
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteExpense(currentUser.uid, id);
    }
  };

  const handleSaveBudgetLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const limit = parseFloat(monthlyLimitInput) || 2000;
    await saveBudget(currentUser.uid, currentMonthKey, limit, currencyCode);
    setIsBudgetModalOpen(false);
  };

  const handleCurrencyChange = async (newCurr: string) => {
    if (!currentUser) return;
    await updateProfileData({ preferredCurrency: newCurr });
    if (budget) {
      await saveBudget(currentUser.uid, currentMonthKey, monthlyBudgetLimit, newCurr);
    }
  };

  // Filtered transactions for the ledger list
  const filteredTransactions = expenses.filter((e) => {
    if (selectedType !== 'all' && e.type !== selectedType) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              Personal Expense Tracker
            </h1>
          </div>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Track daily spending, manage monthly budgets, and keep your finances crystal clear.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Currency Selector */}
          <select
            value={currencyCode}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] text-xs font-bold text-[#262626] dark:text-[#F3F3F0] outline-hidden shadow-2xs"
          >
            {Object.keys(CURRENCY_SYMBOLS).map((c) => (
              <option key={c} value={c}>
                {c} ({CURRENCY_SYMBOLS[c]})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] text-xs font-semibold text-[#747474] hover:text-[#262626] dark:hover:text-white transition-colors shadow-2xs"
          >
            Edit Budget
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF7058] hover:bg-[#e65e47] text-white font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
          <div className="text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            Today's Spending
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#262626] dark:text-[#F3F3F0]">
            {currencySymbol}
            {todaySpent.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#747474] mt-0.5">Recorded today</div>
        </div>

        <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
          <div className="text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            Past 7 Days
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#262626] dark:text-[#F3F3F0]">
            {currencySymbol}
            {weekSpent.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#747474] mt-0.5">Rolling weekly total</div>
        </div>

        <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
          <div className="text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            This Month Spent
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#262626] dark:text-[#F3F3F0]">
            {currencySymbol}
            {totalSpentThisMonth.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#747474] mt-0.5">
            Budget: {currencySymbol}{monthlyBudgetLimit.toFixed(0)}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
          <div className="text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            Monthly Net Balance
          </div>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              totalIncomeThisMonth - totalSpentThisMonth >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-500'
            }`}
          >
            {totalIncomeThisMonth - totalSpentThisMonth >= 0 ? '+' : ''}
            {currencySymbol}
            {(totalIncomeThisMonth - totalSpentThisMonth).toFixed(2)}
          </div>
          <div className="text-[11px] text-[#747474] mt-0.5">
            Income: {currencySymbol}{totalIncomeThisMonth.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress Card */}
      <div className="p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#747474] dark:text-[#A0A09B] uppercase tracking-wider">
              Monthly Budget Progress ({currentMonthKey})
            </span>
            <div className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0] mt-0.5">
              {currencySymbol}{totalSpentThisMonth.toFixed(2)} of {currencySymbol}{monthlyBudgetLimit.toFixed(2)} used ({budgetRatio}%)
            </div>
          </div>

          {budgetRatio >= 80 && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                budgetRatio >= 100
                  ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{budgetRatio >= 100 ? 'Budget Exceeded!' : 'Approaching Budget Limit'}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#E8E7E0] dark:bg-[#2E302B] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetRatio >= 100
                ? 'bg-rose-500'
                : budgetRatio >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, budgetRatio)}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown & Ledger Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Category Breakdown Chart */}
        <div className="md:col-span-5 p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#FF7058]" />
              <span>Category Breakdown</span>
            </h3>
            <span className="text-[11px] text-[#747474] font-medium">This Month</span>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#747474]">
              No expenses recorded this month yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([catName, catTotal]) => {
                const catPct = totalSpentThisMonth > 0 ? Math.round((catTotal / totalSpentThisMonth) * 100) : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#262626] dark:text-[#F3F3F0]">
                        {catName}
                      </span>
                      <span className="font-mono text-[#747474]">
                        {currencySymbol}{catTotal.toFixed(2)} ({catPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#E8E7E0] dark:bg-[#2E302B] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FF7058]"
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transactions Ledger */}
        <div className="md:col-span-7 p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
              Transaction History ({filteredTransactions.length})
            </h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-2 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-[11px] text-[#262626] dark:text-[#F3F3F0]"
              >
                <option value="all">All Types</option>
                <option value="expense">Expenses Only</option>
                <option value="income">Income Only</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-[11px] text-[#262626] dark:text-[#F3F3F0]"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#747474]">
                No transactions found. Click "Add Entry" to record your first expense.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => handleEditClick(tx)}
                  className="p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] hover:border-[#FF7058]/50 bg-white dark:bg-[#282A26] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-[#FF7058]/10 text-[#FF7058]'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate">
                        {tx.description || tx.category}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#747474] mt-0.5">
                        <span>{tx.category}</span>
                        <span>·</span>
                        <span className="font-mono">{tx.date}</span>
                        {tx.paymentMethod && <span>· {tx.paymentMethod}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-mono font-bold ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-[#262626] dark:text-[#F3F3F0]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {currencySymbol}
                      {tx.amount.toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(tx.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#A0A09B] hover:text-rose-500 transition-opacity"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
              {editingExpense ? 'Edit Transaction' : 'Record Transaction'}
            </h3>

            <form onSubmit={handleSaveExpense} className="space-y-3.5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-[#F5F5F2] dark:bg-[#282A26] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    type === 'expense'
                      ? 'bg-white dark:bg-[#20221F] text-[#FF7058] shadow-2xs'
                      : 'text-[#747474]'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    type === 'income'
                      ? 'bg-white dark:bg-[#20221F] text-emerald-600 shadow-2xs'
                      : 'text-[#747474]'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#747474] mb-1">
                  Amount ({currencyCode})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-sm font-mono font-bold text-[#262626] dark:text-[#F3F3F0] outline-hidden focus:ring-2 focus:ring-[#FF7058]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#747474] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] outline-hidden"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#747474] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#747474] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Grocery shopping, Netflix, Salary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs text-[#262626] dark:text-[#F3F3F0] outline-hidden focus:ring-2 focus:ring-[#FF7058]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#747474] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] outline-hidden"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Apple Pay / Google Pay">Apple Pay / Google Pay</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E7E0] dark:border-[#2E302B]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#747474]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF7058] text-white text-xs font-bold hover:bg-[#e65e47] transition-colors"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Limit Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] p-6 shadow-xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
              Monthly Spending Budget
            </h3>
            <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
              Set your target monthly expense limit for {currentMonthKey}.
            </p>

            <form onSubmit={handleSaveBudgetLimit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#747474] mb-1">
                  Budget Limit ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={monthlyLimitInput}
                  onChange={(e) => setMonthlyLimitInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-sm font-mono font-bold text-[#262626] dark:text-[#F3F3F0] outline-hidden focus:ring-2 focus:ring-[#FF7058]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E7E0] dark:border-[#2E302B]">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#747474]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF7058] text-white text-xs font-bold hover:bg-[#e65e47] transition-colors"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
