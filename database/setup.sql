CREATE TABLE budget_types(
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(15) NOT NULL
);

INSERT INTO budget_types (name)
VALUES ('weekly'), ('monthly'), ('yearly');

CREATE TABLE budgets(
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(20) NOT NULL,
  type_id INTEGER NOT NULL,
  FOREIGN KEY (type_id) REFERENCES budget_types(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE items(
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  budget_id INTEGER NOT NULL,
  description VARCHAR(25) NOT NULL,
  duration UNSIGNED INT NOT NULL, -- duration can mean weeks/months/years depending on the budget_type
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE ON UPDATE CASCADE
);

