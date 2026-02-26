"""
Аутентификация: register, login, logout, me — через поле action в теле запроса.
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = 't_p36388408_peer_exchange_wallet'
CURRENCIES = ['RUB', 'USDT', 'BTC', 'ETH']

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def gen_token() -> str:
    return secrets.token_hex(48)


def make_avatar(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return name[:2].upper()


def ok(data: dict) -> dict:
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False)}


def err(msg: str, code: int = 400) -> dict:
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token', '') or headers.get('x-auth-token', '')
    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    conn = get_conn()
    cur = conn.cursor()

    try:
        # --- REGISTER ---
        if action == 'register':
            name = (body.get('name') or '').strip()
            username = (body.get('username') or '').strip().lower().lstrip('@')
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''

            if not all([name, username, email, password]):
                return err('Заполните все поля')
            if len(password) < 6:
                return err('Пароль минимум 6 символов')

            cur.execute(
                f"SELECT id FROM {SCHEMA}.users WHERE email = %s OR username = %s",
                (email, username)
            )
            if cur.fetchone():
                return err('Email или username уже занят', 409)

            avatar = make_avatar(name)
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (name, username, email, password_hash, avatar) "
                f"VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (name, username, email, hash_password(password), avatar)
            )
            user_id = cur.fetchone()[0]

            for cur_code in CURRENCIES:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.wallets (user_id, currency, balance) VALUES (%s, %s, 0)",
                    (user_id, cur_code)
                )

            tok = gen_token()
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
                (user_id, tok)
            )
            conn.commit()

            return ok({
                'token': tok,
                'user': {'id': user_id, 'name': name, 'username': username,
                         'email': email, 'avatar': avatar, 'verified': False}
            })

        # --- LOGIN ---
        if action == 'login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''

            cur.execute(
                f"SELECT id, name, username, email, avatar, verified, password_hash "
                f"FROM {SCHEMA}.users WHERE email = %s",
                (email,)
            )
            row = cur.fetchone()
            if not row or row[6] != hash_password(password):
                return err('Неверный email или пароль', 401)

            tok = gen_token()
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
                (row[0], tok)
            )
            conn.commit()

            return ok({
                'token': tok,
                'user': {'id': row[0], 'name': row[1], 'username': row[2],
                         'email': row[3], 'avatar': row[4], 'verified': row[5]}
            })

        # --- ME ---
        if action == 'me':
            if not token:
                return err('Не авторизован', 401)

            cur.execute(
                f"SELECT u.id, u.name, u.username, u.email, u.avatar, u.verified "
                f"FROM {SCHEMA}.sessions s "
                f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
                f"WHERE s.token = %s AND s.expires_at > NOW()",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return err('Не авторизован', 401)

            user = {'id': row[0], 'name': row[1], 'username': row[2],
                    'email': row[3], 'avatar': row[4], 'verified': row[5]}

            cur.execute(
                f"SELECT currency, balance FROM {SCHEMA}.wallets WHERE user_id = %s",
                (user['id'],)
            )
            wallets = {r[0]: float(r[1]) for r in cur.fetchall()}

            cur.execute(
                f"SELECT t.id, t.type, t.currency, t.amount, t.status, t.created_at, "
                f"uf.name, ut.name "
                f"FROM {SCHEMA}.transactions t "
                f"LEFT JOIN {SCHEMA}.users uf ON uf.id = t.from_user_id "
                f"LEFT JOIN {SCHEMA}.users ut ON ut.id = t.to_user_id "
                f"WHERE t.from_user_id = %s OR t.to_user_id = %s "
                f"ORDER BY t.created_at DESC LIMIT 20",
                (user['id'], user['id'])
            )
            txs = []
            for r in cur.fetchall():
                txs.append({
                    'id': r[0], 'type': r[1], 'currency': r[2],
                    'amount': float(r[3]), 'status': r[4],
                    'date': r[5].strftime('%d %b, %H:%M'),
                    'from_name': r[6], 'to_name': r[7]
                })

            return ok({'user': user, 'wallets': wallets, 'transactions': txs})

        # --- LOGOUT ---
        if action == 'logout':
            if token:
                cur.execute(
                    f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s",
                    (token,)
                )
                conn.commit()
            return ok({'ok': True})

        return err('Неизвестное действие')

    finally:
        cur.close()
        conn.close()