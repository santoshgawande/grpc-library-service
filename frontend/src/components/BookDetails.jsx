import { useState, useEffect } from "react";
import BookList from "./BookList";
import BookForm from "./BookForm";
import { getBooks, addBook, partialUpdateBook, deleteBook } from "../api/books";

function BookDetails() {
    const [books, setBooks] = useState([]);
    const [editingBook, setEditingBook] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch books
    useEffect(() => {
        getBooks()
            .then(setBooks)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // Add or update book
    async function handleSave(book) {
        console.log("Save handler called");
        console.log("book :", book, typeof (book));
        try {
            let updated;
            if (book.id) {
                updated = await partialUpdateBook(book);
                setBooks(books.map(b => b.id === updated.id ? updated : b));
            } else {
                console.log("UI Adding new book:", book);
                updated = await addBook(book);
                setBooks([...books, updated]);
            }
            setEditingBook(null);
        } catch (err) {
            setError(err.message);
        }
    }

    // Delete book
    async function handleDelete(id) {
        console.log("Delete handler called");
        console.log("id :", id, typeof (id))

        try {
            await deleteBook(id);
            setBooks(books.filter(b => b.id !== id));
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <BookForm book={editingBook} onSave={handleSave} />
            <BookList books={books} onEdit={setEditingBook} onDelete={handleDelete} />
        </div>
    );
}

export default BookDetails;