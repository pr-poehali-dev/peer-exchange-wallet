import { useState } from 'react';
import Icon from '@/components/ui/icon';

type Tab = 'home' | 'wallet' | 'exchange' | 'friends';
type Currency = 'RUB' | 'USDT' | 'BTC' | 'ETH';

interface Friend {
  id: number;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline';
  verified: boolean;
}

interface Transaction {
  id: number;
  type: 'in' | 'out';
  amount: number;
  currency: Currency;
  from: string;
  date: string;
  status: 'completed' | 'pending';
}

const friends: Friend[] = [
  { id: 1, name: 'Алексей Громов', username: '@agromov', avatar: 'АГ', status: 'online', verified: true },
  { id: 2, name: 'Мария Лебедева', username: '@mlebed', avatar: 'МЛ', status: 'online', verified: true },
  { id: 3, name: 'Денис Ковалёв', username: '@dkovalev', avatar: 'ДК', status: 'offline', verified: false },
  { id: 4, name: 'Ольга Петрова', username: '@opetrov', avatar: 'ОП', status: 'offline', verified: true },
];

const transactions: Transaction[] = [
  { id: 1, type: 'in', amount: 15000, currency: 'RUB', from: 'Алексей Громов', date: '27 фев, 14:32', status: 'completed' },
  { id: 2, type: 'out', amount: 0.0023, currency: 'BTC', from: 'Мария Лебедева', date: '27 фев, 11:10', status: 'completed' },
  { id: 3, type: 'in', amount: 250, currency: 'USDT', from: 'Денис Ковалёв', date: '26 фев, 18:44', status: 'completed' },
  { id: 4, type: 'out', amount: 5000, currency: 'RUB', from: 'Ольга Петрова', date: '26 фев, 09:01', status: 'pending' },
];

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

const walletBalances: Record<Currency, number> = {
  RUB: 142500,
  USDT: 1240,
  BTC: 0.0148,
  ETH: 2.34,
};

