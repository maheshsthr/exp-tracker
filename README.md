# Expense Tracker

A lightweight offline expense tracker built with plain HTML, CSS, and JavaScript.

## Overview

This project is a browser-based expense workbook that helps you track spending, filter expenses, and export/import your data locally. All data is stored in the browser using `localStorage`, and you can also save or load expenses as JSON or CSV files.

## Features

- Add, edit, and delete expense entries
- Track expenses by name, amount, category, and date
- Filter by month and category
- Search expenses by text
- Sort expenses by date, name, or amount
- Summary dashboard with total, monthly total, and category breakdown
- Theme toggle with local persistence
- Save expense data as JSON or CSV
- Open/import existing expense files in JSON or CSV format
- Create a new file / clear current data safely

## Files

- `index.html` — application UI
- `style.css` — styling and responsive layout
- `script.js` — expense logic, storage, filtering, and file export/import

## Getting Started

1. Open `index.html` in a web browser.
2. Add expense items using the form.
3. Use filters, search, and sort controls to view your data.
4. Save your expenses to a file with the "Save File" button.
5. Open an existing expense backup with the "Open File" button.

## Notes

- The app stores data in browser `localStorage`, so your entries persist between sessions on the same browser.
- Exported JSON files contain structured expense records, while CSV files can be opened in spreadsheet software.
- Future dates are not allowed for expense entries.

## License

This project is free to use and modify.
