import { createServer } from 'http';
import { importJWK, KeyLike, SignJWT } from 'jose';
import { AddressInfo } from 'net';
import yaml from 'js-yaml';
import fs from 'fs';

process.env.ALLOW_CONFIG_MUTATIONS = 'true';
import config from 'config';

const alg = 'RS256';

const publicJWK = {
  kty: 'RSA',
  n: 'lY6TJiYivnUJUprJ6OjCBhmIUWZqcH5pymEDa-fBSaL9wp-J_fYPRpBDVzvv69IacSUfZeloiiTGctcXaO9wIIMowTHTK1U7DHolS3QRpdFpGBpy8CjuIDHq1tbYOsU1_KTZBNYX4CD4DjhAUM0GaM_KBz9gZbjkDlGtUQgdPp3cYKaFougoVZuq8FYk8IxSA4Tz_jfKVwili-N_56ZvGQ23V_82TdyPjKJBr84rlT2XC79aP_m0XZKTekYobJxryWFrfkLfv7NyS22LXWRHtfZtEz_lH9_Kpa-Ys7x1CVsg_ZFX5fQkSkcwzMMFn-Xx0l7jZND5lg-BAKs3-5hzxQ',
  e: 'AQAB',
  alg,
};

const privateJWK = {
  alg,
  kty: 'RSA',
  n: 'lY6TJiYivnUJUprJ6OjCBhmIUWZqcH5pymEDa-fBSaL9wp-J_fYPRpBDVzvv69IacSUfZeloiiTGctcXaO9wIIMowTHTK1U7DHolS3QRpdFpGBpy8CjuIDHq1tbYOsU1_KTZBNYX4CD4DjhAUM0GaM_KBz9gZbjkDlGtUQgdPp3cYKaFougoVZuq8FYk8IxSA4Tz_jfKVwili-N_56ZvGQ23V_82TdyPjKJBr84rlT2XC79aP_m0XZKTekYobJxryWFrfkLfv7NyS22LXWRHtfZtEz_lH9_Kpa-Ys7x1CVsg_ZFX5fQkSkcwzMMFn-Xx0l7jZND5lg-BAKs3-5hzxQ',
  e: 'AQAB',
  d: 'CE1P0dBQIW5xxAofpzQ0gQ4tyQb8ZZ4-1SMpg3Xr_uBzYbhlepmMI4iilFcZbGfPW_SJl6irSu_brEhQXlzcRpHBU2gmpsMmcfzd0SByUlgbk2D0fGxpO5RJyv9GJY0JACtOeLxBuwlZe8CXoWSgNHVEa76S5VKsJjdWfacLqIwZCkIwa60iFZAwWm8PCYzYlpxqRJuCcqezAjGMsZMpOargWnY2c1_Jj6dOyWdZ0fK7P9vnZXP2iqgWTR7oFP5Tev1WPfoHP3UglRwnWHrdUzXEYLsBZxFCaGN3aw5H6Q6nFhF_gEgdSfRlguE7Tm3p8-dXaJYw8azlAGvVOy4OgQ',
  p: 'uDdbcGFQyHhTAHhYIGccVzwGTki4NbyzYzdUeqP6dvcm4e6nTJ1RKQs3RtmBMlkbNKptYLGCybCuRT9OqhdEctGKohZtHCOlG3GZsYJDLa9ttasdDO_7Ppn9EqHy8x3vBaSz1Nn14kkQL4kFGBFMLWmG_LvtMhxutNn2fROp0VU',
  q: 'z9W__McKg5AADTjXxknVKNafqJethvCYIffqJ85yxhzT-TSG_tRGX6YWyc-JH2yCSE1lKtwONYDwD2B1XkCgaydZudUHE5WORB3AZbQhZZiKtzskzjCMw6lUzoMZ8N3fOCW8nB0MpKgCjDj-X0vOPDB1Jvs_tpiZ_pVEKkxT2LE',
  dp: 'ndYQaoF3DczKkSSLnXe7OKMdZAW6j5BWwzOtFkdZWoT4s6wfe-1ulJQfkHzbzZ-7R6yeerKdNOJE7uAHLoUxCI-xEJ_WbL29wX3cCdNqa8JbZcRu557WzhRyWXyZBOUo3tT3n_AAVRn03EWyL6TieCZqmjEKUl06HYqDPzeR0OE',
  dq: 'GtHBcZQZxjpp10rzhTH34Mo5Vh8klFott4xvWe2pH-mObQUbOn0YC7W6ERbH4hc1hLEAEhTNfJgD4mgXHS-Hw-wTBwj3Xc6Zyi5wqm8hNCQIGnb2W-kl8QXD3NZMHanz6SHtgdO50vGfSor8QD3fAiNaqsoXQa_Vh2Wpoy-wTjE',
  qi: 'Toi3mIBoHKX0xF2yQAOG_FVQfjCjLGGZMYMfPlDygZt2XX4-mCbT15QlVXZ9nyqS0OtUt_t5IwyhN0LP3c55lyv0J0TDNyeGWEuFBj03PSoWshMaSaoXj7cqRHzUp9wKyqSW10cSN0WZKXD-NfANLessg8ykT5NquPog802dKlg',
};

let privateKey: KeyLike | Uint8Array;

export async function newToken(player: string): Promise<string> {
  if (!privateKey) {
    privateKey = await importJWK(privateJWK, alg);
  }

  return new SignJWT({})
    .setProtectedHeader({ alg })
    .setSubject(player)
    .setIssuer(config.get('auth.issuer'))
    .setAudience(config.get('auth.audience'))
    .sign(privateKey);
}

export async function startServer(): Promise<{ kill: () => void }> {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ keys: [publicJWK] }));
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(() => {
      const { port } = server.address() as AddressInfo;

      fs.writeFile(
        'config/e2e.yaml',
        yaml.dump(
          config.util.toObject(
            config.util.extendDeep(config, {
              auth: {
                jwks_uri: `http://localhost:${port}/`,
              },
            })
          )
        ),
        (err) => {
          if (err) {
            reject(err);
          } else resolve();
        }
      );
    });
  });

  return {
    kill: () => server.close(),
  };
}
