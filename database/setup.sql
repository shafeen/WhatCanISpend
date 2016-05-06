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
  FOREIGN KEY (type_id) REFERENCES budget_types(id)
);

