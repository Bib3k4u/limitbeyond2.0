import React, { useEffect, useState } from 'react';
import { checkinApi } from '@/services/api/checkinApi';
import { useParams } from 'react-router-dom';
import userService from '@/services/api/userService';
import { format, subHours, subDays } from 'date-fns';

export default function CheckinPage() {
  const { userId } = useParams();
  const [uid, setUid] = useState(userId || '');
  const [name, setName] = useState('');
  const [last, setLast] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recent'|'today'|'7'|'30'>('recent');
  const [loading, setLoading] = useState(false);

  // If no userId provided, try to fetch current user
  useEffect(() => {
    const tryCurrent = async () => {
      if (!uid) {
        try {
          const profile = await userService.getCurrentUserProfile();
          setUid(profile.id);
          setName(`${profile.firstName} ${profile.lastName}`);
        } catch (e) {
          // ignore
        }
      } else {
        // load name when uid is provided
        try {
          const p = await userService.getUserById(uid);
          setName(`${p.firstName} ${p.lastName}`);
        } catch (e) {
          // ignore
        }
      }
    };
    tryCurrent();
  }, [uid]);

  const canCheckin = () => {
    if (!last) return true;
    try {
      const lastTs = new Date(last.occurredAt).getTime();
      return Date.now() - lastTs > (2 * 60 * 60 * 1000); // 2 hours
    } catch (e) {
      return true;
    }
  };

  const addCheckin = async () => {
    if (!uid) return;
    if (!canCheckin()) return;
    try {
      const resp = await checkinApi.addCheckin(uid);
      setLast(resp.data);
      // reload list
      await loadMyCheckins(activeTab);
    } catch (e) {
      console.error('Failed to add checkin', e);
    }
  };

  const loadMyCheckins = async (tab: typeof activeTab = 'recent') => {
    if (!uid) return;
    setLoading(true);
    try {
      if (tab === 'recent') {
        const resp = await checkinApi.recent(200, uid);
        const mine = resp.data || [];
        mine.sort((a: any,b:any)=> new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
        setList(mine);
        setLast(mine[0] || null);
      } else {
        const end = format(new Date(), 'yyyy-MM-dd');
        let startDate = new Date();
        if (tab === 'today') startDate = new Date();
        if (tab === '7') startDate = subDays(new Date(), 7);
        if (tab === '30') startDate = subDays(new Date(), 30);
        const start = format(startDate, 'yyyy-MM-dd');
        const resp = await checkinApi.between(start, end, uid);
        const mine = resp.data || [];
        mine.sort((a: any,b:any)=> new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
        setList(mine);
        setLast(mine[0] || null);
      }
    } catch (e) {
      console.error('Failed to load checkins', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    if (!uid) return;
    // load last checkin (authoritative from DB)
    (async () => {
      try {
        const resp = await checkinApi.recent(1, uid);
        const mine = resp.data || [];
        setLast(mine[0] || null);
      } catch (e) {
        // ignore - fallback to list
      }
      await loadMyCheckins(activeTab);
    })();
  }, [uid, activeTab]);

  // compute days active in last 30 days for this user
  const computeDaysActive30 = () => {
    const cutoff = subDays(new Date(), 30).setHours(0,0,0,0);
    const days = new Set<string>();
    list.forEach(c => {
      try {
        const d = new Date(c.occurredAt);
        if (d.getTime() >= cutoff) {
          days.add(d.toISOString().split('T')[0]);
        }
      } catch (e) {}
    });
    return days.size;
  };

  return (
    <div className="min-h-screen  text-white">
      <div className=" bg-lb-darker min-h-screen p-6 mx-auto">
        <h2 className="text-lg font-semibold mb-6">Checkin</h2>

        {/* User Info */}
        <div className="mb-4">
          <div className="text-sm text-white/80">User</div>
          <div className="text-lg font-medium">{name || 'Unknown'}</div>
          <div className="text-sm text-white/70 mt-1">
            Last checked: {last ? format(new Date(last.occurredAt), 'yyyy-MM-dd HH:mm') : '—'}
          </div>
        </div>

        {/* Tabs and Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex bg-white/5 rounded p-1">
            {['recent','today','7','30'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-2 text-sm rounded ${
                  activeTab === tab ? 'bg-lb-accent text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                {tab === 'recent' ? 'Recent' : tab === 'today' ? 'Today' : tab === '7' ? '7 days' : '30 days'}
              </button>
            ))}
          </div>
          <button
            className={`btn ${canCheckin() ? 'bg-lb-accent hover:bg-lb-accent/90' : 'bg-white/10 cursor-not-allowed'} text-white px-4 py-2 rounded`}
            onClick={addCheckin}
            disabled={!canCheckin()}
          >
            {canCheckin() ? 'Checkin' : 'Checked recently'}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-4 text-sm text-white/80">
          Days active (30d): <span className="font-medium text-white">{computeDaysActive30()}</span>
        </div>

        {/* List */}
        <div className="mt-4 bg-white/3 p-3 rounded max-h-96 overflow-y-auto">
          <h3 className="font-medium mb-2 text-white">Recent checkins</h3>
          {loading ? (
            <div className="text-white/80 py-4">Loading...</div>
          ) : list.length > 0 ? (
            <ul className="divide-y divide-white/10">
              {list.map(c => (
                <li key={c.id} className="py-2 text-white/90">
                  {format(new Date(c.occurredAt), 'yyyy-MM-dd HH:mm')}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-white/80 py-4">No checkins found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
