import React, { useState } from "react";
import "../App.css";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

export default function BorrowList({ borrowings, books, members, onReturn }) {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(borrowings.length / PAGE_SIZE);
    const pagedBorrowings = borrowings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const bookMap = Object.fromEntries((books || []).map(b => [b.id, b.title]));
    const memberMap = Object.fromEntries((members || []).map(m => [m.id, m.name]));

    // Helper to format date string to YYYY-MM-DD
    const formatDate = (dt) => {
        if (!dt) return "-";
        // Handles both ISO and date-only strings
        const d = new Date(dt);
        if (isNaN(d)) return dt;
        return d.toISOString().slice(0, 10);
    };

    return (
        <div className="borrow-list card">
            <h2>Borrowed Books</h2>
            <table className="borrow-table">
                <thead>
                    <tr>
                        <th>Book Title</th>
                        <th>Member Name</th>
                        <th>Borrowed At</th>
                        <th>Due At</th>
                        <th>Returned At</th>
                        <th>Fine</th>
                        <th>Return</th>
                    </tr>
                </thead>
                <tbody>
                    {pagedBorrowings.map(b => (
                        <tr key={b.id}>
                            <td>{bookMap[b.book_id] || b.book_id}</td>
                            <td>{memberMap[b.member_id] || b.member_id}</td>
                            <td>{formatDate(b.borrowed_at || b.borrow_date)}</td>
                            <td>{formatDate(b.due_date)}</td>
                            <td>{b.returned_at ? formatDate(b.returned_at) : (b.return_date ? formatDate(b.return_date) : "")}</td>
                            <td>{b.fine !== undefined ? b.fine : "-"}</td>
                            <td>
                                {!b.returned_at && !b.return_date && (
                                    <button className="edit-btn" onClick={() => onReturn(b, 1.0)}>Return</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
