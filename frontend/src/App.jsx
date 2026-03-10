import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Settings, ChevronDown, MoreHorizontal, Zap, Clock,
  Mail, MessageSquare, Phone, Calendar, CheckCircle, Download,
  Filter, Plus, X, Edit2, Trash2, AlertCircle, TrendingUp,
  TrendingDown, Users, DollarSign, Target, Activity, Menu,
  RefreshCw,
} from 'lucide-react';
import {
  fetchStages, fetchCustomers, fetchMetrics,
  createAutomation, updateAutomation, deleteAutomation,
} from './api/client';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_ICONS = {
  email: Mail,
  sms: MessageSquare,
  task: Clock,
  calendar: Calendar,
  integration: Phone,
  notification: CheckCircle,
};

const ICON_MAP = {
  Mail, Clock, MessageSquare, Phone, Calendar, CheckCircle, Zap,
};

const TIME_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-orange-600 bg-orange-50 border-orange-200',
  low: 'text-gray-600 bg-gray-50 border-gray-200',
};

// ─── Utility Helpers ─────────────────────────────────────────────────────────

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(value);
}

function getIconComponent(name) {
  return ICON_MAP[name] || Mail;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, sub, color, alert }) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${alert ? 'border-red-200' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <div className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-800'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function StageMetricCard({ stage, onManageAutomations }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
          <span className="font-semibold text-gray-800 text-sm">{stage.name}</span>
        </div>
        <span className="text-lg font-bold text-gray-800">{stage.count}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <div className="text-gray-500">Avg time</div>
          <div className="font-medium">{stage.avg_time_in_stage}h</div>
        </div>
        <div>
          <div className="text-gray-500">Stagnant</div>
          <div className={`font-medium ${stage.stagnant > 0 ? 'text-red-600' : 'text-gray-700'}`}>
            {stage.stagnant}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Conversion</div>
          <div className="font-medium text-green-600">{stage.conversion_rate}%</div>
        </div>
        <div>
          <div className="text-gray-500">Velocity</div>
          <div className="font-medium">{stage.velocity}h</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Zap size={12} className="text-purple-500" />
          <span className="text-xs text-gray-600">
            {stage.automations?.length || 0} automation{stage.automations?.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => onManageAutomations(stage.id)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Manage
        </button>
      </div>
    </div>
  );
}

