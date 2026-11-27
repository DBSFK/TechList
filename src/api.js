const BASE_URL = 'https://technoworks.com.br/api/items';

// Listar produtos
export async function fetchExternalProducts() {
  const response = await fetch(`${BASE_URL}?limite=50`);

  if (!response.ok) {
    throw new Error('Erro ao buscar produtos na API');
  }

  const result = await response.json();
  return result.dados || [];
}

// Buscar produto por ID
export async function fetchProductById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar produto');
  }

  const result = await response.json();
  return result.dados;
}

// Cadastrar produto
export async function createProduct(product) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error('Erro ao cadastrar produto');
  }

  return await response.json();
}

// Substituir produto
export async function replaceProduct(id, product) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error('Erro ao substituir produto');
  }

  return await response.json();
}

// Atualizar parcialmente
export async function updateProduct(id, product) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar produto');
  }

  return await response.json();
}

// Excluir produto
export async function deleteProduct(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir produto');
  }

  return await response.json();
}