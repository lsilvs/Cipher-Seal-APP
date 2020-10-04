export async function makeRequest(data) {
  return fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function createUserService(data) {
  const response = await makeRequest(data);
  return response.json();
}

export async function loginUserService(data) {
  const response = await makeRequest(data);
  return response.json();
}

export async function getAllTweetsService(data) {
  const response = await makeRequest(data);
  return response.json();
}

export async function saveTweetService(data) {
  const response = await makeRequest(data);
  return response.json();
}
