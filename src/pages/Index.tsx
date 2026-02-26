import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

const AUTH_URL = func2url.auth;

type Tab = 'home' | 'wallet' | 'exchange' | 'friends';
type Currency = 'RUB' | 'USDT' | 'BTC' | 'ETH';
type AuthScreen = 'login' | 'register';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  verified: boolean;
}

interface Transaction {
  id: number;
  type: string;
  currency: Currency;
  amount: number;
  status: string;
  date: string;
  from_name: string | null;
  to_name: string | null;
}

const RATES: Record<Currency, number> = {
  RUB: 1,
  USDT: 92.4,
  BTC: 8320000,
  ETH: 280000,
};

const SYMBOLS: Record<Currency, string> = {
  RUB: '₽',
  USDT: '$',
  BTC: '₿',
  ETH: 'Ξ',
};

const CURRENCIES: Currency[] = ['RUB', 'USDT', 'BTC', 'ETH'];

async function authApi(action: string, data: object = {}, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['X-Auth-Token'] = token;
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...data }),
  });
  const text = await res.text();
  let json = JSON.parse(text);
  if (typeof json === 'string') json = JSON.parse(json);
  return { data: json, status: res.status };
}

// ───── AUTH SCREEN ─────
function AuthPage({ onAuth }: { onAuth: (token: string, user: User) => void }) {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, status } = await authApi(screen, form);
    setLoading(false);
    if (status !== 200) {
      setError(data.error || 'Ошибка сервера');
      return;
    }
    localStorage.setItem('token', data.token);
    onAuth(data.token, data.user);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-golos text-white flex flex-col items-center justify-center px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(201,168,76,0.1),transparent)] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 mb-4">
            <Icon name="ArrowLeftRight" size={24} className="text-[#C9A84C]" />
          </div>
          <h1 className="font-cormorant text-3xl font-semibold text-white">P2P Exchange</h1>
          <p className="text-xs text-[#555] mt-1 tracking-widest uppercase">Безопасный обмен</p>
        </div>

        <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.08] p-1 mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          {(['login', 'register'] as AuthScreen[]).map((s) => (
            <button
              key={s}
              onClick={() => { setScreen(s); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                screen === s ? 'bg-[#C9A84C] text-[#0A0A0C]' : 'text-[#666] hover:text-[#999]'
              }`}
            >
              {s === 'login' ? 'Вход' : 'Регистрация'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {screen === 'register' && (
            <>
              <div>
                <label className="text-xs text-[#555] uppercase tracking-wider mb-1.5 block">Имя и фамилия</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Иван Соколов"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#555] uppercase tracking-wider mb-1.5 block">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] text-sm">@</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={set('username')}
                    placeholder="isokolov"
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/40 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-[#555] uppercase tracking-wider mb-1.5 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="ivan@example.com"
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/40 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#555] uppercase tracking-wider mb-1.5 block">Пароль</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Минимум 6 символов"
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/40 transition-colors"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-scale-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0C] font-semibold text-sm hover:bg-[#E2C87A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
          >
            {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
            {screen === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="text-center text-xs text-[#383838] mt-6">
          Данные защищены и не передаются третьим лицам
        </p>
      </div>
    </div>
  );
}

// ───── MAIN APP ─────
export default function Index() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Record<Currency, number>>({ RUB: 0, USDT: 0, BTC: 0, ETH: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>('home');
  const [fromCurrency, setFromCurrency] = useState<Currency>('RUB');
  const [toCurrency, setToCurrency] = useState<Currency>('USDT');
  const [amount, setAmount] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState<Currency>('RUB');

  const loadMe = useCallback(async (tok: string) => {
    const { data, status } = await authApi('me', {}, tok);
    if (status === 401) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    setUser(parsed.user);
    setWallets({ RUB: 0, USDT: 0, BTC: 0, ETH: 0, ...(parsed.wallets || {}) });
    setTransactions(parsed.transactions || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      loadMe(token);
    } else {
      setLoading(false);
    }
  }, [token, loadMe]);

  const onAuth = (tok: string, u: User) => {
    setToken(tok);
    setUser(u);
    setWallets({ RUB: 0, USDT: 0, BTC: 0, ETH: 0 });
    setLoading(false);
  };

  const logout = async () => {
    if (token) await authApi('logout', {}, token);
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const convertedAmount = amount
    ? ((parseFloat(amount) * RATES[fromCurrency]) / RATES[toCurrency]).toFixed(
        toCurrency === 'BTC' ? 6 : toCurrency === 'ETH' ? 4 : 2
      )
    : '';

  const totalRub = CURRENCIES.reduce((s, c) => s + wallets[c] * RATES[c], 0);

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'wallet', icon: 'Wallet', label: 'Кошелёк' },
    { id: 'exchange', icon: 'ArrowLeftRight', label: 'Обмен' },
    { id: 'friends', icon: 'Users', label: 'Друзья' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon name="Loader2" size={28} className="text-[#C9A84C] animate-spin" />
          <p className="text-xs text-[#444] tracking-widest uppercase">Загрузка</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <AuthPage onAuth={onAuth} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-golos text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(201,168,76,0.08),transparent)]" />
      </div>

      <main className="flex-1 overflow-y-auto pb-28 relative z-10">

        {/* ГЛАВНАЯ */}
        {tab === 'home' && (
          <div className="animate-fade-in">
            <div className="px-6 pt-12 pb-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs tracking-[0.2em] text-[#C9A84C] uppercase mb-1">Добро пожаловать</p>
                  <h1 className="font-cormorant text-3xl font-semibold text-white">{user.name}</h1>
                </div>
                <button
                  onClick={logout}
                  className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                  title="Выйти"
                >
                  <span className="text-sm font-semibold text-[#C9A84C] group-hover:hidden">{user.avatar}</span>
                  <Icon name="LogOut" size={14} className="text-red-400 hidden group-hover:block" />
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#C9A84C]/20 via-[#1A1A1E] to-[#0A0A0C] border border-[#C9A84C]/20 p-6">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#C9A84C]/5 -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <p className="text-xs tracking-widest text-[#888] uppercase mb-2">Общий баланс</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="font-cormorant text-5xl font-semibold text-white">
                    {totalRub.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[#C9A84C] text-lg mb-1">₽</span>
                </div>
                <div className="flex gap-4 text-xs text-[#888]">
                  <span>≈ {wallets.USDT.toFixed(2)} USDT</span>
                  <span>·</span>
                  <span>≈ {wallets.BTC.toFixed(6)} BTC</span>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => { setTab('wallet'); setShowTopUp(true); setShowSend(false); }}
                    className="flex-1 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0C] text-sm font-semibold tracking-wide hover:bg-[#E2C87A] transition-colors"
                  >
                    Пополнить
                  </button>
                  <button
                    onClick={() => { setTab('wallet'); setShowSend(true); setShowTopUp(false); }}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-colors"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 mb-8">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: 'ArrowLeftRight', label: 'Обмен', action: () => setTab('exchange') },
                  { icon: 'UserPlus', label: 'Друзья', action: () => setTab('friends') },
                  { icon: 'ShieldCheck', label: 'Верификация', action: () => {} },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex flex-col items-center gap-2 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-[#C9A84C]/30 transition-all"
                  >
                    <Icon name={item.icon} size={20} className="text-[#C9A84C]" />
                    <span className="text-xs text-[#888]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6">
              <h2 className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase mb-4">Последние операции</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <Icon name="Clock" size={28} className="text-[#2A2A2A] mx-auto mb-2" />
                  <p className="text-sm text-[#444]">Операций пока нет</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 4).map((tx, i) => {
                    const isIn = tx.to_name === user.name || tx.type === 'in';
                    return (
                      <div key={tx.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isIn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          <Icon name={isIn ? 'ArrowDownLeft' : 'ArrowUpRight'} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{isIn ? tx.from_name : tx.to_name}</p>
                          <p className="text-xs text-[#555]">{tx.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${isIn ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isIn ? '+' : '−'}{tx.amount} {SYMBOLS[tx.currency]}
                          </p>
                          <p className={`text-xs ${tx.status === 'pending' ? 'text-amber-400' : 'text-[#444]'}`}>
                            {tx.status === 'pending' ? 'В обработке' : 'Выполнено'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* КОШЕЛЁК */}
        {tab === 'wallet' && (
          <div className="animate-fade-in px-6 pt-12">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-cormorant text-3xl font-semibold">Кошелёк</h1>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400">Защищён</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {CURRENCIES.map((cur, i) => (
                <div key={cur} className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#C9A84C]/20 transition-all animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#C9A84C]">{SYMBOLS[cur]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{cur}</p>
                    <p className="text-xs text-[#555] mt-0.5">≈ {(wallets[cur] * RATES[cur]).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</p>
                  </div>
                  <div className="text-right">
                    <p className="font-cormorant text-xl font-semibold text-white">
                      {wallets[cur].toLocaleString('ru-RU', { maximumFractionDigits: 8 })}
                    </p>
                    <p className="text-xs text-[#555]">{cur}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => { setShowTopUp(!showTopUp); setShowSend(false); }}
                className="py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0C] font-semibold text-sm hover:bg-[#E2C87A] transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="Plus" size={16} />
                Пополнить
              </button>
              <button
                onClick={() => { setShowSend(!showSend); setShowTopUp(false); }}
                className="py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="Send" size={16} />
                Отправить
              </button>
            </div>

            {showTopUp && (
              <div className="mb-6 p-5 rounded-2xl bg-white/[0.03] border border-[#C9A84C]/20 animate-scale-in">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                  <Icon name="Plus" size={15} className="text-[#C9A84C]" />
                  Способ пополнения
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Банковская карта', icon: 'CreditCard', sub: 'Visa, MC, МИР' },
                    { label: 'СБП', icon: 'Smartphone', sub: 'Мгновенно' },
                    { label: 'USDT (TRC20)', icon: 'Coins', sub: 'Криптовалюта' },
                    { label: 'Bitcoin', icon: 'Bitcoin', sub: 'Криптовалюта' },
                  ].map((m) => (
                    <button key={m.label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#C9A84C]/30 hover:bg-white/[0.07] transition-all text-left">
                      <Icon name={m.icon} size={18} className="text-[#C9A84C] mb-2" />
                      <p className="text-sm text-white font-medium leading-tight">{m.label}</p>
                      <p className="text-xs text-[#555] mt-0.5">{m.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showSend && (
              <div className="mb-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10 animate-scale-in">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                  <Icon name="Send" size={15} className="text-[#C9A84C]" />
                  Отправить пользователю
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#555] uppercase tracking-wider mb-2 block">Username получателя</label>
                    <input type="text" placeholder="@username" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/40" />
                  </div>
                  <div>
                    <label className="text-xs text-[#555] uppercase tracking-wider mb-2 block">Сумма</label>
                    <div className="flex gap-2">
                      <input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/40" />
                      <select value={sendCurrency} onChange={(e) => setSendCurrency(e.target.value as Currency)} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-[#C9A84C]/40">
                        {CURRENCIES.map((c) => <option key={c} value={c} className="bg-[#1A1A1E]">{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <button className="w-full py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0C] font-semibold text-sm hover:bg-[#E2C87A] transition-colors">
                    Отправить
                  </button>
                </div>
              </div>
            )}

            <h2 className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase mb-3 mt-2">История операций</h2>
            {transactions.length === 0 ? (
              <div className="text-center py-8"><p className="text-sm text-[#444]">Нет операций</p></div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx, i) => {
                  const isIn = tx.to_name === user.name || tx.type === 'in';
                  return (
                    <div key={tx.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isIn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <Icon name={isIn ? 'ArrowDownLeft' : 'ArrowUpRight'} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{isIn ? tx.from_name : tx.to_name}</p>
                        <p className="text-xs text-[#555]">{tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${isIn ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isIn ? '+' : '−'}{tx.amount} {SYMBOLS[tx.currency]}
                        </p>
                        <p className={`text-xs ${tx.status === 'pending' ? 'text-amber-400' : 'text-[#444]'}`}>
                          {tx.status === 'pending' ? 'В обработке' : 'Выполнено'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ОБМЕН */}
        {tab === 'exchange' && (
          <div className="animate-fade-in px-6 pt-12">
            <div className="mb-8">
              <p className="text-xs tracking-[0.2em] text-[#C9A84C] uppercase mb-1">P2P платформа</p>
              <h1 className="font-cormorant text-3xl font-semibold">Обмен</h1>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-5">
              <h3 className="text-xs text-[#555] uppercase tracking-widest mb-5">Конвертер валют</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#444] mb-1.5 block">Отдаю</label>
                  <div className="flex gap-2">
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white font-cormorant text-xl placeholder-[#2A2A2A] focus:outline-none focus:border-[#C9A84C]/50" />
                    <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value as Currency)} className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#C9A84C]/50 min-w-[95px]">
                      {CURRENCIES.map((c) => <option key={c} value={c} className="bg-[#1A1A1E]">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => { const tmp = fromCurrency; setFromCurrency(toCurrency); setToCurrency(tmp); setAmount(''); }}
                    className="w-9 h-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center hover:bg-[#C9A84C]/20 hover:scale-110 transition-all"
                  >
                    <Icon name="ArrowUpDown" size={16} className="text-[#C9A84C]" />
                  </button>
                </div>

                <div>
                  <label className="text-xs text-[#444] mb-1.5 block">Получаю</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3.5 font-cormorant text-xl text-[#C9A84C]">{convertedAmount || '0'}</div>
                    <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value as Currency)} className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#C9A84C]/50 min-w-[95px]">
                      {CURRENCIES.map((c) => <option key={c} value={c} className="bg-[#1A1A1E]">{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {amount && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-[#C9A84C]/5 border border-[#C9A84C]/10">
                  <p className="text-xs text-[#888]">
                    Курс: 1 {fromCurrency} = {(RATES[fromCurrency] / RATES[toCurrency]).toFixed(toCurrency === 'BTC' ? 8 : toCurrency === 'ETH' ? 6 : 2)} {toCurrency}
                  </p>
                </div>
              )}
              <button className="w-full mt-5 py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0C] font-semibold text-sm hover:bg-[#E2C87A] transition-colors">
                Обменять
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <h3 className="text-xs text-[#555] uppercase tracking-widest mb-2">Обмен с пользователем</h3>
              <p className="text-xs text-[#444] mb-4">Найдите пользователя для прямого P2P обмена</p>
              <div className="flex gap-2">
                <input type="text" placeholder="@username" className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/40" />
                <button className="px-5 py-3 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-sm text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-colors font-medium">
                  Найти
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ДРУЗЬЯ */}
        {tab === 'friends' && (
          <div className="animate-fade-in px-6 pt-12">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-cormorant text-3xl font-semibold">Друзья</h1>
              <button className="w-9 h-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center hover:bg-[#C9A84C]/20 transition-colors">
                <Icon name="UserPlus" size={16} className="text-[#C9A84C]" />
              </button>
            </div>

            <div className="relative mb-6">
              <Icon name="Search" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
              <input type="text" placeholder="Поиск по @username" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/30" />
            </div>

            <div className="text-center py-16">
              <Icon name="Users" size={36} className="text-[#2A2A2A] mx-auto mb-3" />
              <p className="text-sm text-[#555] mb-1">Друзей пока нет</p>
              <p className="text-xs text-[#383838]">Найдите пользователей по @username</p>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-5">
          <div className="bg-[#111115]/95 backdrop-blur-xl border border-white/[0.07] rounded-2xl px-2 py-2 flex justify-around">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-all ${tab === item.id ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-[#444] hover:text-[#777]'}`}
              >
                <Icon name={item.icon} size={20} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
