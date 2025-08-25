import { useState, useEffect } from "react";
import "../App.css";

export default function BorrowForm({ books, members, onSave, onCancel, errorMsg }) {
    // Only allow books with available copies
    const availableBooks = books.filter(b => b.copies_available > 0);
    const [form, setForm] = useState({
        book_id: availableBooks.length > 0 ? availableBooks[0].id : "",
        member_id: members.length > 0 ? members[0].id : "",
        period_days: 14,
    });
    const [infoMsg, setInfoMsg] = useState("");
    const [errors, setErrors] = useState({});

    // If availableBooks changes and selected book is no longer available, reset selection
    useEffect(() => {
        if (!availableBooks.find(b => b.id === form.book_id)) {
            setForm(f => ({ ...f, book_id: availableBooks.length > 0 ? availableBooks[0].id : "" }));
        }
    }, [availableBooks, form.book_id]);

    function handleChange(e) {
        const { name, value, type } = e.target;
        setForm({
            ...form,
            [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
        });
    }

    function validate(form) {
        const errs = {};
        if (!form.book_id || !availableBooks.find(b => b.id === form.book_id)) {
            errs.book_id = "No copies available for the selected book.";
        }
        if (form.period_days < 1) {
            errs.period_days = "Borrowing period must be at least 1 day.";
        }
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setInfoMsg("");
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            // Show first error as infoMsg for accessibility/visibility
            setInfoMsg(Object.values(errs)[0]);
            return;
        }
        try {
            await onSave(form);
            // Only reset form on successful borrow
            setForm({
                book_id: availableBooks.length > 0 ? availableBooks[0].id : "",
                member_id: members.length > 0 ? members[0].id : "",
                period_days: 14,
            });
            setErrors({});
            setInfoMsg("");
        } catch (err) {
            // Prefer server message if available (message or error field)
            let msg = "Borrow failed. Please try again.";
            if (err && err.response && err.response.data) {
                if (err.response.data.message) {
                    msg = err.response.data.message;
                } else if (err.response.data.error) {
                    msg = err.response.data.error;
                }
            } else if (err && err.message) {
                msg = err.message;
            }
            setInfoMsg(msg);
        }
    }

    return (
        <form className="book-form card" onSubmit={handleSubmit}>
            <h2>Borrow Book</h2>
            <div className="form-group">
                <div className="form-row">
                    <label>Book:
                        <select
                            key={availableBooks.map(b => b.id).join("-")}
                            name="book_id"
                            value={form.book_id}
                            onChange={handleChange}
                            required
                        >
                            {availableBooks.length === 0 && <option value="">No books available</option>}
                            {availableBooks.map(b => (
                                <option key={b.id} value={b.id}>{b.title}</option>
                            ))}
                        </select>
                        {errors.book_id && <span className="form-error" style={{ color: 'red' }}>{errors.book_id}</span>}
                    </label>
                    <label>Member:
                        <select name="member_id" value={form.member_id} onChange={handleChange} required>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="form-row">
                    <label>Borrowing Period (days):
                        <input
                            name="period_days"
                            type="number"
                            min="1"
                            max="60"
                            value={form.period_days}
                            onChange={handleChange}
                            required
                            placeholder="Days"
                        />
                    </label>
                    <label style={{ visibility: 'hidden' }}>&nbsp;
                        <input style={{ visibility: 'hidden' }} tabIndex={-1} />
                    </label>
                </div>
            </div>
            <div className="form-actions" style={{ justifyContent: 'center', gap: 24 }}>
                <button className="submit-btn" type="submit" style={{ minWidth: 100 }}>Borrow</button>
                {onCancel && <button className="delete-btn" type="button" onClick={onCancel} style={{ minWidth: 100 }}>Cancel</button>}
            </div>
            {infoMsg && (
                <span className="form-error" style={{ display: 'block', textAlign: 'center', color: 'red', marginTop: 12 }}>{infoMsg}</span>
            )}
            {errorMsg && (
                <span className="form-error" style={{ display: 'block', textAlign: 'center', color: 'red', marginTop: 12 }}>{errorMsg}</span>
            )}
        </form>
    );
}
