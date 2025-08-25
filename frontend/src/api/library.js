import axios from "axios";

const API_URL = "http://localhost:8080";

export async function getBooks() {
    const res = await axios.get(`${API_URL}/books`);
    return res.data.books;
}

export async function addBook(book) {
    const res = await axios.post(`${API_URL}/books`, book);
    return res.data;
}

export async function updateBook(book) {
    const res = await axios.patch(`${API_URL}/books/${book.id}`, book);
    return res.data;
}

export async function deleteBook(id) {
    const res = await axios.delete(`${API_URL}/books/${id}`);
    return res.data;
}

export async function getMembers() {
    const res = await axios.get(`${API_URL}/members`);
    return res.data.members;
}

export async function addMember(member) {
    const res = await axios.post(`${API_URL}/members`, member);
    return res.data;
}

export async function updateMember(member) {
    const res = await axios.patch(`${API_URL}/members/${member.id}`, member);
    return res.data;
}

export async function deleteMember(id) {
    const res = await axios.delete(`${API_URL}/members/${id}`);
    return res.data;
}

export async function getBookById(id) {
    const res = await axios.get(`${API_URL}/books/${id}`);
    return res.data.book;
}

export async function getMemberById(id) {
    const res = await axios.get(`${API_URL}/members/${id}`);
    return res.data.member;
}

export async function getBorrowings() {
    const res = await axios.get(`${API_URL}/borrowings`);
    return res.data.borrowings;
}

export async function borrowBook(book_id, member_id, due_days) {
    const res = await axios.post(`${API_URL}/books/${book_id}/borrow`, { member_id, due_days });
    return res.data;
}

export async function returnBook(borrowing, fine_per_day = 1.0) {
    console.log("API returnBook called with:", borrowing, fine_per_day);
    const res = await axios.post(`${API_URL}/borrowings/${borrowing.id}/return`, {
        borrowing_id: borrowing.id,
        fine_per_day
    });
    return res.data;
}