function CustomerCard({ customer, isStagnant }) {
  return (
    <div className={`bg-white rounded-lg p-3 border ${isStagnant ? 'border-red-200 bg-red-50' : 'border-gray-100'} cursor-pointer hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium text-gray-800 text-sm">{customer.name}</div>
          <div className="text-xs text-gray-500">{customer.company}</div>
        </div>
        <div className="text-sm font-bold text-gray-800">{formatCurrency(customer.value)}</div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{customer.rep}</span>
        <div className="flex items-center gap-2">
          {isStagnant && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertCircle size={10} />
              <span>{customer.hours_in_stage}h</span>
            </span>
          )}
          <span className={`px-1.5 py-0.5 rounded-full border text-xs font-medium ${PRIORITY_COLORS[customer.priority]}`}>
            {customer.priority}
          </span>
        </div>
      </div>
    </div>
  );
}

function AutomationItem({ automation, stageId, onEdit, onDelete }) {
  const Icon = getIconComponent(automation.icon);
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white rounded-lg border border-gray-200">
          <Icon size={14} className="text-purple-600" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-800">{automation.name}</div>
          <div className="text-xs text-gray-500">{automation.trigger} · {automation.action_type}</div>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(stageId, automation)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(stageId, automation.id)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Automation Modal ─────────────────────────────────────────────────────────

function AutomationModal({
  stageId,
  stages,
  editingAutomation,
  onClose,
  onSaved,
  onDeleted,
}) {
  const stage = stages.find(s => s.id === stageId);
  const [form, setForm] = useState({
    name: editingAutomation?.name || '',
    trigger: editingAutomation?.trigger || 'On entry',
    action_type: editingAutomation?.action_type || 'email',
    description: editingAutomation?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(editingAutomation ? 'edit' : 'list');

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const ActionIcon = ACTION_ICONS[form.action_type];
      const payload = { ...form, icon: ActionIcon?.displayName || 'Mail' };
      if (editingAutomation) {
        await updateAutomation(stageId, editingAutomation.id, payload);
      } else {
        await createAutomation(stageId, payload);
      }
      onSaved();
    } catch {
      setError('Failed to save automation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (autoId) => {
    try {
      await deleteAutomation(stageId, autoId);
      onDeleted();
    } catch {
      setError('Failed to delete automation.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stage?.color || 'bg-blue-500'}`} />
            <h2 className="font-semibold text-gray-800">{stage?.name} Automations</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* List mode */}
        {mode === 'list' && (
          <div className="p-4 space-y-2">
            {(stage?.automations || []).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No automations yet.</p>
            )}
            {(stage?.automations || []).map(auto => (
              <AutomationItem
                key={auto.id}
                automation={auto}
                stageId={stageId}
                onEdit={() => { setMode('form'); setForm({ name: auto.name, trigger: auto.trigger, action_type: auto.action_type, description: auto.description }); }}
                onDelete={handleDelete}
              />
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={() => { setMode('form'); setForm({ name: '', trigger: 'On entry', action_type: 'email', description: '' }); }}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Automation
            </button>
          </div>
        )}

        {/* Form mode */}
        {mode === 'form' && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Send Welcome Email"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.trigger}
                onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
              >
                <option value="On entry">On entry</option>
                <option value="On exit">On exit</option>
                <option value="After 24 hours">After 24 hours</option>
                <option value="After 48 hours">After 48 hours</option>
                <option value="24 hours before">24 hours before</option>
                <option value="Event-based">Event-based</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ACTION_ICONS).map(([type, Icon]) => (
                  <button
                    key={type}
                    onClick={() => setForm(f => ({ ...f, action_type: type }))}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      form.action_type === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder="What does this automation do?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setMode('list')}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : (editingAutomation ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [stages, setStages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [view, setView] = useState('metrics');
  const [selectedStage, setSelectedStage] = useState('all');
  const [repFilter, setRepFilter] = useState('all');
  const [showStagnantOnly, setShowStagnantOnly] = useState(false);
  const [timeFilter, setTimeFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Automation modal state
  const [automationModal, setAutomationModal] = useState(null); // { stageId, editing }

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stagesData, customersData, metricsData] = await Promise.all([
        fetchStages(),
        fetchCustomers({
          stage: selectedStage !== 'all' ? selectedStage : undefined,
          rep: repFilter !== 'all' ? repFilter : undefined,
          stagnant_only: showStagnantOnly || undefined,
          page,
          page_size: 50,
        }),
        fetchMetrics(),
      ]);
      setStages(stagesData);
      setCustomers(customersData.items);
      setTotalPages(customersData.pages);
      setMetrics(metricsData);
    } catch {
      setError('Failed to load pipeline data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [selectedStage, repFilter, showStagnantOnly, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const reps = [...new Set(customers.map(c => c.rep))].filter(Boolean);

  const filteredCustomers = customers.filter(c =>
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStageCustomers = (stageId) =>
    filteredCustomers.filter(c => c.stage_id === stageId).slice(0, 10);

  const handleAutomationChange = async () => {
    setAutomationModal(null);
    const stagesData = await fetchStages();
    setStages(stagesData);
  };

  // ─── Loading / Error states ──────────────────────────────────────────────

  if (loading && stages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading pipeline…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 max-w-md w-full text-center">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="text-lg font-bold text-gray-800 leading-tight">LeafGuard</div>
              <div className="text-xs text-gray-500 hidden sm:block">Sales Pipeline</div>
            </div>
          </div>

          {/* View switcher — desktop */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            {[
              { id: 'metrics', label: 'Metrics' },
              { id: 'board', label: 'Board' },
              { id: 'table', label: 'Table' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === v.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-blue-600' : 'text-gray-600'} />
            </button>
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-100 p-3 bg-white">
            <div className="flex gap-2">
              {[
                { id: 'metrics', label: 'Metrics' },
                { id: 'board', label: 'Board' },
                { id: 'table', label: 'Table' },
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => { setView(v.id); setShowMobileMenu(false); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === v.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-4">
        {/* Filters bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4">
          {/* Desktop filters */}
          <div className="hidden md:flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 min-w-48">
              <Search size={14} className="text-gray-400" />
              <input
                className="bg-transparent text-sm outline-none w-full"
                placeholder="Search customers…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Stage filter */}
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50"
              value={selectedStage}
              onChange={e => { setSelectedStage(e.target.value); setPage(1); }}
            >
              <option value="all">All Stages</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Rep filter */}
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50"
              value={repFilter}
              onChange={e => { setRepFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Reps</option>
              {reps.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Stagnant toggle */}
            <button
              onClick={() => { setShowStagnantOnly(!showStagnantOnly); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                showStagnantOnly
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <AlertCircle size={14} />
              Stagnant only
            </button>

            {/* Time filter */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {TIME_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setTimeFilter(f.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    timeFilter === f.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile filter toggle */}
          <div className="md:hidden flex items-center justify-between">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 mr-2">
              <Search size={14} className="text-gray-400" />
              <input
                className="bg-transparent text-sm outline-none w-full"
                placeholder="Search…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              <Filter size={14} />
              Filters
            </button>
          </div>

          {/* Mobile filters expanded */}
          {showMobileFilters && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
              <select
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 w-full"
                value={selectedStage}
                onChange={e => { setSelectedStage(e.target.value); setPage(1); }}
              >
                <option value="all">All Stages</option>
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 w-full"
                value={repFilter}
                onChange={e => { setRepFilter(e.target.value); setPage(1); }}
              >
                <option value="all">All Reps</option>
                {reps.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button
                onClick={() => setShowStagnantOnly(!showStagnantOnly)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border ${
                  showStagnantOnly ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <AlertCircle size={14} />
                {showStagnantOnly ? 'Showing stagnant only' : 'Show stagnant only'}
              </button>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {TIME_FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setTimeFilter(f.id)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      timeFilter === f.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── METRICS VIEW ──────────────────────────────────────────────────── */}
        {view === 'metrics' && metrics && (
          <div className="space-y-4">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KPICard
                icon={DollarSign}
                label="Total Pipeline"
                value={formatCurrency(metrics.total_pipeline)}
                sub={`Avg ${formatCurrency(metrics.avg_deal_size)} / deal`}
                color="bg-blue-500"
              />
              <KPICard
                icon={Users}
                label="Active Deals"
                value={metrics.total_deals.toLocaleString()}
                sub="across all stages"
                color="bg-purple-500"
              />
              <KPICard
                icon={AlertCircle}
                label="Stagnant Deals"
                value={metrics.stagnant_deals}
                sub="> 24h in stage"
                color="bg-red-500"
                alert={metrics.stagnant_deals > 0}
              />
              <KPICard
                icon={Target}
                label="Conversion Rate"
                value={`${metrics.conversion_rate}%`}
                sub={`${metrics.closed_count} closed`}
                color="bg-green-500"
              />
            </div>

            {/* Stage metric cards */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Activity size={14} />
                Stage Performance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {stages.map(stage => (
                  <StageMetricCard
                    key={stage.id}
                    stage={stage}
                    onManageAutomations={(id) => setAutomationModal({ stageId: id })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BOARD VIEW ────────────────────────────────────────────────────── */}
        {view === 'board' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-max">
              {stages.map(stage => {
                const stageCustomers = getStageCustomers(stage.id);
                return (
                  <div key={stage.id} className="w-64 flex-shrink-0">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                        <span className="text-sm font-semibold text-gray-700">{stage.name}</span>
                      </div>
                      <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {stage.count}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                      {stageCustomers.length === 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 text-center text-xs text-gray-400 border-2 border-dashed border-gray-200">
                          No customers
                        </div>
                      )}
                      {stageCustomers.map(customer => (
                        <CustomerCard
                          key={customer.id}
                          customer={customer}
                          isStagnant={customer.hours_in_stage > 24}
                        />
                      ))}
                      {stage.count > 10 && (
                        <div className="text-center text-xs text-gray-500 py-1">
                          + {stage.count - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TABLE VIEW ────────────────────────────────────────────────────── */}
        {view === 'table' && (
          <div>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Customer</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Stage</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Value</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Rep</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Priority</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Time in Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => {
                    const stageInfo = stages.find(s => s.id === customer.stage_id);
                    const isStagnant = customer.hours_in_stage > 24;
                    return (
                      <tr
                        key={customer.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                          isStagnant ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm text-gray-800">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.company}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${stageInfo?.color || 'bg-gray-400'}`} />
                            <span className="text-sm text-gray-700">{stageInfo?.name || customer.stage_id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          {formatCurrency(customer.value)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{customer.rep}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[customer.priority]}`}>
                            {customer.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {isStagnant && <AlertCircle size={12} className="text-red-500" />}
                            <span className={`text-sm ${isStagnant ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {customer.hours_in_stage}h
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-2">
              {filteredCustomers.map(customer => {
                const stageInfo = stages.find(s => s.id === customer.stage_id);
                const isStagnant = customer.hours_in_stage > 24;
                return (
                  <div
                    key={customer.id}
                    className={`bg-white rounded-xl p-4 border ${isStagnant ? 'border-red-200' : 'border-gray-100'} shadow-sm`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-800">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.company}</div>
                      </div>
                      <div className="text-sm font-bold text-gray-800">{formatCurrency(customer.value)}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${stageInfo?.color || 'bg-gray-400'}`} />
                        <span>{stageInfo?.name}</span>
                      </div>
                      <span>{customer.rep}</span>
                      <span className={`px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[customer.priority]}`}>
                        {customer.priority}
                      </span>
                      <span className={`flex items-center gap-0.5 ${isStagnant ? 'text-red-600' : ''}`}>
                        {isStagnant && <AlertCircle size={10} />}
                        {customer.hours_in_stage}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Automation Modal */}
      {automationModal && (
        <AutomationModal
          stageId={automationModal.stageId}
          stages={stages}
          editingAutomation={automationModal.editing || null}
          onClose={() => setAutomationModal(null)}
          onSaved={handleAutomationChange}
          onDeleted={handleAutomationChange}
        />
      )}
    </div>
  );
}
