
export const makeOpenAIRequest = async (endpoint, data) => {
  const response = await fetch(`http://localhost:5001/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to make OpenAI request');
  }

  return response.json();
};

export default makeOpenAIRequest; 