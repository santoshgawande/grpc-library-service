
import { useState, useEffect } from "react";
import "../App.css";

export default function BookForm({ book, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    copies_total: 1,
    copies_available: 1,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (book) {
      setForm({
        id: book.id, // preserve id if present
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        copies_total: book.copies_total || 1,
        copies_available: book.copies_available || 1,
      });
    } else {
      setForm({
        title: "",
        author: "",
        isbn: "",
        copies_total: 1,
        copies_available: 1,
      });
    }
  }, [book]);

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    });
  }

  function validate(form) {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.author.trim()) errs.author = "Author is required.";
    if (!form.isbn.match(/^[0-9-]{10,17}$/)) errs.isbn = "Invalid ISBN.";
    if (form.copies_total < 0) errs.copies_total = "Copies Total cannot be negative.";
    if (form.copies_available < 0) errs.copies_available = "Copies Available cannot be negative.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSave(form);
    }
  }

  return (
    <form className="book-form card" onSubmit={handleSubmit}>
      <h2>{book ? "Edit Book" : "Add Book"}</h2>
      <div className="form-group">
        <div className="form-row">
          <label>Title:
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              required
            />
            {errors.title && <span className="form-error" style={{ color: 'red' }}>{errors.title}</span>}
          </label>
          <label>Author:
            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Author"
              required
            />
            {errors.author && <span className="form-error" style={{ color: 'red' }}>{errors.author}</span>}
          </label>
        </div>
        <div className="form-row">
          <label>ISBN:
            <input
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
              placeholder="ISBN"
              required
            />
            {errors.isbn && <span className="form-error" style={{ color: 'red' }}>{errors.isbn}</span>}
          </label>
          <label style={{ visibility: 'hidden' }}>&nbsp;
            <input style={{ visibility: 'hidden' }} tabIndex={-1} />
          </label>
        </div>
        <div className="form-row">
          <label>Copies Total:
            <input
              name="copies_total"
              value={form.copies_total}
              onChange={handleChange}
              placeholder="Total"
              min={0}
              type="number"
            />
            {errors.copies_total && <span className="form-error" style={{ color: 'red' }}>{errors.copies_total}</span>}
          </label>
          <label>Copies Available:
            <input
              name="copies_available"
              value={form.copies_available}
              onChange={handleChange}
              placeholder="Available"
              min={0}
              type="number"
            />
            {errors.copies_available && <span className="form-error" style={{ color: 'red' }}>{errors.copies_available}</span>}
          </label>
        </div>
      </div>
      <div className="form-actions" style={{ justifyContent: 'center', gap: 24 }}>
        <button className="submit-btn" type="submit" style={{ minWidth: 100 }}>Save</button>
        {onCancel && <button className="delete-btn" type="button" onClick={onCancel} style={{ minWidth: 100 }}>Cancel</button>}
      </div>
    </form>
  );
}