export default function Index() {
  const [tab, setTab] = useState<Tab>('home');
  const [fromCurrency, setFromCurrency] = useState<Currency>('RUB');
  const [toCurrency, setToCurrency] = useState<Currency>('USDT');
  const [amount, setAmount] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState<Currency>('RUB');

  const convertedAmount = amount
    ? ((parseFloat(amount) * RATES[fromCurrency]) / RATES[toCurrency]).toFixed(
        toCurrency === 'BTC' ? 6 : toCurrency === 'ETH' ? 4 : 2
      )
    : '';

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
      f.username.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'wallet', icon: 'Wallet', label: 'Кошелёк' },
    { id: 'exchange', icon: 'ArrowLeftRight', label: 'Обмен' },
    { id: 'friends', icon: 'Users', label: 'Друзья' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-golos text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(201,168,76,0.08),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <main className="flex-1 overflow-y-auto pb-28 relative z-10">

        {/* ГЛАВНАЯ */}
        {tab === 'home' && (
          <div className="animate-fade-in">
            <div className="px-6 pt-12 pb-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs tracking-[0.2em] text-[#C9A84C] uppercase mb-1">Добро пожаловать</p>
                  <h1 className="font-cormorant text-3xl font-semibold text-white">Иван Соколов</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-[#C9A84C]">ИС</span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#C9A84C]/20 via-[#1A1A1E] to-[#0A0A0C] border border-[#C9A84C]/20 p-6">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#C9A84C]/5 -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <p className="text-xs tracking-widest text-[#888] uppercase mb-2">Общий баланс</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="font-cormorant text-5xl font-semibold text-white">142 500</span>
                  <span className="text-[#C9A84C] text-lg mb-1">₽</span>
                </div>
                <div className="flex gap-4 text-xs text-[#888]">
                  <span>≈ 1 240 USDT</span>
                  <span>·</span>
                  <span>≈ 0.0148 BTC</span>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase">Последние операции</h2>
                <button className="text-xs text-[#C9A84C]">Все</button>
              </div>
              <div className="space-y-2">
                {transactions.slice(0, 3).map((tx, i) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-fade-in"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      <Icon name={tx.type === 'in' ? 'ArrowDownLeft' : 'ArrowUpRight'} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{tx.from}</p>
                      <p className="text-xs text-[#555]">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${tx.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'in' ? '+' : '−'}{tx.amount} {SYMBOLS[tx.currency]}
                      </p>
                      <p className={`text-xs ${tx.status === 'pending' ? 'text-amber-400' : 'text-[#444]'}`}>
                        {tx.status === 'pending' ? 'В обработке' : 'Выполнено'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
              {(Object.keys(walletBalances) as Currency[]).map((cur, i) => (
                <div
                  key={cur}
                  className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#C9A84C]/20 transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#C9A84C]">{SYMBOLS[cur]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{cur}</p>
                    <p className="text-xs text-[#555] mt-0.5">
                      ≈ {(walletBalances[cur] * RATES[cur]).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-cormorant text-xl font-semibold text-white">
                      {walletBalances[cur].toLocaleString('ru-RU', { maximumFractionDigits: 6 })}
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
                  Пополнение счёта
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Банковская карта', icon: 'CreditCard', sub: 'Visa, MC, МИР' },
                    { label: 'СБП', icon: 'Smartphone', sub: 'Мгновенно' },
                    { label: 'USDT (TRC20)', icon: 'Coins', sub: 'Криптовалюта' },
                    { label: 'Bitcoin', icon: 'Bitcoin', sub: 'Криптовалюта' },
                  ].map((m) => (
                    <button
                      key={m.label}
                      className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#C9A84C]/30 hover:bg-white/[0.07] transition-all text-left"
                    >
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
                  Отправить другу
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#555] uppercase tracking-wider mb-2 block">Получатель</label>
                    <div className="flex gap-2">
                      {friends.slice(0, 4).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFriend(f)}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                            selectedFriend?.id === f.id
                              ? 'bg-[#C9A84C]/20 border-[#C9A84C]/50 text-[#C9A84C]'
                              : 'bg-white/[0.03] border-white/10 text-[#888] hover:border-white/20'
                          }`}
                        >
                          {f.avatar}
                        </button>
                      ))}
                    </div>
                    {selectedFriend && (
                      <p className="text-xs text-[#C9A84C] mt-1.5">{selectedFriend.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-[#555] uppercase tracking-wider mb-2 block">Сумма</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/40"
                      />
                      <select
                        value={sendCurrency}
                        onChange={(e) => setSendCurrency(e.target.value as Currency)}
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-[#C9A84C]/40"
                      >
                        {(Object.keys(SYMBOLS) as Currency[]).map((c) => (
                          <option key={c} value={c} className="bg-[#1A1A1E]">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button className="w-full py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0C] font-semibold text-sm hover:bg-[#E2C87A] transition-colors">
                    Отправить
                  </button>
                </div>
              </div>
            )}

            <h2 className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase mb-3">История операций</h2>
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    <Icon name={tx.type === 'in' ? 'ArrowDownLeft' : 'ArrowUpRight'} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{tx.from}</p>
                    <p className="text-xs text-[#555]">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'in' ? '+' : '−'}{tx.amount} {SYMBOLS[tx.currency]}
                    </p>
                    <p className={`text-xs ${tx.status === 'pending' ? 'text-amber-400' : 'text-[#444]'}`}>
                      {tx.status === 'pending' ? 'В обработке' : 'Выполнено'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white font-cormorant text-xl placeholder-[#2A2A2A] focus:outline-none focus:border-[#C9A84C]/50"
                    />
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value as Currency)}
                      className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#C9A84C]/50 min-w-[95px]"
                    >
                      {(Object.keys(SYMBOLS) as Currency[]).map((c) => (
                        <option key={c} value={c} className="bg-[#1A1A1E]">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const tmp = fromCurrency;
                      setFromCurrency(toCurrency);
                      setToCurrency(tmp);
                      setAmount('');
                    }}
                    className="w-9 h-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center hover:bg-[#C9A84C]/20 hover:scale-110 transition-all"
                  >
                    <Icon name="ArrowUpDown" size={16} className="text-[#C9A84C]" />
                  </button>
                </div>

                <div>
                  <label className="text-xs text-[#444] mb-1.5 block">Получаю</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3.5 font-cormorant text-xl text-[#C9A84C]">
                      {convertedAmount || '0'}
                    </div>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value as Currency)}
                      className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#C9A84C]/50 min-w-[95px]"
                    >
                      {(Object.keys(SYMBOLS) as Currency[]).map((c) => (
                        <option key={c} value={c} className="bg-[#1A1A1E]">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {amount && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-[#C9A84C]/5 border border-[#C9A84C]/10">
                  <p className="text-xs text-[#888]">
                    Курс: 1 {fromCurrency} = {(RATES[fromCurrency] / RATES[toCurrency]).toFixed(
                      toCurrency === 'BTC' ? 8 : toCurrency === 'ETH' ? 6 : 2
                    )} {toCurrency}
                  </p>
                </div>
              )}

              <button className="w-full mt-5 py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0C] font-semibold text-sm hover:bg-[#E2C87A] transition-colors">
                Обменять
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <h3 className="text-xs text-[#555] uppercase tracking-widest mb-4">Обмен с другом</h3>
              <div className="space-y-2">
                {friends.filter((f) => f.status === 'online').map((f, i) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#C9A84C]/20 transition-all animate-fade-in"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#C9A84C]">{f.avatar}</span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0A0A0C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-white truncate">{f.name}</p>
                        {f.verified && <Icon name="BadgeCheck" size={13} className="text-[#C9A84C] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#555]">{f.username}</p>
                    </div>
                    <button className="px-4 py-1.5 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-xs text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-colors font-medium">
                      Обменять
                    </button>
                  </div>
                ))}
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
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Поиск по имени или @username"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#C9A84C]/30"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Всего', value: friends.length },
                { label: 'Онлайн', value: friends.filter((f) => f.status === 'online').length },
                { label: 'Верифиц.', value: friends.filter((f) => f.verified).length },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <p className="font-cormorant text-2xl font-semibold text-[#C9A84C]">{s.value}</p>
                  <p className="text-xs text-[#555] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {filteredFriends.map((f, i) => (
                <div
                  key={f.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#C9A84C]/15 transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#C9A84C]">{f.avatar}</span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A0A0C] ${f.status === 'online' ? 'bg-emerald-400' : 'bg-[#333]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-white truncate">{f.name}</p>
                      {f.verified && <Icon name="BadgeCheck" size={13} className="text-[#C9A84C] shrink-0" />}
                    </div>
                    <p className="text-xs text-[#555]">{f.username} · {f.status === 'online' ? <span className="text-emerald-400">онлайн</span> : 'оффлайн'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setTab('wallet'); setShowSend(true); setShowTopUp(false); setSelectedFriend(f); }}
                      className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#666] hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-all"
                    >
                      <Icon name="Send" size={14} />
                    </button>
                    <button
                      onClick={() => setTab('exchange')}
                      className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#666] hover:text-white hover:border-white/20 transition-all"
                    >
                      <Icon name="ArrowLeftRight" size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredFriends.length === 0 && (
                <div className="text-center py-16">
                  <Icon name="UserX" size={36} className="text-[#2A2A2A] mx-auto mb-3" />
                  <p className="text-sm text-[#444]">Никого не найдено</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-5">
          <div className="bg-[#111115]/95 backdrop-blur-xl border border-white/[0.07] rounded-2xl px-2 py-2 flex justify-around">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-all ${
                  tab === item.id
                    ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                    : 'text-[#444] hover:text-[#777]'
                }`}
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
