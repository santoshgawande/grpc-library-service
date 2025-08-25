import axios from "axios";

const API_URL = "http://localhost:8080/books"; // Change to your backend endpoint

export async function getBooks() {
    const res = await axios.get(API_URL);
    return res.data.books;
}

export async function getBook(id) {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
}

export async function addBook(book) {
    console.log("api Add book called with:", book);
    const res = await axios.post(API_URL, book);
    return res.data;
}

export async function partialUpdateBook(book) {
    console.log("Partial update called with:", book);
    const updatePayload = {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        copies_total: book.copies_total,
        copies_available: book.copies_available
    };


    console.log("Updating book:", updatePayload);
    const res = await axios.patch(`${API_URL}/${book.id}`, updatePayload);
    console.log("Update response:", res.data);
    return res.data;
}

export async function deleteBook(id) {
    const res = await axios.delete(`${API_URL}/${id}`);
    console.log("Delete response:", res.data);
    return res.data;
}