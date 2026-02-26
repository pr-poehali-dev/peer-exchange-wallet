
CREATE TABLE IF NOT EXISTS t_p36388408_peer_exchange_wallet.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) DEFAULT '',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p36388408_peer_exchange_wallet.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p36388408_peer_exchange_wallet.users(id),
    token VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE IF NOT EXISTS t_p36388408_peer_exchange_wallet.wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p36388408_peer_exchange_wallet.users(id),
    currency VARCHAR(10) NOT NULL,
    balance NUMERIC(24, 8) DEFAULT 0,
    UNIQUE(user_id, currency)
);

CREATE TABLE IF NOT EXISTS t_p36388408_peer_exchange_wallet.friends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p36388408_peer_exchange_wallet.users(id),
    friend_id INTEGER NOT NULL REFERENCES t_p36388408_peer_exchange_wallet.users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS t_p36388408_peer_exchange_wallet.transactions (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES t_p36388408_peer_exchange_wallet.users(id),
    to_user_id INTEGER REFERENCES t_p36388408_peer_exchange_wallet.users(id),
    currency VARCHAR(10) NOT NULL,
    amount NUMERIC(24, 8) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    note TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);
