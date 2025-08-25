import React, { useState } from "react";
import "../App.css";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

export default function BookList({ books, onEdit, onDelete }) {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(books.length / PAGE_SIZE);
    const pagedBooks = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return (
        <div className="book-list card">
            <h2>Books</h2>
            <table className="book-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>ISBN</th>
                        <th>Copies Total</th>
                        <th>Copies Available</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pagedBooks.map(book => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.isbn}</td>
                            <td>{book.copies_total}</td>
                            <td>{book.copies_available}</td>
                            <td>
                                <button className="edit-btn" onClick={() => onEdit(book)}>Edit</button>
                                <button className="delete-btn" onClick={() => onDelete(book.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}