import React, { useEffect, useState } from 'react';
import { checkinApi } from '@/services/api/checkinApi';
import userService from '@/services/api/userService';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';

export default function AdminCheckins() {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [singleQrUrl, setSingleQrUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'recent'|'today'|'7'|'30'>('recent');
  const [query, setQuery] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({ recent: 0, today: 0, '7': 0, '30': 0, total: 0 });

  const loadRecent = async () => {
    const resp = await checkinApi.recent(100);
    const list = resp.data || [];
    // enrich with user details when available
    const enriched = await Promise.all(list.map(async (c: any) => {
      try {
        const u = await userService.getUserById(c.userId);
        return { ...c, userName: `${u.firstName} ${u.lastName}`.trim() || u.username || u.email, userRole: u.roles?.[0] };
      } catch (e) {
        return c;
      }
    }));
    setCheckins(enriched);
    setCounts(prev => ({ ...prev, recent: enriched.length, total: enriched.length }));
  };

  const fetchBetween = async (s: string, e: string, tabKey: string) => {
    const resp = await checkinApi.between(s, e);
    const list = resp.data || [];
    setCheckins(list);
    setCounts(prev => ({ ...prev, [tabKey]: list.length }));
  };

  useEffect(() => { loadRecent(); }, []);

  // populate counts for other tabs on mount (lightweight count fetches)
  useEffect(() => {
    (async () => {
      try {
        const today = format(new Date(),'yyyy-MM-dd');
        const endD = new Date();
        const start7 = new Date(); start7.setDate(start7.getDate()-7);
        const start30 = new Date(); start30.setMonth(start30.getMonth()-1);
        const t7s = format(start7,'yyyy-MM-dd'); const t7e = format(endD,'yyyy-MM-dd');
        const t30s = format(start30,'yyyy-MM-dd'); const t30e = format(endD,'yyyy-MM-dd');
        const respToday = await checkinApi.between(today, today);
        const resp7 = await checkinApi.between(t7s, t7e);
        const resp30 = await checkinApi.between(t30s, t30e);
        setCounts(prev => ({ ...prev, today: (respToday.data || []).length, '7': (resp7.data || []).length, '30': (resp30.data || []).length }));
      } catch (e) {
        // ignore errors
      }
    })();
  }, []);

  // filtering + search
  const filtered = checkins
    .slice()
    .sort((a,b)=> new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .filter(c => {
      if (query && !(c.userName || '').toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

  useEffect(() => {
    (async () => {
      try {
        const profile = await userService.getCurrentUserProfile();
        setRole(profile.roles?.[0] ?? null);
        // set QR target: admin -> admin checkins page, others -> member checkin page
        const base = window.location.origin.replace(':8081', ':8081');
        const target = profile.roles?.includes('ADMIN') ? `${base}/dashboard/checkins` : `${base}/dashboard/checkin`;
        setSingleQrUrl(target);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="bg-lb-darker text-white p-4 rounded">
      <h2 className="text-lg font-semibold mb-4">Checkins</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search username"
          value={query}
          onChange={e=>setQuery(e.target.value)}
          className="px-3 py-2 rounded bg-white/5 text-white placeholder-white/70 w-full"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center max-w-xs bg-white/5 rounded px-1">
        {['recent','today','7','30'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as any);
              if (tab === 'recent') { setStart(''); setEnd(''); loadRecent(); }
              if (tab === 'today') {
                const d = format(new Date(),'yyyy-MM-dd');
                setStart(d); setEnd(d);
                fetchBetween(d, d, 'today');
              }
              if (tab === '7') {
                const endD = new Date(); const startD = new Date(); startD.setDate(startD.getDate()-7);
                const s = format(startD,'yyyy-MM-dd'); const e = format(endD,'yyyy-MM-dd');
                setStart(s); setEnd(e);
                fetchBetween(s, e, '7');
              }
              if (tab === '30') {
                const endD = new Date(); const startD = new Date(); startD.setMonth(startD.getMonth()-1);
                const s = format(startD,'yyyy-MM-dd'); const e = format(endD,'yyyy-MM-dd');
                setStart(s); setEnd(e);
                fetchBetween(s, e, '30');
              }
            }}
            className={`px-4 py-2 text-sm ${activeTab === tab ? 'text-white border-b-2 border-lb-accent' : 'text-white/80'}`}
          >
            {tab === 'recent' ? `Recent (${counts.recent ?? 0})` : tab === 'today' ? `Today (${counts.today ?? 0})` : tab === '7' ? `7 days (${counts['7'] ?? 0})` : `30 days (${counts['30'] ?? 0})`}
          </button>
        ))}
      </div>

      {/* QR Code */}
      <div className="mb-4 flex justify-end">
        {singleQrUrl && (
          <div className="flex items-center flex-col gap-2  p-2 rounded">
            <QRCode value={singleQrUrl} size={120} className="bg-white" />
            <div className="text-sm text-white/90">Scan to Check-In</div>
          </div>
        )}
      </div>

      {/* Total count */}
      <div className="mb-4">
        <div className="text-sm text-white/80">Total checkins: {counts.total}</div>
      </div>

      {/* Checkins List */}
      <div className="mb-4">
        <div className="relative">
          {filtered.length === 0 && <div className="text-white/70">No checkins found.</div>}
          <ol className="relative border-l border-white/10 ml-2">
            {filtered.map((c, idx) => {
              const name = c.userName || c.username || c.userEmail;
              const when = c.occurredAt ? format(new Date(c.occurredAt), 'yyyy-MM-dd HH:mm') : '';
              return (
                <li key={c.id} className="mb-6 ml-6">
                  <span className="absolute -left-3 top-1 w-3 h-3 rounded-full bg-lb-accent" />
                  <div className="bg-white/3 p-4 rounded shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{name || 'Unknown'} <span className="text-xs ml-2 px-2 py-0.5 rounded bg-white/6 text-white/90">{c.userRole || 'MEMBER'}</span></div>
                        <div className="text-sm text-white/80 mt-1">{when}</div>
                      </div>
                      <div className="text-sm text-white/80">{/* actions */}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
