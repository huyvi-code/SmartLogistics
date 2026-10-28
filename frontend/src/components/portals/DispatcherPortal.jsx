import React, { useState, useEffect } from 'react';
import { StatsBar } from '../StatsBar';
import { OrderManagement } from '../OrderManagement';
import { FleetManagement } from '../FleetManagement';
import { RouteNetworkManagement } from '../RouteNetworkManagement';
import { CodReconciliation } from '../CodReconciliation';
import { IncidentsCenter } from '../IncidentsCenter';
import {
  Package, Truck, MapPin, DollarSign, AlertTriangle
} from 'lucide-react';

const VALID_TABS = ['orders', 'fleet', 'routes', 'cod', 'incidents'];

const getTabFromPathname = (pathname) => {
  const match = pathname.match(/^\/dispatcher\/([a-z]+)\/?$/i);
  if (match && VALID_TABS.includes(match[1].toLowerCase())) {
    return match[1].toLowerCase();
  }
  return 'orders';
};

export const DispatcherPortal = () => {
  const [activeTab, setActiveTab] = useState(() => getTabFromPathname(window.location.pathname));
  const [statsTrigger, setStatsTrigger] = useState(0);

  // Đồng bộ URL khi vào DispatcherPortal hoặc khi người dùng bấm Back/Forward trên trình duyệt
  useEffect(() => {
    const currentTab = getTabFromPathname(window.location.pathname);
    const expectedPath = `/dispatcher/${currentTab}`;
    if (window.location.pathname !== expectedPath) {
      window.history.replaceState({ role: 'QUAN_LY', tab: currentTab }, '', expectedPath);
    }
    setActiveTab(currentTab);

    const handlePopState = () => {
      const tabFromUrl = getTabFromPathname(window.location.pathname);
      setActiveTab(tabFromUrl);
      if (window.location.pathname !== `/dispatcher/${tabFromUrl}`) {
        window.history.replaceState({ role: 'QUAN_LY', tab: tabFromUrl }, '', `/dispatcher/${tabFromUrl}`);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    const targetPath = `/dispatcher/${tabId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ role: 'QUAN_LY', tab: tabId }, '', targetPath);
    }
  };

  const handleDataChanged = () => {
    setStatsTrigger((prev) => prev + 1);
  };

  const tabs = [
    { id: 'orders', label: 'Quản Lý Vận Đơn', icon: Package, path: '/dispatcher/orders' },
    { id: 'fleet', label: 'Giám Sát Đội Xe', icon: Truck, path: '/dispatcher/fleet' },
    { id: 'routes', label: 'Tuyến & Biểu Cước', icon: MapPin, path: '/dispatcher/routes' },
    { id: 'cod', label: 'Đối Soát COD', icon: DollarSign, path: '/dispatcher/cod' },
    { id: 'incidents', label: 'Trung Tâm Sự Cố', icon: AlertTriangle, path: '/dispatcher/incidents' },
  ];

  return (
    <div className="space-y-6">
      {/* Sidebar (aligned with StatsBar) + Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left Navigation Sidebar (Full Vertical Height) */}
        <aside className="w-full lg:w-64 shrink-0 self-stretch min-h-[calc(100vh-7rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col transition-colors duration-200">
          <div className="lg:sticky lg:top-24">
            <div className="px-3 pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Danh Mục Điều Hành
              </span>
            </div>

            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`w-full px-3.5 py-3 rounded-2xl transition flex items-center justify-between gap-2 whitespace-nowrap text-xs font-semibold cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Content Area: Stats Bar + Active Panel */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* KPI Stats Bar */}
          <StatsBar activeTab={activeTab} refreshTrigger={statsTrigger} />

          {/* Tab Panels */}
          <div>
            {activeTab === 'orders' && (
              <OrderManagement onOrdersChanged={handleDataChanged} />
            )}
            {activeTab === 'fleet' && (
              <FleetManagement onDriversChanged={handleDataChanged} />
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
      </div>
    </div>
  );
};
