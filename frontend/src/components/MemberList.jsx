import React, { useState } from "react";
import "../App.css";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

export default function MemberList({ members, onEdit, onDelete }) {
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(members.length / PAGE_SIZE);
    const pagedMembers = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const startEdit = (member) => {
        setEditId(member.id);
        setEditForm({ name: member.name, email: member.email, phone: member.phone || "" });
    };

    const handleEditSubmit = (e, id) => {
        e.preventDefault();
        onEdit({ id, ...editForm });
        setEditId(null);
    };

    return (
        <div className="member-list card">
            <h2>Members</h2>
            <table className="member-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pagedMembers.map(member => (
                        <tr key={member.id}>
                            {editId === member.id ? (
                                <>
                                    <td>
                                        <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                                    </td>
                                    <td>
                                        <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                                    </td>
                                    <td>
                                        <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                                    </td>
                                    <td>
                                        <button className="edit-btn" onClick={e => handleEditSubmit(e, member.id)}>Save</button>
                                        <button className="delete-btn" onClick={() => setEditId(null)}>Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{member.name}</td>
                                    <td>{member.email}</td>
                                    <td>{member.phone || ""}</td>
                                    <td>
                                        <button className="edit-btn" onClick={() => startEdit(member)}>Edit</button>
                                        <button className="delete-btn" onClick={() => onDelete(member.id)}>Delete</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
