-- DROP TABLE IF EXISTS budget_types;
CREATE TABLE budget_types(
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(15) NOT NULL
);
INSERT INTO budget_types (name)
VALUES ('weekly'), ('monthly'), ('yearly');

-- DROP TABLE IF EXISTS budgets;
CREATE TABLE budgets(
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(20) NOT NULL,
  type_id INTEGER NOT NULL,
  amount UNSIGNED REAL NOT NULL,
  FOREIGN KEY (type_id) REFERENCES budget_types(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- DROP TABLE IF EXISTS items;
CREATE TABLE items(
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  budget_id INTEGER NOT NULL,
  description VARCHAR(25) NOT NULL,
  cost UNSIGNED REAL NOT NULL,
  duration UNSIGNED INT NOT NULL, -- duration can mean weeks/months/years depending on the budget_type
  start_date INTEGER NOT NULL,
  end_date INTEGER NOT NULL,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE ON UPDATE CASCADE
);

