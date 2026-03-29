import { useState } from 'react';
import { PageBanner } from '@/components/layout/PageBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import userService, { UserProfile } from '@/services/api/userService';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface AccountSettingsProps {
  userProfile: UserProfile | null;
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
  if (bmi < 25)   return { label: 'Normal', color: 'text-green-400' };
  if (bmi < 30)   return { label: 'Overweight', color: 'text-yellow-400' };
  return           { label: 'Obese', color: 'text-red-400' };
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ userProfile }) => {
  const { toast } = useToast();

  // --- Profile form ---
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    email: userProfile?.email || '',
    phoneNumber: userProfile?.phoneNumber || '',
    heightCm: userProfile?.heightCm || '',
    weightKg: '',
    level: (userProfile?.level as any) || '',
  });

  // --- Password form ---
  const [pwLoading, setPwLoading] = useState(false);
  const [pwData, setPwData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setLoading(true);
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };
      if (formData.heightCm) payload.heightCm = Number(formData.heightCm);
      if (formData.weightKg) payload.weightKg = Number(formData.weightKg);
      if (formData.level) payload.level = formData.level;
      await userService.updateProfile(userProfile.id, payload);
      toast({ title: 'Profile updated', description: 'Your account information has been saved.' });
    } catch {
      toast({ title: 'Update failed', description: 'Could not update profile. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'New password and confirmation must be identical.', variant: 'destructive' });
      return;
    }
    if (pwData.newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setPwLoading(true);
    try {
      await userService.updatePassword(pwData.newPassword);
      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setPwData({ newPassword: '', confirmPassword: '' });
    } catch {
      toast({ title: 'Update failed', description: 'Could not update password. Please try again.', variant: 'destructive' });
    } finally {
      setPwLoading(false);
    }
  };

  // --- BMI chart data ---
  const weightHistory = userProfile?.weightHistory?.slice().sort((a, b) => a.timestamp - b.timestamp) || [];
  const heightM = (userProfile?.heightCm || 0) / 100;

  const chartLabels = weightHistory.map(pt => {
    try { return format(new Date(pt.timestamp), 'MMM d'); } catch { return ''; }
  });
  const weightData = weightHistory.map(pt => pt.weightKg);
  const bmiData = heightM > 0
    ? weightHistory.map(pt => parseFloat((pt.weightKg / (heightM * heightM)).toFixed(1)))
    : [];

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weightKg : null;
  const latestBMI = heightM > 0 && latestWeight != null
    ? parseFloat((latestWeight / (heightM * heightM)).toFixed(1))
    : null;
  const bmiCategory = latestBMI != null ? getBMICategory(latestBMI) : null;

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightData,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        pointBackgroundColor: 'rgb(249, 115, 22)',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        yAxisID: 'yWeight',
      },
      ...(bmiData.length > 0 ? [{
        label: 'BMI',
        data: bmiData,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        yAxisID: 'yBMI',
      }] : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,15,25,0.92)',
        borderColor: 'rgba(249,115,22,0.3)',
        borderWidth: 1,
        titleColor: 'white',
        bodyColor: 'rgba(255,255,255,0.7)',
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      yWeight: {
        type: 'linear' as const,
        position: 'left' as const,
        beginAtZero: false,
        ticks: { color: 'rgba(249,115,22,0.7)', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
        title: { display: true, text: 'kg', color: 'rgba(249,115,22,0.6)', font: { size: 10 } },
      },
      ...(bmiData.length > 0 ? {
        yBMI: {
          type: 'linear' as const,
          position: 'right' as const,
          beginAtZero: false,
          ticks: { color: 'rgba(139,92,246,0.7)', font: { size: 11 } },
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'BMI', color: 'rgba(139,92,246,0.6)', font: { size: 10 } },
        }
      } : {}),
    },
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title="Account Settings"
        subtitle="Manage your personal information and preferences"
        imageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80&auto=format&fit=crop"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal info */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="bg-lb-darker" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="bg-lb-darker" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="bg-lb-darker" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phoneNumber">Phone number</Label>
                  <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="bg-lb-darker" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heightCm">Height (cm)</Label>
                  <Input id="heightCm" name="heightCm" type="number" placeholder="e.g. 175" value={formData.heightCm as any} onChange={handleChange} className="bg-lb-darker" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightKg">Update Weight (kg)</Label>
                  <Input id="weightKg" name="weightKg" type="number" step="0.1" placeholder="e.g. 70.5" value={formData.weightKg as any} onChange={handleChange} className="bg-lb-darker" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="level">Level</Label>
                  <Input id="level" name="level" placeholder="BEGINNER / INTERMEDIATE / PROFESSIONAL" value={formData.level as any} onChange={handleChange} className="bg-lb-darker" />
                </div>
              </div>
              <Button type="submit" className="mt-6" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Username</p>
              <p className="text-sm text-muted-foreground">{userProfile?.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground">{userProfile?.roles?.[0] || 'Member'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Account Status</p>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${userProfile?.active ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-sm text-muted-foreground">{userProfile?.active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
            {userProfile?.roles?.includes('MEMBER') && userProfile?.assignedTrainer && (
              <div>
                <p className="text-sm font-medium">Assigned Trainer</p>
                <p className="text-sm text-muted-foreground">{userProfile.assignedTrainer}</p>
              </div>
            )}
            {userProfile?.roles?.includes('TRAINER') && userProfile?.assignedMembers && (
              <div>
                <p className="text-sm font-medium">Assigned Members</p>
                <p className="text-sm text-muted-foreground">{userProfile.assignedMembers.length} members</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Password */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Set a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={pwData.newPassword}
                  onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                  className="bg-lb-darker pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={pwData.confirmPassword}
                  onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="bg-lb-darker pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={pwLoading || !pwData.newPassword || !pwData.confirmPassword}>
                {pwLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Weight & BMI progress */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Weight &amp; BMI Progress</CardTitle>
          <CardDescription>Track your weight and BMI over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {weightHistory.length > 0 ? (
            <>
              {/* Summary row */}
              <div className="flex flex-wrap gap-4 mb-5">
                <div className="bg-lb-darker/60 rounded-lg px-4 py-3 text-center">
                  <p className="text-lg font-bold text-orange-400">{latestWeight} kg</p>
                  <p className="text-xs text-gray-500 mt-0.5">Current Weight</p>
                </div>
                {latestBMI != null && bmiCategory && (
                  <div className="bg-lb-darker/60 rounded-lg px-4 py-3 text-center">
                    <p className={`text-lg font-bold ${bmiCategory.color}`}>{latestBMI}</p>
                    <p className="text-xs text-gray-500 mt-0.5">BMI · {bmiCategory.label}</p>
                  </div>
                )}
                {userProfile?.heightCm && (
                  <div className="bg-lb-darker/60 rounded-lg px-4 py-3 text-center">
                    <p className="text-lg font-bold text-white">{userProfile.heightCm} cm</p>
                    <p className="text-xs text-gray-500 mt-0.5">Height</p>
                  </div>
                )}
                <div className="bg-lb-darker/60 rounded-lg px-4 py-3 text-center">
                  <p className="text-lg font-bold text-white">{weightHistory.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Data Points</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-7 h-[3px] rounded-full bg-orange-500" />
                  <span className="text-xs text-gray-400">Weight (kg)</span>
                </div>
                {bmiData.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-7 h-[3px] rounded-full bg-violet-500" />
                    <span className="text-xs text-gray-400">BMI</span>
                  </div>
                )}
              </div>

              {/* Chart */}
              <div className="h-[280px]">
                <Line data={chartData} options={chartOptions} />
              </div>

              {/* BMI reference bands */}
              {latestBMI != null && (
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { range: '< 18.5', label: 'Underweight', color: 'bg-blue-900/40 border-blue-800/40' },
                    { range: '18.5–24.9', label: 'Normal', color: 'bg-green-900/40 border-green-800/40' },
                    { range: '25–29.9', label: 'Overweight', color: 'bg-yellow-900/40 border-yellow-800/40' },
                    { range: '≥ 30', label: 'Obese', color: 'bg-red-900/40 border-red-800/40' },
                  ].map(band => (
                    <div key={band.label} className={`rounded-lg p-2 border ${band.color}`}>
                      <p className="font-medium text-white">{band.range}</p>
                      <p className="text-gray-400 mt-0.5">{band.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No weight history yet. Update your weight above and save to start tracking.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
