import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

export async function mintSession(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const address = request.query.get('address');

  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    `Bearer ${process.env['STRIPE_SECRET_TEST_MODE_API_KEY']}`
  );
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  const urlencoded = new URLSearchParams();
  urlencoded.append('transaction_details[source_currency]', 'usd');
  urlencoded.append('transaction_details[destination_currency]', 'usdc');
  urlencoded.append('transaction_details[destination_network]', 'solana');
  urlencoded.append(
    'transaction_details[supported_destination_networks][]',
    'solana'
  );
  urlencoded.append(
    'transaction_details[supported_destination_currencies][]',
    'usdc'
  );
  urlencoded.append(
    'transaction_details[wallet_addresses][solana]',
    `${address}`
  );
  urlencoded.append('transaction_details[lock_wallet_address]', 'true');

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
  };

  const res = await fetch(
    'https://api.stripe.com/v1/crypto/onramp_sessions',
    requestOptions
  );
  const json = await res.json();

  return {
    body: JSON.stringify(json),
  };
}

app.http('mintSession', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: mintSession,
});
