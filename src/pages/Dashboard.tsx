import { StatsCards } from '@/components/dashboard/StatsCards';
import { SubjectProgress } from '@/components/dashboard/SubjectProgress';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickAddSession } from '@/components/study/QuickAddSession';

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your study progress</p>
        </div>
        <QuickAddSession />
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubjectProgress />
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard;
