const expenseForm = document.getElementById('expenseForm');
const expenseTableBody = document.querySelector('#expenseTable tbody');
const totalAmountEl = document.getElementById('totalAmount');
const monthlyAmountEl = document.getElementById('monthlyAmount');
const categorySummaryEl = document.getElementById('categorySummary');
const monthFilter = document.getElementById('monthFilter');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const rowCountLabel = document.getElementById('rowCountLabel');
const saveFileBtn = document.getElementById('saveFileBtn');
const openFileBtn = document.getElementById('openFileBtn');
const newFileBtn = document.getElementById('newFileBtn');
const fileInput = document.getElementById('fileInput');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const expenseNameInput = document.getElementById('expenseName');
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseCategoryInput = document.getElementById('expenseCategory');
const expenseDateInput = document.getElementById('expenseDate');
const resetFormBtn = document.getElementById('resetFormBtn');

let expenses = [];
let editingId = null;
let userTheme = localStorage.getItem('expense-tracker-theme') || 'light';
const todayDateString = new Date().toISOString().slice(0, 10);
expenseDateInput.max = todayDateString;

const CATEGORY_LABELS = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  userTheme = theme;
  localStorage.setItem('expense-tracker-theme', theme);
}

function loadExpenses() {
  const savedData = localStorage.getItem('expense-tracker-data');
  if (savedData) {
    try {
      expenses = JSON.parse(savedData) || [];
    } catch (error) {
      expenses = [];
    }
  }
}

function saveExpenses() {
  localStorage.setItem('expense-tracker-data', JSON.stringify(expenses));
}

function resetForm() {
  expenseForm.reset();
  editingId = null;
  resetFormBtn.textContent = 'Clear';
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function getMonth(value) {
  const date = new Date(value);
  return String(date.getMonth() + 1).padStart(2, '0');
}

function updateSummary(filteredExpenses) {
  const total = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  totalAmountEl.textContent = formatCurrency(total);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTotal = filteredExpenses.reduce((sum, item) => {
    return item.date.slice(0, 7) === currentMonth ? sum + item.amount : sum;
  }, 0);
  monthlyAmountEl.textContent = formatCurrency(monthlyTotal);

  const categoryTotals = CATEGORY_LABELS.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {});

  filteredExpenses.forEach((item) => {
    if (categoryTotals[item.category] !== undefined) {
      categoryTotals[item.category] += item.amount;
    }
  });

  categorySummaryEl.innerHTML = '';
  CATEGORY_LABELS.forEach((category) => {
    const amount = categoryTotals[category];
    const row = document.createElement('div');
    row.className = 'category-item';
    row.innerHTML = `<span>${category}</span><strong>${formatCurrency(amount)}</strong>`;
    categorySummaryEl.appendChild(row);
  });
}

