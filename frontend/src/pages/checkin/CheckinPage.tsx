import React, { useEffect, useState, useMemo } from 'react';
import { PageBanner } from '@/components/layout/PageBanner';
import { checkinApi } from '@/services/api/checkinApi';
import { useParams } from 'react-router-dom';
import userService from '@/services/api/userService';
import {
  format, subDays, addDays,
  isBefore, startOfDay, parseISO,
} from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CheckinPage() {
  const { userId } = useParams();
  const [uid, setUid] = useState(userId || '');
  const [name, setName] = useState('');
  const [last, setLast] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      if (!uid) {
        try {
          const profile = await userService.getCurrentUserProfile();
          setUid(profile.id);
          setName(`${profile.firstName} ${profile.lastName}`);
        } catch (e) {}
      } else {
        try {
          const p = await userService.getUserById(uid);
          setName(`${p.firstName} ${p.lastName}`);
        } catch (e) {}
      }
    };
    init();
  }, [uid]);

  // Fetch full checkin history once — no re-fetch on month change
  const loadCheckins = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const resp = await checkinApi.recent(500, uid);
      const data: any[] = resp.data || [];
      setCheckins(data);
      const sorted = [...data].sort(
        (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );
      setLast(sorted[0] || null);
    } catch (e) {
      console.error('Failed to load checkins', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) loadCheckins();
  }, [uid]);

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month); // data already loaded — just switch view
  };

  const canCheckin = () => {
    if (!last) return true;
    try {
      return Date.now() - new Date(last.occurredAt).getTime() > 2 * 60 * 60 * 1000;
    } catch { return true; }
  };

  const doCheckin = async () => {
    if (!uid || !canCheckin()) return;
    setChecking(true);
    try {
      const resp = await checkinApi.addCheckin(uid);
      setLast(resp.data);
      await loadCheckins();
      toast({ title: 'Checked in!', description: 'Your attendance has been recorded.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to check in. Please try again.', variant: 'destructive' });
    } finally {
      setChecking(false);
    }
  };

  const { checkedInDates, missedDates, daysActive30, todayCheckedIn } = useMemo(() => {
    const checkedSet = new Set<string>();
    checkins.forEach((c: any) => {
      try { checkedSet.add(format(new Date(c.occurredAt), 'yyyy-MM-dd')); } catch {}
    });

    const checkedInDates: Date[] = [];
    checkedSet.forEach(d => { try { checkedInDates.push(parseISO(d)); } catch {} });

    // Find the first ever check-in date — missed days start from there
    const sortedKeys = [...checkedSet].sort();
    const firstCheckinDate = sortedKeys.length > 0 ? startOfDay(parseISO(sortedKeys[0])) : null;

    // Missed = past days from first checkin to yesterday with no check-in
    const missedDates: Date[] = [];
    if (firstCheckinDate) {
      const today = startOfDay(new Date());
      let cursor = new Date(firstCheckinDate);
      while (isBefore(cursor, today)) {
        if (!checkedSet.has(format(cursor, 'yyyy-MM-dd'))) {
          missedDates.push(new Date(cursor));
        }
        cursor = addDays(cursor, 1);
      }
    }

    const cutoff30 = subDays(new Date(), 30);
    const daysActive30 = [...checkedSet].filter(d => parseISO(d) >= cutoff30).length;
    const todayCheckedIn = checkedSet.has(format(new Date(), 'yyyy-MM-dd'));

    return { checkedInDates, missedDates, daysActive30, todayCheckedIn };
  }, [checkins]);

  return (
    <div className="space-y-6">
      <PageBanner
        title="Attendance"
        subtitle={name || 'Track your gym check-ins'}
        imageUrl="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80&auto=format&fit=crop"
      />
      {/* Check-in action row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div />
        {todayCheckedIn ? (
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 w-full sm:w-auto justify-center">
            <CheckCircle className="h-4 w-4" />
            Checked In Today
          </div>
        ) : (
          <Button
            onClick={doCheckin}
            disabled={checking || !uid}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-lb-accent hover:bg-lb-accent/90 text-white"
          >
            <CheckCircle className="h-4 w-4" />
            {checking ? 'Checking in...' : 'Check In Now'}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">Days Active</p>
          <p className="text-2xl font-bold text-white">{daysActive30}</p>
          <p className="text-xs text-gray-500">last 30 days</p>
        </Card>
        <Card className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">Today</p>
          <p className={`text-sm font-semibold mt-2 ${todayCheckedIn ? 'text-green-400' : 'text-gray-500'}`}>
            {todayCheckedIn ? '✓ Done' : 'Pending'}
          </p>
        </Card>
        <Card className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">Last Checkin</p>
          <p className="text-xs font-medium text-white mt-2 leading-relaxed">
            {last ? format(new Date(last.occurredAt), 'MMM dd, HH:mm') : '—'}
          </p>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="glass-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-lb-accent" />
            <h2 className="text-sm font-semibold text-white">Attendance Calendar</h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shrink-0" />
              Checked in
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shrink-0" />
              Missed
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lb-accent" />
          </div>
        ) : (
          <div className="flex justify-center">
            <Calendar
              mode="single"
              month={currentMonth}
              onMonthChange={handleMonthChange}
              selected={undefined}
              onSelect={() => {}}
              modifiers={{
                checkedIn: checkedInDates,
                missed: missedDates,
              }}
              modifiersStyles={{
                checkedIn: {
                  backgroundColor: '#22c55e',
                  borderRadius: '50%',
                  color: '#ffffff',
                  fontWeight: '700',
                  transform: 'scale(0.72)',
                },
                missed: {
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  color: '#ffffff',
                  opacity: 0.7,
                  transform: 'scale(0.72)',
                },
              }}
              className="w-full"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
