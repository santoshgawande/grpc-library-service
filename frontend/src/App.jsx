import { useState, useEffect } from "react";

import { getBooks, addBook, updateBook, deleteBook, getMembers, addMember, updateMember, deleteMember, borrowBook, getBorrowings, returnBook } from "./api/library";
import BookList from "./components/BookList";
import BookForm from "./components/BookForm";
import MemberList from "./components/MemberList";
import MemberForm from "./components/MemberForm";
import BorrowList from "./components/BorrowList";


function BorrowForm({ books, members, onBorrow, onCancel }) {
  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [dueDays, setDueDays] = useState(14); // default 14 days
  function handleSubmit(e) {
    e.preventDefault();
    onBorrow(bookId, memberId, Number(dueDays));
    setBookId("");
    setMemberId("");
    setDueDays(14);
  }
  return (
    <form onSubmit={handleSubmit} className="borrow-form card">
      <h2>Borrow Book</h2>
      <div className="form-group">
        <label>Book:
          <select value={bookId} onChange={e => setBookId(e.target.value)} required>
            <option value="">Select Book</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </label>
        <label>Member:
          <select value={memberId} onChange={e => setMemberId(e.target.value)} required>
            <option value="">Select Member</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <label>Borrowing period (days):
          <input type="number" min="1" max="60" value={dueDays} onChange={e => setDueDays(e.target.value)} required style={{ width: 80 }} />
        </label>
      </div>
      <div className="form-actions">
        <button className="submit-btn" type="submit">Borrow</button>
        {onCancel && <button className="delete-btn" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}





function App() {
  const [tab, setTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooks().then(setBooks).catch(err => setError(err.message));
    getMembers().then(setMembers).catch(() => { });
    getBorrowings().then(setBorrowings).catch(() => { });
    setLoading(false);
  }, []);

  async function handleSaveBook(book) {
    try {
      let updated;
      if (book.id) {
        updated = await updateBook(book);
        setBooks(books.map(b => b.id === updated.id ? updated : b));
      } else {
        updated = await addBook(book);
        setBooks([...books, updated]);
      }
      setSelectedBook(null);
      setShowBookForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteBook(id) {
    try {
      await deleteBook(id);
      setBooks(books.filter(b => b.id !== id));
      setShowBookForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddMember(member) {
    try {
      const added = await addMember(member);
      setMembers([...members, added]);
      setShowMemberForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEditMember(member) {
    try {
      const updated = await updateMember(member);
      setMembers(members.map(m => m.id === updated.id ? updated : m));
      setSelectedMember(null);
      setShowMemberForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteMember(id) {
    try {
      await deleteMember(id);
      setMembers(members.filter(m => m.id !== id));
      setShowMemberForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  const [borrowError, setBorrowError] = useState("");
  async function handleBorrow(bookId, memberId, dueDays) {
    try {
      await borrowBook(bookId, memberId, dueDays);
      setBooks(await getBooks());
      setBorrowings(await getBorrowings());
      setShowBorrowForm(false);
      setBorrowError("");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setBorrowError(msg);
      console.error("Borrow error:", err);
    }
  }

  async function handleReturn(borrowing, finePerDay) {
    try {
      if (!borrowing.id || isNaN(Number(borrowing.id))) {
        setError("Invalid borrowing ID");
        return;
      }
      await returnBook({ id: Number(borrowing.id) }, finePerDay);
      setBorrowings(await getBorrowings());
      setBooks(await getBooks());
      setError(null);
    } catch (err) {
      setError("Return failed: " + (err.response?.data?.error || err.message));
      console.error("Return error:", err);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <nav className="main-menu">
        <button className={"main-menu-btn" + (tab === "books" ? " active" : "")} onClick={() => { setTab("books"); setShowBookForm(false); setSelectedBook(null); }}>Books</button>
        <button className={"main-menu-btn" + (tab === "members" ? " active" : "")} onClick={() => { setTab("members"); setShowMemberForm(false); setSelectedMember(null); }}>Members</button>
        <button className={"main-menu-btn" + (tab === "borrowed" ? " active" : "")} onClick={() => { setTab("borrowed"); setShowBorrowForm(false); }}>Borrowed Books</button>
      </nav>

      {tab === "books" && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="submit-btn" onClick={() => { setShowBookForm(true); setSelectedBook(null); }}>Add Book</button>
          </div>
          {showBookForm && (
            <BookForm book={selectedBook} onSave={handleSaveBook} onCancel={() => { setShowBookForm(false); setSelectedBook(null); }} />
          )}
          <BookList books={books} onEdit={book => { setSelectedBook(book); setShowBookForm(true); }} onDelete={handleDeleteBook} />
        </>
      )}
      {tab === "members" && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="submit-btn" onClick={() => { setShowMemberForm(true); setSelectedMember(null); }}>Add Member</button>
          </div>
          {showMemberForm && (
            <MemberForm member={selectedMember} onSave={selectedMember ? handleEditMember : handleAddMember} onCancel={() => { setShowMemberForm(false); setSelectedMember(null); }} />
          )}
          <MemberList members={members} onEdit={member => { setSelectedMember(member); setShowMemberForm(true); }} onDelete={handleDeleteMember} />
        </>
      )}
      {tab === "borrowed" && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="submit-btn" onClick={async () => {
              setLoading(true);
              const freshBooks = await getBooks();
              setBooks(freshBooks);
              setShowBorrowForm(true);
              setLoading(false);
            }}>Borrow Book</button>
          </div>
          {showBorrowForm && (
            <BorrowForm books={books} members={members} onBorrow={handleBorrow} onCancel={() => setShowBorrowForm(false)} errorMsg={borrowError} />
          )}
          <BorrowList borrowings={borrowings} books={books} members={members} onReturn={handleReturn} />
        </>
      )}
    </div>
  );
}

export default App;
