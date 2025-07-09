import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RilEFHJCubfDy0Qj8EiKtvq1F3zPjd2PK4dV2xZFCeXB7Y504Iz8wZkONTOOY3KWalr7SqnbK53bwh91J3fONNC00QP2ZWZad'); // public key

export async function startCheckout() {
  const res = await fetch('http://localhost:3003/create-checkout-session', { // porta 3333 aqui
    method: 'POST',
  });

  if (!res.ok) {
    alert('Erro na requisição: ' + res.status);
    return;
  }

  const data = await res.json();

  const stripe = await stripePromise;
  if (stripe && data.url) {
    window.location.href = data.url;
  } else {
    alert('Erro ao redirecionar para o checkout');
  }
}
