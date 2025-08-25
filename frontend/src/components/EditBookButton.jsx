export default function EditBookButton({ book, onEdit }) {
    return <button onClick={() => onEdit(book)}>Edit</button>;
}