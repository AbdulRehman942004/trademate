'use client';

import * as React from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { 
  Play, 
  RefreshCw, 
  Loader2, 
  Search, 
  FileText, 
  Database, 
  Terminal,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  GitBranch
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { TippStats, TippTasksStatus } from '../../types';
import api from '../../services/api';

export default function TippScraperPage() {
  const [stats, setStats] = React.useState<TippStats | null>(null);
  const [tasks, setTasks] = React.useState<TippTasksStatus | null>(null);
  const [logs, setLogs] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [polling, setPolling] = React.useState(true);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (polling) {
        fetchTasksAndStats();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [polling]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchTasksAndStats(),
        fetchLogs()
      ]);
    } catch (err: any) {
      console.error('Failed to fetch TIPP data:', err);
      setError(err.message || 'Failed to connect to TIPP Scraper service');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksAndStats = async () => {
    try {
      const [statsData, tasksData] = await Promise.all([
        api.get<TippStats>('/v1/admin/tipp-scraper/stats'),
        api.get<TippTasksStatus>('/v1/admin/tipp-scraper/tasks')
      ]);
      setStats(statsData);
      setTasks(tasksData);
      
      // Stop polling if no tasks are running
      const isAnyRunning = Object.values(tasksData).some(t => t.status === 'running');
      if (!isAnyRunning && polling) {
        // We keep polling anyway for live updates, but maybe slower?
        // Let's keep it 3s for now as user might start a task anytime
      }
    } catch (err) {
      console.error('Failed to fetch tasks/stats:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await api.get<{ logs: string[] }>('/v1/admin/tipp-scraper/logs?lines=50');
      setLogs(data.logs);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const triggerTask = async (type: 'full' | 'products' | 'details' | 'combine') => {
    try {
      setError(null);
      await api.post(`/v1/admin/tipp-scraper/tasks/${type}`, {});
      await fetchTasksAndStats();
      // Auto-trigger log refresh
      setTimeout(fetchLogs, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to trigger task');
    }
  };

  if (loading && !stats) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Data Pipeline', href: '/data-pipeline' },
          { title: 'TIPP Scraper' },
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Pipeline', href: '/data-pipeline' },
        { title: 'TIPP Scraper' },
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              TIPP.gov.pk Scraper
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Control and monitor the Pakistan Trade Information Portal scraping pipeline
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <a
              href="https://tipp.gov.pk"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Source Portal
            </a>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Master Codes" 
            value={stats?.master_codes || 0} 
            icon={FileText} 
            color="blue" 
          />
          <StatCard 
            title="Tariff Rows" 
            value={stats?.tariffs || 0} 
            icon={Database} 
            color="green" 
          />
          <StatCard 
            title="NTM Measures" 
            value={stats?.measures || 0} 
            icon={ShieldCheck} 
            color="purple" 
          />
          <StatCard 
            title="Products" 
            value={stats?.products || 0} 
            icon={GitBranch} 
            color="orange" 
          />
          <StatCard 
            title="Failed Codes" 
            value={stats?.failed || 0} 
            icon={AlertCircle} 
            color="red" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Play className="h-4 w-4 text-blue-600" />
                  Control Panel
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <TaskButton 
                  title="Full Scraper"
                  description="Scrape tariffs, cess, exemptions & NTMs"
                  task={tasks?.full_scrape}
                  onClick={() => triggerTask('full')}
                />
                <TaskButton 
                  title="Product Scraper"
                  description="Scrape the products table only"
                  task={tasks?.products_scrape}
                  onClick={() => triggerTask('products')}
                />
                <TaskButton 
                  title="Detail Scraper"
                  description="Scrape measure & procedure sub-pages"
                  task={tasks?.details_scrape}
                  onClick={() => triggerTask('details')}
                />
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => triggerTask('combine')}
                    disabled={tasks?.combine_data?.status === 'running'}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Combine & Build Master</p>
                      <p className="text-xs text-gray-500">Generate combined_tariffs.csv</p>
                    </div>
                    {tasks?.combine_data?.status === 'running' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    ) : (
                      <RefreshCw className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-lg p-5 text-white shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Cloud Persistence
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  All scraped data is automatically synchronized with the <strong>data-trademate</strong> S3 bucket.
                </p>
                <div className="flex items-center gap-2 text-xs bg-blue-700/50 p-2 rounded border border-blue-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  S3 Bidirectional Sync Active
                </div>
              </div>
              <Activity className="absolute -right-8 -bottom-8 h-32 w-32 text-blue-500/20 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>

          {/* Logs Terminal */}
          <div className="lg:col-span-2 flex flex-col min-h-[500px]">
            <div className="flex-1 bg-gray-950 rounded-lg border border-gray-800 shadow-2xl flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-mono text-gray-400">scraper_output.log</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
              </div>
              <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto bg-black/40">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-600 italic">
                    Waiting for output...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((line, i) => (
                      <div key={i} className={cn(
                        line.includes('[ERROR]') ? 'text-red-400' :
                        line.includes('[WARNING]') ? 'text-yellow-400' :
                        line.includes('SUCCESS') ? 'text-green-400' : 'text-gray-300'
                      )}>
                        <span className="text-gray-600 mr-2">[{i+1}]</span>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    red: "text-red-600 bg-red-50 dark:bg-red-900/20",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-lg", colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value.toLocaleString()}
        </span>
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </p>
    </div>
  );
}

function TaskButton({ title, description, task, onClick }: { title: string, description: string, task: any, onClick: () => void }) {
  const isRunning = task?.status === 'running';

  return (
    <button
      onClick={onClick}
      disabled={isRunning}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all relative group",
        isRunning 
          ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" 
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
          <p className="text-[10px] text-gray-500">{description}</p>
        </div>
        {isRunning ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 animate-pulse uppercase">Running</span>
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
        )}
      </div>
      
      {task?.last_run && (
        <div className="mt-2 flex items-center gap-1 text-[9px] text-gray-400">
          <Clock className="h-3 w-3" />
          <span>Last run: {new Date(task.last_run).toLocaleString()}</span>
        </div>
      )}
    </button>
  );
}
