CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (name) VALUES ('Alice'), ('Bob');
INSERT INTO orders (user_id, product) VALUES (1, 'Laptop'), (1, 'Mouse'), (2, 'Keyboard');
