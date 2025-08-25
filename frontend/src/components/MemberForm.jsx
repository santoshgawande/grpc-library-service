
import { useState, useEffect } from "react";
import "../App.css";

export default function MemberForm({ member, onSave, onCancel }) {
    const [form, setForm] = useState({ name: "", email: "", phone: "" });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (member) {
            setForm({ name: member.name || "", email: member.email || "", phone: member.phone || "", id: member.id });
        } else {
            setForm({ name: "", email: "", phone: "" });
        }
    }, [member]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    function validate(form) {
        const errs = {};
        if (!form.name.trim()) errs.name = "Name is required.";
        if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = "Invalid email address.";
        if (!form.phone.match(/^[0-9-+\s]{7,15}$/)) errs.phone = "Invalid phone number.";
        return errs;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length === 0) {
            onSave(form);
        }
    }

    return (
        <form className="member-form card" onSubmit={handleSubmit}>
            <h2>{member ? "Edit Member" : "Add Member"}</h2>
            <div className="form-group">
                <label>Name:
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                    {errors.name && <span className="form-error" style={{ color: 'red' }}>{errors.name}</span>}
                </label>
                <label>Email:
                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                    {errors.email && <span className="form-error" style={{ color: 'red' }}>{errors.email}</span>}
                </label>
                <label>Phone:
                    <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
                    {errors.phone && <span className="form-error" style={{ color: 'red' }}>{errors.phone}</span>}
                </label>
            </div>
            <div className="form-actions">
                <button className="submit-btn" type="submit">Save</button>
                {onCancel && <button className="delete-btn" type="button" onClick={onCancel}>Cancel</button>}
            </div>
        </form>
    );
}
