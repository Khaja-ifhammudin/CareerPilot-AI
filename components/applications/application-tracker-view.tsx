"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface ApplicationItem {
  _id: string;
  company: string;
  jobTitle: string;
  location?: string;
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "OTHER";
  jobUrl?: string;
  salary?: string;
  appliedDate?: string;
  status: "SAVED" | "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "REJECTED";
  notes?: string;
  interviewDate?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

interface SummaryCounts {
  total: number;
  saved: number;
  applied: number;
  screening: number;
  interviews: number;
  offers: number;
  rejected: number;
}

const STATUS_CONFIG: Record<
  ApplicationItem["status"],
  { label: string; badgeVariant: "default" | "secondary" | "success" | "destructive" | "purple" | "outline"; colorClass: string }
> = {
  SAVED: { label: "Saved", badgeVariant: "outline", colorClass: "text-slate-400 border-slate-700 bg-slate-800/40" },
  APPLIED: { label: "Applied", badgeVariant: "default", colorClass: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  SCREENING: { label: "Screening", badgeVariant: "purple", colorClass: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  INTERVIEW: { label: "Interview", badgeVariant: "purple", colorClass: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" },
  OFFER: { label: "Offer", badgeVariant: "success", colorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  REJECTED: { label: "Rejected", badgeVariant: "destructive", colorClass: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
};

const JOB_TYPE_LABELS: Record<ApplicationItem["jobType"], string> = {
  FULL_TIME: "Full-Time",
  PART_TIME: "Part-Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  OTHER: "Other",
};

export function ApplicationTrackerView() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [summary, setSummary] = useState<SummaryCounts>({
    total: 0,
    saved: 0,
    applied: 0,
    screening: 0,
    interviews: 0,
    offers: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [jobTypeFilter, setJobTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Modal Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Field States
  const [formCompany, setFormCompany] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formJobType, setFormJobType] = useState<ApplicationItem["jobType"]>("FULL_TIME");
  const [formJobUrl, setFormJobUrl] = useState("");
  const [formSalary, setFormSalary] = useState("");
  const [formAppliedDate, setFormAppliedDate] = useState("");
  const [formStatus, setFormStatus] = useState<ApplicationItem["status"]>("APPLIED");
  const [formInterviewDate, setFormInterviewDate] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (jobTypeFilter !== "ALL") params.append("jobType", jobTypeFilter);
      if (sortBy) params.append("sortBy", sortBy);

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, statusFilter, jobTypeFilter, sortBy]);

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedApp(null);
    setFormCompany("");
    setFormJobTitle("");
    setFormLocation("");
    setFormJobType("FULL_TIME");
    setFormJobUrl("");
    setFormSalary("");
    setFormAppliedDate(new Date().toISOString().split("T")[0]);
    setFormStatus("APPLIED");
    setFormInterviewDate("");
    setFormSource("");
    setFormNotes("");
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditModal = (app: ApplicationItem) => {
    setFormMode("edit");
    setSelectedApp(app);
    setFormCompany(app.company);
    setFormJobTitle(app.jobTitle);
    setFormLocation(app.location || "");
    setFormJobType(app.jobType);
    setFormJobUrl(app.jobUrl || "");
    setFormSalary(app.salary || "");
    setFormAppliedDate(
      app.appliedDate ? new Date(app.appliedDate).toISOString().split("T")[0] : ""
    );
    setFormStatus(app.status);
    setFormInterviewDate(
      app.interviewDate
        ? new Date(app.interviewDate).toISOString().split("T")[0]
        : ""
    );
    setFormSource(app.source || "");
    setFormNotes(app.notes || "");
    setFormError("");
    setIsFormOpen(true);
  };

  const openDetailModal = (app: ApplicationItem) => {
    setSelectedApp(app);
    setIsDetailOpen(true);
  };

  const openDeleteModal = (app: ApplicationItem) => {
    setSelectedApp(app);
    setIsDeleteConfirmOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formCompany.trim()) {
      setFormError("Company name is required.");
      return;
    }
    if (!formJobTitle.trim()) {
      setFormError("Job title is required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        company: formCompany.trim(),
        jobTitle: formJobTitle.trim(),
        location: formLocation.trim() || undefined,
        jobType: formJobType,
        jobUrl: formJobUrl.trim() || undefined,
        salary: formSalary.trim() || undefined,
        appliedDate: formAppliedDate ? new Date(formAppliedDate) : undefined,
        status: formStatus,
        interviewDate: formInterviewDate ? new Date(formInterviewDate) : undefined,
        source: formSource.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };

      const url =
        formMode === "create"
          ? "/api/applications"
          : `/api/applications/${selectedApp?._id}`;

      const method = formMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to save application.");
        setSubmitting(false);
        return;
      }

      setIsFormOpen(false);
      setSubmitting(false);
      fetchApplications();
    } catch (err) {
      console.error("Form submit error:", err);
      setFormError("An unexpected network error occurred.");
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (
    appId: string,
    newStatus: ApplicationItem["status"]
  ) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error("Quick status change failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/applications/${selectedApp._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteConfirmOpen(false);
        setSubmitting(false);
        fetchApplications();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-emerald-400" />
            <span>Application Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your job applications from saved to offer.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          variant="gradient"
          className="gap-2 px-5 py-5 rounded-xl text-xs font-semibold shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Application</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Applications
          </span>
          <div className="text-2xl font-black text-white">{summary.total}</div>
          <div className="text-[10px] text-slate-500">All recorded jobs</div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            Applied
          </span>
          <div className="text-2xl font-black text-blue-300">{summary.applied}</div>
          <div className="text-[10px] text-slate-500">Active submissions</div>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
            Interviews
          </span>
          <div className="text-2xl font-black text-purple-300">{summary.interviews}</div>
          <div className="text-[10px] text-slate-500">Rounds scheduled</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Offers
          </span>
          <div className="text-2xl font-black text-emerald-300">{summary.offers}</div>
          <div className="text-[10px] text-slate-500">Offers extended</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            Rejected
          </span>
          <div className="text-2xl font-black text-rose-300">{summary.rejected}</div>
          <div className="text-[10px] text-slate-500">Archived attempts</div>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <Card className="glass-card border-slate-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company, title, location..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
              <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Statuses</option>
                <option value="SAVED" className="bg-slate-900">Saved</option>
                <option value="APPLIED" className="bg-slate-900">Applied</option>
                <option value="SCREENING" className="bg-slate-900">Screening</option>
                <option value="INTERVIEW" className="bg-slate-900">Interview</option>
                <option value="OFFER" className="bg-slate-900">Offer</option>
                <option value="REJECTED" className="bg-slate-900">Rejected</option>
              </select>
            </div>

            {/* Job Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Type:</span>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Types</option>
                <option value="FULL_TIME" className="bg-slate-900">Full-Time</option>
                <option value="PART_TIME" className="bg-slate-900">Part-Time</option>
                <option value="CONTRACT" className="bg-slate-900">Contract</option>
                <option value="INTERNSHIP" className="bg-slate-900">Internship</option>
                <option value="OTHER" className="bg-slate-900">Other</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-slate-900">Sort: Newest First</option>
                <option value="oldest" className="bg-slate-900">Sort: Oldest First</option>
                <option value="company_asc" className="bg-slate-900">Sort: Company (A-Z)</option>
                <option value="company_desc" className="bg-slate-900">Sort: Company (Z-A)</option>
                <option value="interview_date" className="bg-slate-900">Sort: Interview Date</option>
                <option value="status" className="bg-slate-900">Sort: Status</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application List / Table Layout */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          <span>Loading applications from database...</span>
        </div>
      ) : applications.length === 0 ? (
        <Card className="glass-card border-slate-800">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">No applications found</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                {search || statusFilter !== "ALL" || jobTypeFilter !== "ALL"
                  ? "No applications matched your filter criteria. Try clearing your filters."
                  : "Track your job applications from saved to offer."}
              </p>
            </div>
            <Button
              onClick={openCreateModal}
              variant="gradient"
              size="sm"
              className="gap-1.5 text-xs mt-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Your First Application</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Interview</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        <span>{app.company}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-indigo-400 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {JOB_TYPE_LABELS[app.jobType] || app.jobType}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-200">
                      {app.jobTitle}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {app.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{app.location}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {/* Status Dropdown */}
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleQuickStatusChange(
                            app._id,
                            e.target.value as ApplicationItem["status"]
                          )
                        }
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-slate-900 cursor-pointer focus:outline-none ${
                          STATUS_CONFIG[app.status]?.colorClass || ""
                        }`}
                      >
                        <option value="SAVED" className="bg-slate-900 text-slate-300">Saved</option>
                        <option value="APPLIED" className="bg-slate-900 text-blue-300">Applied</option>
                        <option value="SCREENING" className="bg-slate-900 text-purple-300">Screening</option>
                        <option value="INTERVIEW" className="bg-slate-900 text-indigo-300">Interview</option>
                        <option value="OFFER" className="bg-slate-900 text-emerald-300">Offer</option>
                        <option value="REJECTED" className="bg-slate-900 text-rose-300">Rejected</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {app.appliedDate
                        ? new Date(app.appliedDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="py-3 px-4 text-[11px]">
                      {app.interviewDate ? (
                        <span className="text-purple-300 font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-purple-400" />
                          <span>{new Date(app.interviewDate).toLocaleDateString()}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetailModal(app)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(app)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(app)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (Shown on small screens, no horizontal overflow) */}
          <div className="md:hidden space-y-3">
            {applications.map((app) => (
              <Card key={app._id} className="glass-card border-slate-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{app.company}</span>
                      </h3>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        {app.jobTitle}
                      </div>
                    </div>

                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleQuickStatusChange(
                          app._id,
                          e.target.value as ApplicationItem["status"]
                        )
                      }
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-900 cursor-pointer focus:outline-none ${
                        STATUS_CONFIG[app.status]?.colorClass || ""
                      }`}
                    >
                      <option value="SAVED" className="bg-slate-900 text-slate-300">Saved</option>
                      <option value="APPLIED" className="bg-slate-900 text-blue-300">Applied</option>
                      <option value="SCREENING" className="bg-slate-900 text-purple-300">Screening</option>
                      <option value="INTERVIEW" className="bg-slate-900 text-indigo-300">Interview</option>
                      <option value="OFFER" className="bg-slate-900 text-emerald-300">Offer</option>
                      <option value="REJECTED" className="bg-slate-900 text-rose-300">Rejected</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-500">Location: </span>
                      <span>{app.location || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Type: </span>
                      <span>{JOB_TYPE_LABELS[app.jobType]}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Applied: </span>
                      <span>
                        {app.appliedDate
                          ? new Date(app.appliedDate).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                    {app.interviewDate && (
                      <div>
                        <span className="text-purple-400">Interview: </span>
                        <span className="text-purple-300 font-semibold">
                          {new Date(app.interviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetailModal(app)}
                      className="h-8 text-xs px-2.5"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      <span>Details</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(app)}
                      className="h-8 text-xs px-2.5"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteModal(app)}
                      className="h-8 text-xs px-2.5 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-400" />
                <span>
                  {formMode === "create" ? "Add New Application" : "Edit Application"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close application form modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Company Name *
                  </label>
                  <Input
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Google, Stripe"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Job Title *
                  </label>
                  <Input
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Location</label>
                  <Input
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Job Type</label>
                  <select
                    value={formJobType}
                    onChange={(e) =>
                      setFormJobType(e.target.value as ApplicationItem["jobType"])
                    }
                    className="w-full h-9 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Salary</label>
                  <Input
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    placeholder="e.g. $120k - $140k"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as ApplicationItem["status"])
                    }
                    className="w-full h-9 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="SAVED">Saved</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Screening</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Source</label>
                  <Input
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="e.g. LinkedIn, Indeed, Referral"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Applied Date</label>
                  <Input
                    type="date"
                    value={formAppliedDate}
                    onChange={(e) => setFormAppliedDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Interview Date</label>
                  <Input
                    type="date"
                    value={formInterviewDate}
                    onChange={(e) => setFormInterviewDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Job URL</label>
                <Input
                  type="url"
                  value={formJobUrl}
                  onChange={(e) => setFormJobUrl(e.target.value)}
                  placeholder="https://company.com/careers/job-id"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Notes & Logs</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Recruiter contact, interview prep notes, referral names..."
                  className="flex w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  size="sm"
                  disabled={submitting}
                  className="gap-1.5"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{formMode === "create" ? "Save Application" : "Update Application"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DIALOG */}
      {isDetailOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span>{selectedApp.company}</span>
                </h3>
                <p className="text-xs text-slate-400">{selectedApp.jobTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close application details modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Status</span>
                <div>
                  <Badge variant={STATUS_CONFIG[selectedApp.status]?.badgeVariant || "default"}>
                    {STATUS_CONFIG[selectedApp.status]?.label || selectedApp.status}
                  </Badge>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Job Type</span>
                <div className="font-semibold text-slate-200">
                  {JOB_TYPE_LABELS[selectedApp.jobType]}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Location</span>
                <div className="text-slate-300">{selectedApp.location || "Not specified"}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Compensation</span>
                <div className="text-slate-300">{selectedApp.salary || "Not specified"}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Applied Date</span>
                <div className="text-slate-300">
                  {selectedApp.appliedDate
                    ? new Date(selectedApp.appliedDate).toLocaleDateString()
                    : "Not specified"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Interview Date</span>
                <div className="text-purple-300 font-medium">
                  {selectedApp.interviewDate
                    ? new Date(selectedApp.interviewDate).toLocaleDateString()
                    : "None scheduled"}
                </div>
              </div>
            </div>

            {selectedApp.jobUrl && (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                  Job Posting URL
                </span>
                <a
                  href={selectedApp.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 break-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span>{selectedApp.jobUrl}</span>
                </a>
              </div>
            )}

            {selectedApp.notes && (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                  Notes & Details
                </span>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              <span>Added: {new Date(selectedApp.createdAt).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsDetailOpen(false);
                    openEditModal(selectedApp);
                  }}
                  className="h-8 text-xs"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  <span>Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="h-8 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {isDeleteConfirmOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Application?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove your application for{" "}
                <span className="text-white font-semibold">{selectedApp.jobTitle}</span> at{" "}
                <span className="text-white font-semibold">{selectedApp.company}</span>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={submitting}
                className="text-xs"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                <span>Confirm Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
