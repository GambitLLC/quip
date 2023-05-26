import { randomUUID } from 'crypto';

import Web3 from 'web3';
const web3 = new Web3();

export function generateDIDToken(): { player: string; token: string } {
  const account = web3.eth.accounts.create();
  const { address, sign } = account;
  const player = `did:ethr:${address}`;
  const claim = JSON.stringify({
    iat: Math.floor(Date.now() / 1000),
    ext: Math.floor(Date.now() / 1000) + 1000,
    iss: player,
    sub: 'sub',
    aud: 'aud',
    nbf: Math.floor(Date.now() / 1000),
    tid: randomUUID(),
    add: 'add',
  });
  return {
    player,
    token: Buffer.from(JSON.stringify([sign(claim).signature, claim])).toString(
      'base64'
    ),
  };
}
