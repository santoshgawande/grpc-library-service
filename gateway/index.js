
const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = '../backend/proto/library.proto'; // Path to your proto file

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const libraryProto = grpc.loadPackageDefinition(packageDefinition).library;

const client = new libraryProto.LibraryService(
    'localhost:50051', // Python gRPC server address
    grpc.credentials.createInsecure()
);

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json());

// --- List Borrowings Endpoint ---
app.get('/borrowings', (req, res) => {
    client.ListBorrowings({}, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ borrowings: response.borrowings });
    });
});

// --- Member Endpoints ---
app.get('/members', (req, res) => {
    client.ListMembers({}, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ members: response.members });
    });
});


// Update a member
app.patch('/members/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const updatePayload = {
        id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    };
    client.UpdateMember(updatePayload, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(response);
    });
});

// Delete a member
app.delete('/members/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    client.DeleteMember({ id }, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(response);
    });
});

app.post('/members', (req, res) => {
    const memberPayload = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    };
    client.AddMember(memberPayload, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(response);
    });
});

// --- Borrow Book Endpoint ---
app.post('/books/:id/borrow', (req, res) => {
    const book_id = parseInt(req.params.id, 10);
    const member_id = Number(req.body.member_id);
    const due_days = req.body.due_days !== undefined ? Number(req.body.due_days) : undefined;
    const borrowPayload = { book_id, member_id };
    if (due_days !== undefined && !isNaN(due_days)) {
        borrowPayload.due_days = due_days;
    }
    client.BorrowBook(borrowPayload, (err, response) => {
        if (err) {
            // Prefer gRPC details if available, else fallback to err.message
            const msg = err.details || err.message || "Borrow failed.";
            return res.status(400).json({ error: msg });
        }
        res.json(response);
    });
});

// --- Return Book Endpoint ---
app.post('/borrowings/:id/return', (req, res) => {
    // expects borrowing id and return_date
    const id = parseInt(req.params.id, 10);
    const { book_id, member_id, borrow_date, return_date, fine_per_day } = req.body;
    console.log("GATEWAY: /borrowings/:id/return called with:", { id, book_id, member_id, borrow_date, return_date, fine_per_day });
    const returnPayload = { borrowing_id: id, book_id, member_id, borrow_date, return_date, fine_per_day };
    client.ReturnBook(returnPayload, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(response);
    });
});

// Example: Get all books
app.get('/books', (req, res) => {
    client.ListBooks({}, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ books: response.books });
    });
});

// Example: Add a book
app.post('/books', (req, res) => {
    console.log("Add handler called", req.body);
    const addPayload = {
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        copies_total: Number(req.body.copies_total) || 0,
        copies_available: Number(req.body.copies_available) || 0
    };
    client.AddBook(addPayload, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(response);
    });
});

// Example: Get a book by ID
app.get('/books/:id', (req, res) => {
    client.GetBook({ id: req.params.id }, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ book: response.book });
    });
});

// Example: Update a book
app.patch('/books/:id', (req, res) => {
    console.log("Update handler called, ", req.params.id);
    console.log(`Update handler called: ${req.method} ${req.originalUrl}, id: ${req.params.id}`);
    console.log("Request body:", req.body);
    const id = parseInt(req.params.id, 10);


    const updatePayload = {
        id,
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        copies_total: Number(req.body.copies_total) || 0,
        copies_available: Number(req.body.copies_available) || 0
    };
    console.log("Payload sent to gRPC PartialUpdateBook:", updatePayload);

    client.PartialUpdateBook(updatePayload, (err, response) => {
        console.log("gRPC request sent", updatePayload);
        console.log("gRPC response:", response);
        if (err) return res.status(500).json({ error: err.message });
        res.json(response);
    });
});




// Example: Delete a book
app.delete('/books/:id', (req, res) => {
    console.log("Delete handler called, ", req.params.id);
    console.log(`Delete handler called: ${req.method} ${req.originalUrl}, id: ${req.params.id}`);
    const id = parseInt(req.params.id, 10);
    client.DeleteBook({ id }, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(response);
    });
});

app.listen(8080, () => {
    console.log('API Gateway listening on port 8080');
});