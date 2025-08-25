-- Test schema for library service

DROP TABLE IF EXISTS borrowings;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS members;

CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT
);

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  copies_total INT NOT NULL DEFAULT 1,
  copies_available INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE borrowings (
  id SERIAL PRIMARY KEY,
  member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrowed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  fine FLOAT DEFAULT 0.0
);

CREATE INDEX idx_borrowings_active ON borrowings(book_id) WHERE returned_at IS NULL;

INSERT INTO members (name, email, phone) VALUES
('Alice Smith', 'alice.smith@example.com', '5551001001'),
('Bob Johnson', 'bob.johnson@example.com', '5551001002'),
('Carol Lee', 'carol.lee@example.com', '5551001003'),
('David Kim', 'david.kim@example.com', '5551001004'),
('Eva Brown', 'eva.brown@example.com', '5551001005'),
('Frank White', 'frank.white@example.com', '5551001006'),
('Grace Green', 'grace.green@example.com', '5551001007'),
('Henry Black', 'henry.black@example.com', '5551001008'),
('Ivy Young', 'ivy.young@example.com', '5551001009'),
('Jack King', 'jack.king@example.com', '5551001010'),
('Karen Hall', 'karen.hall@example.com', '5551001011'),
('Leo Adams', 'leo.adams@example.com', '5551001012'),
('Mona Clark', 'mona.clark@example.com', '5551001013'),
('Nina Scott', 'nina.scott@example.com', '5551001014'),
('Oscar Turner', 'oscar.turner@example.com', '5551001015'),
('Paula Lewis', 'paula.lewis@example.com', '5551001016'),
('Quinn Walker', 'quinn.walker@example.com', '5551001017'),
('Rita Young', 'rita.young@example.com', '5551001018'),
('Sam Harris', 'sam.harris@example.com', '5551001019'),
('Tina Evans', 'tina.evans@example.com', '5551001020');

INSERT INTO books (title, author, isbn, copies_total, copies_available) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 2, 2),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 3, 3),
('1984', 'George Orwell', '9780451524935', 3, 3),
('Pride and Prejudice', 'Jane Austen', '9780141439518', 2, 2),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769488', 4, 4),
('Moby-Dick', 'Herman Melville', '9781503280786', 1, 1),
('War and Peace', 'Leo Tolstoy', '9780199232765', 2, 2),
('The Odyssey', 'Homer', '9780140268867', 3, 3),
('Crime and Punishment', 'Fyodor Dostoevsky', '9780140449136', 2, 2),
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 5, 5),
('Brave New World', 'Aldous Huxley', '9780060850524', 2, 2),
('Jane Eyre', 'Charlotte Brontë', '9780142437209', 1, 1),
('Wuthering Heights', 'Emily Brontë', '9780141439556', 3, 3),
('Great Expectations', 'Charles Dickens', '9780141439563', 2, 2),
('Little Women', 'Louisa May Alcott', '9780147514011', 4, 4),
('Anna Karenina', 'Leo Tolstoy', '9780143035008', 1, 1),
('The Brothers Karamazov', 'Fyodor Dostoevsky', '9780374528379', 2, 2),
('Don Quixote', 'Miguel de Cervantes', '9780060934347', 3, 3),
('Les Misérables', 'Victor Hugo', '9780451419439', 2, 2),
('The Divine Comedy', 'Dante Alighieri', '9780142437223', 5, 5);

INSERT INTO borrowings (member_id, book_id, borrowed_at, due_at, returned_at, fine) VALUES
  (1, 1, now() - interval '20 days', now() - interval '10 days', now() - interval '9 days', 1.0),
  (2, 2, now() - interval '15 days', now() - interval '5 days', now() - interval '2 days', 3.0),
  (3, 3, now() - interval '10 days', now() + interval '5 days', NULL, 0.0),
  (4, 4, now() - interval '8 days', now() + interval '2 days', NULL, 0.0),
  (5, 5, now() - interval '12 days', now() - interval '2 days', now() - interval '1 days', 1.0),
  (6, 6, now() - interval '7 days', now() + interval '7 days', NULL, 0.0),
  (7, 7, now() - interval '5 days', now() + interval '10 days', NULL, 0.0),
  (8, 8, now() - interval '3 days', now() + interval '12 days', NULL, 0.0),
  (9, 9, now() - interval '2 days', now() + interval '13 days', NULL, 0.0),
  (10, 10, now() - interval '1 days', now() + interval '14 days', NULL, 0.0),
  (11, 11, now() - interval '11 days', now() - interval '1 days', now(), 2.0),
  (12, 12, now() - interval '9 days', now() + interval '1 days', NULL, 0.0),
  (13, 13, now() - interval '8 days', now() + interval '2 days', NULL, 0.0),
  (14, 14, now() - interval '7 days', now() + interval '3 days', NULL, 0.0),
  (15, 15, now() - interval '6 days', now() + interval '4 days', NULL, 0.0),
  (16, 16, now() - interval '5 days', now() + interval '5 days', NULL, 0.0),
  (17, 17, now() - interval '4 days', now() + interval '6 days', NULL, 0.0),
  (18, 18, now() - interval '3 days', now() + interval '7 days', NULL, 0.0),
  (19, 19, now() - interval '2 days', now() + interval '8 days', NULL, 0.0),
  (20, 20, now() - interval '1 days', now() + interval '9 days', NULL, 0.0),
  (1, 2, now() - interval '30 days', now() - interval '20 days', now() - interval '19 days', 5.0),
  (2, 3, now() - interval '25 days', now() - interval '15 days', now() - interval '10 days', 7.5),
  (3, 4, now() - interval '22 days', now() - interval '12 days', now() - interval '11 days', 2.5),
  (4, 5, now() - interval '18 days', now() - interval '8 days', now() - interval '7 days', 4.0),
  (5, 6, now() - interval '16 days', now() - interval '6 days', now() - interval '5 days', 3.5),
  (6, 7, now() - interval '14 days', now() - interval '4 days', now() - interval '3 days', 6.0),
  (7, 8, now() - interval '12 days', now() - interval '2 days', now() - interval '1 days', 1.5),
  (8, 9, now() - interval '10 days', now() - interval '1 days', now(), 2.0),
  (9, 10, now() - interval '8 days', now() - interval '1 days', now(), 2.0),
  (10, 11, now() - interval '6 days', now() - interval '1 days', now(), 2.0);
