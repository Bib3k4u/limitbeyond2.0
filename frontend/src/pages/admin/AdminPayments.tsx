import React, { useEffect, useState } from 'react';
import { paymentApi } from '@/services/api/paymentApi';
import userService from '@/services/api/userService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [userId, setUserId] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [months, setMonths] = useState(1);
  const [members, setMembers] = useState<any[]>([]);
  const [revenueSeries, setRevenueSeries] = useState<any[]>([]);

  const prices: Record<number, number> = {
    1: 1800,
    3: 4500,
    6: 9000,
    12: 12000,
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const resp = await userService.getAllMembers();
        const mems = resp || [];
        const enriched = await Promise.all(mems.map(async (m: any) => {
          try {
            const pr = await paymentApi.getPaymentsForUser(m.id);
            const pays = pr.data || [];
            if (pays.length === 0) return { ...m, expiry: null };
            const last = pays.reduce((a: any, b: any) => new Date(a.paidAt) > new Date(b.paidAt) ? a : b);
            const paid = new Date(last.paidAt || last.paidAt);
            const expiry = new Date(paid);
            expiry.setMonth(expiry.getMonth() + (last.months || 0));
            return { ...m, expiry: expiry.toISOString().split('T')[0] };
          } catch (e) {
            return { ...m, expiry: null };
          }
        }));
        setMembers(enriched);
      } catch (e) {
        console.error('Failed to fetch members', e);
      }
    };

    const fetchRevenue = async () => {
      try {
        const end = format(new Date(), 'yyyy-MM-dd');
        const start = format(subDays(new Date(), 29), 'yyyy-MM-dd');
        const revResp = await paymentApi.getRevenue(start, end);
        setRevenueSeries(revResp.data || []);
      } catch (e) {
        console.warn('Failed to load revenue', e);
      }
    };

    fetchMembers();
    fetchRevenue();
  }, []);

  const loadForUser = async (id?: string) => {
    const uid = id || userId;
    if (!uid) return;
    const resp = await paymentApi.getPaymentsForUser(uid);
    setPayments(resp.data || []);
    setUserId(uid);
    try {
      const profile = await userService.getUserById(uid);
      setSelectedMember(profile);
    } catch (e) {
      setSelectedMember(null);
    }
  };

  const addPayment = async () => {
    if (!userId) return;
    const payload = { userId, months, amount: prices[months], paidAt: new Date().toISOString() };
    await paymentApi.createPayment(payload);
    await loadForUser(userId);
  };

  const computeExpiry = (pays: any[]) => {
    if (!pays || pays.length === 0) return 'No plan';
    const last = pays.reduce((a: any, b: any) => new Date(a.paidAt) > new Date(b.paidAt) ? a : b);
    const paid = new Date(last.paidAt || last.paidAt);
    const expiry = new Date(paid);
    expiry.setMonth(expiry.getMonth() + (last.months || 0));
    return expiry.toISOString().split('T')[0];
  };

  return (
    <div className="bg-lb-darker text-white p-4 rounded">
      <h2 className="text-lg font-semibold mb-4">Payments</h2>
      <div className="mb-4 flex items-center gap-2">
        <select className="p-2 bg-lb-darker border" onChange={e=> loadForUser(e.target.value)}>
          <option value="">Select member</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.firstName} {m.lastName} — {m.email}</option>
          ))}
        </select>

        <select value={months} onChange={e => setMonths(Number(e.target.value))} className="p-2 bg-lb-darker border">
          <option value={1}>1 month - ₹1800</option>
          <option value={3}>3 months - ₹4500</option>
          <option value={6}>6 months - ₹9000</option>
          <option value={12}>12 months - ₹12000</option>
        </select>

        <button className="btn bg-lb-accent text-white" onClick={addPayment}>Add Payment</button>
      </div>

      <div>
        <h3 className="font-medium mb-2">Payments for {selectedMember ? (
          <span className="text-white">{selectedMember.firstName} {selectedMember.lastName} <span className="text-sm text-white/70">({selectedMember.email})</span></span>
        ) : userId ? (
          <span className="text-white">{userId}</span>
        ) : '—'}</h3>
        <ul>
          {payments.map(p => (
            <li key={p.id} className="mb-2 text-white/90">{new Date(p.paidAt).toLocaleString()} — ₹{p.amount} — {p.months} months</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="font-medium">Members & Plan Expiry</h4>
        <ul>
          {members.map(m => (
            <li key={m.id} className="flex items-center justify-between border-b py-2">
              <div>{m.firstName} {m.lastName} <span className="text-sm text-white/70">({m.email})</span></div>
              <div className="text-sm text-white">Expiry: <span className="font-medium">{m.expiry || 'N/A'}</span></div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <h4 className="font-medium mb-2 text-white">Revenue (30d)</h4>
        <div className="bg-white/5 p-4 rounded">
          {revenueSeries.length === 0 ? (
            <div className="text-white/80">No revenue data yet.</div>
          ) : (
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={revenueSeries}>
                  <XAxis dataKey="date" tick={{ fill: 'white' }} />
                  <YAxis tick={{ fill: 'white' }} />
                  <Tooltip formatter={(v:any)=>`₹${v}`} />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
