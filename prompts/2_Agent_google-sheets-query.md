Generate google sheets formula using Google Query Language.
 - example: `=QUERY('人事労務'!A2:B, "SELECT Col2, Col1 FORMAT Col2 '0000'", 0)`

---

Query Language Clauses

The syntax of the query language is composed of the following clauses. Each clause starts with one or two keywords. All clauses are optional. Clauses are separated by spaces. The order of the clauses must be as follows:

Clause	Usage
select	Selects which columns to return, and in what order. If omitted, all of the table's columns are returned, in their default order.
where	Returns only rows that match a condition. If omitted, all rows are returned.
group by	Aggregates values across rows.
pivot	Transforms distinct values in columns into new columns.
order by	Sorts rows by values in columns.
limit	Limits the number of returned rows.
offset	Skips a given number of first rows.
label	Sets column labels.
format	Formats the values in certain columns using given formatting patterns.
options	Sets additional options.
from	The from clause has been eliminated from the language.

---
Specific instructions for Google Sheets:

One method to simply join multiple column fields:
[Google array literal representation](https://support.google.com/docs/answer/6208276)

To batch process record rows:
use ARRAYFORMULA()
For iterative processing and complex formulas that ARRAYFORMULA() cannot handle, use BYROW() with LAMBDA()
---
Google Query Language Reference: https://developers.google.com/chart/interactive/docs/querylanguage

If required, check reference for further examples and documentation.
