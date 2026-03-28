const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const raw = await response.text()
    let message = raw

    try {
      const parsed = JSON.parse(raw)
      message = parsed?.error || parsed?.message || raw
    } catch {
      message = raw
    }

    throw new Error(message || 'Request failed')
  }

  return response.status === 204 ? null : response.json()
}

export function getUsers() {
  return request(`${API_BASE_URL}/users`)
}

export function createUser(payload, actorRole = 'VOTER') {
  return request(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': actorRole,
    },
    body: JSON.stringify(payload),
  })
}

export function deleteUser(userId) {
  return request(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
  })
}
