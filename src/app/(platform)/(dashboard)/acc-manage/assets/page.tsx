"use client";

import React, { useEffect, useState } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { FileText, RefreshCcw, Eye, X, Copy } from 'lucide-react';
import { useSyncAssets, useGetAssetReports, useGetAssetReportDetails } from '@/hooks/queries/accounts';
import { useSnackbar } from 'notistack';
import { DataTable, Column } from '@/components/ui/DataTable';

// Modal component to view raw JSON data
function JsonModal({ reportId, onClose }: { reportId: string | null; onClose: () => void }) {
  const { data, isLoading, error } = useGetAssetReportDetails(reportId);
  const { enqueueSnackbar } = useSnackbar();

  if (!reportId) return null;

  const handleCopy = () => {
    if (data?.report) {
      navigator.clipboard.writeText(JSON.stringify(data.report, null, 2));
      enqueueSnackbar('JSON copied to clipboard!', { variant: 'success' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-slate-800">Asset Report Details</h3>
            {data?.report && (
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
              >
                <Copy size={14} />
                Copy JSON
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCcw className="animate-spin text-slate-400" size={24} />
            </div>
          ) : error ? (
            <div className="text-red-500 font-medium">Failed to load report. It may still be generating.</div>
          ) : data?.status === 'pending' ? (
            <div className="text-amber-600 font-medium">{data.message}</div>
          ) : (
            <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap">
              {JSON.stringify(data?.report, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const { setHeaderData } = useAppData();
  const { enqueueSnackbar } = useSnackbar();
  const syncAssets = useSyncAssets();
  
  const { data: reportsResponse, isLoading: isLoadingReports } = useGetAssetReports();
  const reports = reportsResponse?.data || [];

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [daysRequested, setDaysRequested] = useState<number>(90);

  useEffect(() => {
    setHeaderData('Assets & Net Worth', 'Generate and view verified asset reports from connected institutions.');
  }, [setHeaderData]);

  const handleGenerateReport = () => {
    syncAssets.mutate({ days_requested: daysRequested }, {
      onSuccess: (res) => {
        enqueueSnackbar('Asset report generation started!', { variant: 'success' });
      },
      onError: (err: any) => {
        enqueueSnackbar(err?.response?.data?.error || 'Failed to sync assets', { variant: 'error' });
      }
    });
  };

  const columns: Column<any>[] = [
    {
      key: 'asset_report_id',
      header: 'Report ID',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {row.asset_report_id.substring(0, 16)}...
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (row) => (
        <span className="font-medium text-slate-700">
          {new Date(row.created_at).toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const isReady = row.status === 'ready';
        const isPending = row.status === 'pending';
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
            isReady ? 'bg-green-100 text-green-700' : 
            isPending ? 'bg-amber-100 text-amber-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {row.status}
          </span>
        );
      }
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              window.location.href = `/acc-manage/assets/${row.asset_report_id}`;
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#159A1D] hover:bg-[#128218] transition-colors px-3 py-1.5 rounded-lg"
          >
            <span>View Analytics</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedReportId(row.asset_report_id); }}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg"
            title="View Raw JSON"
          >
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800">Generate New Report</h3>
          <p className="text-sm text-slate-500">Pull the latest asset data from all connected institutions.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={daysRequested}
            onChange={(e) => setDaysRequested(Number(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value={30}>30 Days</option>
            <option value={60}>60 Days</option>
            <option value={90}>90 Days</option>
            <option value={120}>120 Days</option>
            <option value={150}>150 Days</option>
          </select>
          <button
            onClick={handleGenerateReport}
            disabled={syncAssets.isPending}
            className="flex items-center gap-2 bg-[#159A1D] hover:bg-[#128218] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {syncAssets.isPending ? (
              <RefreshCcw className="animate-spin" size={18} />
            ) : (
              <FileText size={18} />
            )}
            Generate Asset Report
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable 
          data={reports}
          columns={columns}
          isLoading={isLoadingReports}
          emptyMessage="No asset reports generated yet. Click 'Generate Asset Report' to create one."
        />
      </div>

      <JsonModal reportId={selectedReportId} onClose={() => setSelectedReportId(null)} />
    </div>
  );
}
