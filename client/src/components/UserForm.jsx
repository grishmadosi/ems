import { useState } from 'react'

const initialForm = {
  name: '',
  email: '',
  role: 'VOTER',
}

function UserForm({ onSubmit, isLoading = false }) {
  const [form, setForm] = useState(initialForm)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return

    await onSubmit?.(form)
    setForm(initialForm)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="VOTER">VOTER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Add User'}
      </button>
    </form>
  )
}

export default UserForm
