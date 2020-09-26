
export async function makeRequest(data) {
  return fetch(`/api`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
}

export async function getAllUsers(data) {
  const response = await makeRequest(data);
  return response.json();
}

export async function createUser(data) {
  const response = await makeRequest(data);
  return response.json();
}

export async function loginUser(data) {
  const response = await makeRequest(data);
  return response.json();
}
