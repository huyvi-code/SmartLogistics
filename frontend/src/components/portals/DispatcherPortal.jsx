import React, { useState } from 'react';
import { StatsBar } from '../StatsBar';
import { OrderManagement } from '../OrderManagement';
import { FleetManagement } from '../FleetManagement';
import { RouteNetworkManagement } from '../RouteNetworkManagement';
import { CodReconciliation } from '../CodReconciliation';
import { IncidentsCenter } from '../IncidentsCenter';
import {
  Shield, Package, Truck, MapPin, DollarSign, AlertTriangle,
  Building2, Activity, Sparkles
} from 'lucide-react';

export const DispatcherPortal = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [statsTrigger, setStatsTrigger] = useState(0);

  const handleDataChanged = () => {
    setStatsTrigger((prev) => prev + 1);
  };

  const tabs = [
    { id: 'orders', label: 'Quản Lý Vận Đơn', icon: Package, badge: null },
    { id: 'fleet', label: 'Giám Sát Đội Xe', icon: Truck, badge: null },
    { id: 'routes', label: 'Tuyến & Biểu Cước', icon: MapPin, badge: '16 tuyến' },
    { id: 'cod', label: 'Đối Soát COD', icon: DollarSign, badge: 'Tự động' },
    { id: 'incidents', label: 'Trung Tâm Sự Cố', icon: AlertTriangle, badge: 'AI Copilot' },
  ];

  return (
    <div className="space-y-6">
      {/* Dispatcher Enterprise Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 dark:from-orange-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900 border border-orange-500/30 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" /> SmartLogistics TMS Enterprise Cloud Platform
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Trung Tâm Chỉ Huy & Điều Hành Vận Tải Toàn Quốc
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Điều phối tự động 16 trục tuyến quốc gia, đối soát dòng tiền bưu chính thời gian thực và quản lý tải trọng đội xe
          </p>
        </div>

        {/* Realtime Status Pill */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <div>
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Hệ Thống Sẵn Sàng</div>
            <div className="text-[9px] text-slate-400 font-mono">Đồng bộ đám mây • SLA 99.98%</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <StatsBar refreshTrigger={statsTrigger} />

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-2xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'orders' && (
          <OrderManagement onOrdersChanged={handleDataChanged} />
        )}
        {activeTab === 'fleet' && (
          <FleetManagement />
        )}
        {activeTab === 'routes' && (
          <RouteNetworkManagement />
        )}
        {activeTab === 'cod' && (
          <CodReconciliation onSettlementChanged={handleDataChanged} />
        )}
        {activeTab === 'incidents' && (
          <IncidentsCenter onIncidentsChanged={handleDataChanged} />
        )}
      </div>
    </div>
  );
};
