"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../components/theme-provider";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  UserSquare2,
  UserSquare,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { StatusCard } from "../components/status-card";
import { useMobile } from "../hooks/use-mobile";
import { Tabs, TabsContent } from "../components/ui/tabs";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/Slice";
import { selectApplications } from "@/redux/applicationsSlice";

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const applications = useSelector(selectApplications);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Force theme update by setting a data attribute on document.documentElement
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  function nav(props: string) {
    navigate(props);
  }

  return (
    <div className="flex h-screen bg-background transition-all duration-300 ease-in-out">
      {/* Sidebar - transforms to top navbar on mobile */}
      {sidebarOpen && (
        <div
          className={`${
            isMobile ? "fixed top-0 left-0 z-50 w-64 h-full" : "w-64"
          } bg-slate-800 text-slate-100 shadow-lg transition-all duration-300 dark:bg-slate-900`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <img src="/icon.png" alt="404" />
              </div>
              <span className="font-bold text-lg">MRCGP INT. </span>
            </div>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 bg-slate-500/50 dark:bg-slate-600/50"
                  onClick={() => nav("/")}
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                  onClick={() => nav("/applications")}
                >
                  <UserSquare className="mr-2 h-5 w-5" />
                  Applications
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                  onClick={() => nav("/exam")}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Exams
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-slate-800 text-slate-100 h-16 flex items-center px-4 shadow-md dark:bg-slate-900">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2 text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-bold">Dashboard</h1>

            <div className="flex items-center space-x-4">
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent rounded-full p-2 border-slate-600 text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              )}

              <div className="relative">
                {/* Profile Picture */}
                <div
                  className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer"
                  onClick={() => setOpen(!open)} // toggle on click
                  onMouseEnter={() => setOpen(true)} // open on hover
                  onMouseLeave={() => setOpen(false)} // close on leave
                >
                  <img
                    src="/profile.png"
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Dropdown menu */}
                {open && (
                  <div
                    className="absolute right-0 w-32 bg-white border rounded shadow-md z-50"
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                  >
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-gray-700 dark:bg-slate-800 dark:text-white hover:bg-gray-100 text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
          <Tabs defaultValue="applications" className="w-full">
            <TabsContent value="applications">
                
              <div className="text-3xl p-3">All Batch Status</div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatusCard
                  title="Total Requests"
                  value={applications.length}
                  color="bg-slate-600 dark:bg-slate-700"
                  onClick={() => setActiveFilter("totalAll")}
                  active={activeFilter === "totalAll"}
                />
                <StatusCard
                  title="Pending Requests"
                  value={
                    applications.filter((app) => app.status === "pending")
                      .length
                  }
                  color="bg-amber-600 dark:bg-amber-700"
                  onClick={() => setActiveFilter("totalPending")}
                  active={activeFilter === "totalPending"}
                />
                <StatusCard
                  title="Approved Requests"
                  value={
                    applications.filter((app) => app.status === "approved")
                      .length
                  }
                  color="bg-green-600 dark:bg-green-700"
                  onClick={() => setActiveFilter("totalApproved")}
                  active={activeFilter === "totalApproved"}
                />
                <StatusCard
                  title="Rejected Requests"
                  value={
                    applications.filter((app) => app.status === "rejected")
                      .length
                  }
                  color="bg-red-600 dark:bg-red-700"
                  onClick={() => setActiveFilter("totalRejected")}
                  active={activeFilter === "totalRejected"}
                />
              </div>
              <div className="text-3xl p-3">Current Batch Status</div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatusCard
                  title="Total Requests"
                  value={applications.length}
                  color="bg-slate-600 dark:bg-slate-700"
                  onClick={() => setActiveFilter("all")}
                  active={activeFilter === "all"}
                />
                <StatusCard
                  title="Pending Requests"
                  value={
                    applications.filter((app) => app.status === "pending")
                      .length
                  }
                  color="bg-amber-600 dark:bg-amber-700"
                  onClick={() => setActiveFilter("pending")}
                  active={activeFilter === "pending"}
                />
                <StatusCard
                  title="Approved Requests"
                  value={
                    applications.filter((app) => app.status === "approved")
                      .length
                  }
                  color="bg-green-600 dark:bg-green-700"
                  onClick={() => setActiveFilter("approved")}
                  active={activeFilter === "approved"}
                />
                <StatusCard
                  title="Rejected Requests"
                  value={
                    applications.filter((app) => app.status === "rejected")
                      .length
                  }
                  color="bg-red-600 dark:bg-red-700"
                  onClick={() => setActiveFilter("rejected")}
                  active={activeFilter === "rejected"}
                />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