function createActionButton(label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'action-btn';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function renderTable() {
  const filterMonth = monthFilter.value;
  const filterCategory = categoryFilter.value;
  const searchText = searchInput.value.trim().toLowerCase();
  const sortOption = sortSelect.value;

  let visibleExpenses = expenses.filter((item) => {
    const matchesMonth = filterMonth === 'All' || getMonth(item.date) === filterMonth;
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchText);
    return matchesMonth && matchesCategory && matchesSearch;
  });

  visibleExpenses.sort((a, b) => {
    switch (sortOption) {
      case 'name_asc': return a.name.localeCompare(b.name);
      case 'name_desc': return b.name.localeCompare(a.name);
      case 'amount_asc': return a.amount - b.amount;
      case 'amount_desc': return b.amount - a.amount;
      case 'date_asc': return new Date(a.date) - new Date(b.date);
      default: return new Date(b.date) - new Date(a.date);
    }
  });

  expenseTableBody.innerHTML = '';
  visibleExpenses.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${formatCurrency(item.amount)}</td>
      <td>${item.category}</td>
      <td>${formatDate(item.date)}</td>
      <td class="actions"></td>
    `;

    const actionsCell = row.querySelector('td.actions');
    actionsCell.appendChild(createActionButton('Edit', () => startEditing(item.id)));
    actionsCell.appendChild(createActionButton('Delete', () => removeExpense(item.id)));

    expenseTableBody.appendChild(row);
  });

  rowCountLabel.textContent = `${visibleExpenses.length} item${visibleExpenses.length === 1 ? '' : 's'}`;
  updateSummary(visibleExpenses);
}

function addExpense(expense) {
  expenses.push(expense);
  saveExpenses();
  renderTable();
}

function updateExpense(updatedItem) {
  expenses = expenses.map((item) => (item.id === updatedItem.id ? updatedItem : item));
  saveExpenses();
  renderTable();
}

function removeExpense(id) {
  if (!confirm('Delete this expense?')) return;
  expenses = expenses.filter((item) => item.id !== id);
  saveExpenses();
  renderTable();
}

function startEditing(id) {
  const item = expenses.find((expense) => expense.id === id);
  if (!item) return;
  editingId = id;
  expenseNameInput.value = item.name;
  expenseAmountInput.value = item.amount;
  expenseCategoryInput.value = item.category;
  expenseDateInput.value = item.date;
  resetFormBtn.textContent = 'Cancel';
}

function handleFormSubmit(event) {
  event.preventDefault();
  const name = expenseNameInput.value.trim();
  const amount = parseFloat(expenseAmountInput.value);
  const category = expenseCategoryInput.value;
  const date = expenseDateInput.value;

  if (!name || Number.isNaN(amount) || !date) {
    return;
  }

  if (date > todayDateString) {
    alert('Expense date cannot be in the future. Please choose today or an earlier date.');
    return;
  }

  const payload = {
    id: editingId || crypto.randomUUID(),
    name,
    amount,
    category,
    date,
  };

  if (editingId) {
    updateExpense(payload);
  } else {
    addExpense(payload);
  }

  resetForm();
}

function serializeCSV(array) {
  const header = ['Name', 'Amount', 'Category', 'Date'];
  const rows = array.map((item) => [
    item.name,
    item.amount.toFixed(2),
    item.category,
    item.date,
  ]);
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  return csv;
}

function downloadTextFile(data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function saveFile(format = 'json') {
  if (!expenses.length) {
    alert('Add some expenses before exporting.');
    return;
  }

  if (format === 'csv') {
    const csv = serializeCSV(expenses);
    downloadTextFile(csv, 'expenses_backup.csv', 'text/csv;charset=utf-8;');
  } else {
    const json = JSON.stringify(expenses, null, 2);
    downloadTextFile(json, 'expenses_backup.json', 'application/json;charset=utf-8;');
  }
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift()?.split(',').map((item) => item.replace(/^"|"$/g, '').trim()) || [];
  const nameIndex = headers.indexOf('Name');
  const amountIndex = headers.indexOf('Amount');
  const categoryIndex = headers.indexOf('Category');
  const dateIndex = headers.indexOf('Date');

  if ([nameIndex, amountIndex, categoryIndex, dateIndex].some((index) => index === -1)) {
    throw new Error('CSV header is missing required columns.');
  }

  return lines.map((line) => {
    const values = line.match(/(?:"([^"]*(?:""[^"]*)*)"|([^,]+))/g) || [];
    const cleaned = values.map((value) => value.replace(/^"|"$/g, '').replace(/""/g, '"'));
    return {
      id: crypto.randomUUID(),
      name: cleaned[nameIndex] || 'Unknown',
      amount: parseFloat(cleaned[amountIndex]) || 0,
      category: CATEGORY_LABELS.includes(cleaned[categoryIndex]) ? cleaned[categoryIndex] : 'Other',
      date: cleaned[dateIndex] || new Date().toISOString().slice(0, 10),
    };
  });
}

function importData(data) {
  if (!confirm('This will replace the current expense data. Continue?')) return;
  expenses = data.map((item) => ({
    id: item.id || crypto.randomUUID(),
    name: String(item.name || '').trim(),
    amount: Number(item.amount) || 0,
    category: CATEGORY_LABELS.includes(item.category) ? item.category : 'Other',
    date: item.date || new Date().toISOString().slice(0, 10),
  }));
  saveExpenses();
  resetForm();
  renderTable();
}

function handleFileSelection(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const content = reader.result;
    try {
      let parsed = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        parsed = JSON.parse(content);
      } else {
        parsed = parseCSV(String(content));
      }
      if (!Array.isArray(parsed)) {
        throw new Error('File format must contain an array of expenses.');
      }
      importData(parsed);
    } catch (error) {
      alert('Unable to open file. ' + error.message);
    }
  };
  if (file.type.includes('json') || file.name.toLowerCase().endsWith('.json')) {
    reader.readAsText(file);
  } else {
    reader.readAsText(file);
  }
  event.target.value = '';
}

function clearAllData() {
  if (!confirm('Create a new file and clear all current expenses?')) return;
  expenses = [];
  saveExpenses();
  resetForm();
  renderTable();
}

expenseForm.addEventListener('submit', handleFormSubmit);
resetFormBtn.addEventListener('click', resetForm);
monthFilter.addEventListener('change', renderTable);
categoryFilter.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);
sortSelect.addEventListener('change', renderTable);
saveFileBtn.addEventListener('click', () => saveFile('json'));
openFileBtn.addEventListener('click', () => fileInput.click());
newFileBtn.addEventListener('click', clearAllData);
fileInput.addEventListener('change', handleFileSelection);
themeToggleBtn.addEventListener('click', () => applyTheme(userTheme === 'light' ? 'dark' : 'light'));

applyTheme(userTheme);
loadExpenses();
renderTable();
