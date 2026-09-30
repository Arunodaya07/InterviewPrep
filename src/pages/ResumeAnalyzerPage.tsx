import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileText,
  FileWarning,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ResumeAnalysisRecord } from '../utils/recommendationEngine.ts';

const TARGET_ROLES = [
  'Software Developer',
  'Java Developer',
  'Python Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'QA Engineer',
];

const SAMPLE_RESUME_CONTENT = `AARAV SHARMA
B.Tech in Computer Science & Engineering (CGPA: 8.6/10)
Email: aarav.sharma@cse.edu | Phone: +91 9876543210 | GitHub: github.com/aarav-cse

TECHNICAL SKILLS
Languages: Java, Python, C, SQL, JavaScript
Core CSE: Data Structures & Algorithms, Object-Oriented Programming (OOP), DBMS, Operating Systems
Frameworks & Tools: React.js, Node.js, Express.js, Git, Linux, MySQL

ACADEMIC & PERSONAL PROJECTS
1. Smart Campus Placement Portal (React.js, Node.js, Express, MySQL)
- Built a role-based portal for 400+ students to track company eligibility and coding test schedules, reducing manual coordination time by 45%.
- Designed REST APIs and normalized database schemas for student applications.

2. Library Management System (Java, JDBC, MySQL)
- Implemented OOP design patterns and SQL transaction handling for book lending and automated fine calculation.

EDUCATION & ACHIEVEMENTS
- B.Tech Computer Science & Engineering, National Institute of Technology (2022 - 2026) — CGPA: 8.6
- Solved 250+ Data Structures and Algorithms problems on LeetCode and GeeksforGeeks.`;

export function ResumeAnalyzerPage() {
  const { user, profile, resumes, recordResumeAnalysis } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [targetRole, setTargetRole] = useState<string>(
    profile?.targetRole || 'Software Developer'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<
    'idle' | 'verifying' | 'analyzing' | 'verified' | 'failed'
  >(resumes.length > 0 ? 'verified' : 'idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isNotResumeAlert, setIsNotResumeAlert] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<ResumeAnalysisRecord | null>(
    resumes[0] || null
  );

  const processSelectedFile = (file: File) => {
    setErrorMsg(null);
    setIsNotResumeAlert(false);
    setVerificationStep('idle');

    const nameLower = file.name.toLowerCase();
    const isSupported =
      file.type === 'application/pdf' ||
      file.type === 'text/plain' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      nameLower.endsWith('.pdf') ||
      nameLower.endsWith('.txt') ||
      nameLower.endsWith('.doc') ||
      nameLower.endsWith('.docx');

    if (!isSupported) {
      setIsNotResumeAlert(true);
      setVerificationStep('failed');
      setErrorMsg(
        `Invalid file format ("${file.name}"). Please upload a valid Resume file in .PDF, .DOCX, .DOC, or .TXT format.`
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setVerificationStep('failed');
      setErrorMsg('File size exceeds 10MB limit. Please upload a smaller resume file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleLoadSampleFile = () => {
    const sampleBlob = new Blob([SAMPLE_RESUME_CONTENT], { type: 'text/plain' });
    const sampleFile = new File([sampleBlob], 'Aarav_Sharma_BTech_Resume.txt', {
      type: 'text/plain',
    });
    processSelectedFile(sampleFile);
  };

  const handleVerifyAndAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsNotResumeAlert(false);

    if (!selectedFile) {
      setErrorMsg('Please select a Resume file (.PDF, .DOCX, or .TXT) to verify and analyze.');
      return;
    }

    setVerificationStep('verifying');
    try {
      const formData = new FormData();
      formData.append('targetRole', targetRole);
      formData.append(
        'studentSkills',
        JSON.stringify(profile?.skills || profile?.knownSubjects || [])
      );
      formData.append('resumeFile', selectedFile);
      formData.append('fileName', selectedFile.name);

      // Brief stage transition so user clearly sees Document Verification -> AI Analysis
      const stageTimer = setTimeout(() => {
        setVerificationStep((prev) => (prev === 'verifying' ? 'analyzing' : prev));
      }, 600);

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'x-user-id': user?.uid || 'guest',
        },
        body: formData,
      });

      clearTimeout(stageTimer);

      const data = await response.json();
      if (!response.ok || !data.analysis) {
        setVerificationStep('failed');
        if (data.isNotResume) {
          setIsNotResumeAlert(true);
          setActiveResult(null);
        }
        throw new Error(
          data.error || 'The uploaded document could not be verified as a valid Resume.'
        );
      }

      const analysisRecord: ResumeAnalysisRecord = data.analysis;
      setVerificationStep('verified');
      setActiveResult(analysisRecord);
      await recordResumeAnalysis(analysisRecord);
    } catch (err: any) {
      setVerificationStep('failed');
      setErrorMsg(err?.message || 'An error occurred while verifying and analyzing your resume.');
    }
  };

  const isBusy = verificationStep === 'verifying' || verificationStep === 'analyzing';
  const displayedResult = isNotResumeAlert ? null : activeResult;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-medium text-blue-600">
          Module 4 · Verified Resume File Upload & AI Evaluation
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">AI Resume Analyzer</h1>
        <p className="text-sm text-slate-600">
          Upload your Resume file below, click <strong>Verify & Analyze Resume</strong> to validate that the document is a genuine Resume/CV, and receive a complete AI evaluation for your target role.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Single File Upload + Verify Button */}
        <form
          onSubmit={handleVerifyAndAnalyzeResume}
          className="lg:col-span-5 p-6 rounded-xl border border-slate-200 bg-white space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Upload & Verify Resume
            </h2>
            <button
              type="button"
              onClick={handleLoadSampleFile}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Use Sample Resume File
            </button>
          </div>

          {/* Step 1: Target Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. Select Target Placement Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600"
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Single File Upload Option */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700">
              2. Upload Resume File (.PDF, .DOCX, .TXT)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-blue-600 bg-blue-50/60'
                    : 'border-slate-300 hover:border-blue-600 bg-slate-50/70'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  Click to choose your Resume file or drag & drop here
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Supports .PDF, .DOCX, .DOC, and .TXT (Max 10MB)
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB · Ready for Resume Verification
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setVerificationStep('idle');
                      setErrorMsg(null);
                      setIsNotResumeAlert(false);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs font-medium text-red-600 hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>
            )}
          </div>

          {/* Validation / Error Banner */}
          {errorMsg && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                isNotResumeAlert
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {isNotResumeAlert ? (
                <FileWarning className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                {isNotResumeAlert && (
                  <div className="font-bold text-red-900">
                    Verification Failed — Not a Valid Resume
                  </div>
                )}
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Live Verification Progress Indicator */}
          {isBusy && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>
                  {verificationStep === 'verifying'
                    ? 'Step 1/2: Verifying uploaded file is a genuine Resume/CV...'
                    : 'Step 2/2: Verified! Generating AI Resume Analysis & Role Match...'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-blue-600 transition-all duration-300 ${
                    verificationStep === 'verifying' ? 'w-1/2' : 'w-11/12'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Step 3: Verify & Analyze Button */}
          <button
            type="submit"
            disabled={isBusy || !selectedFile}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {verificationStep === 'verifying'
                ? 'Verifying Resume File...'
                : verificationStep === 'analyzing'
                ? 'Generating AI Evaluation...'
                : '3. Verify Resume & Get AI Analysis'}
            </span>
          </button>

          {/* Previously Verified Resumes */}
          {resumes.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Previously Verified Resumes ({resumes.length})
              </div>
              <div className="space-y-1.5">
                {resumes.slice(0, 4).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setIsNotResumeAlert(false);
                      setErrorMsg(null);
                      setVerificationStep('verified');
                      setActiveResult(r);
                    }}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs flex items-center justify-between cursor-pointer ${
                      displayedResult?.id === r.id
                        ? 'bg-blue-50 border-blue-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate max-w-[210px] font-medium">
                      {r.fileName} ({r.targetRole})
                    </span>
                    <span className="font-mono font-bold text-blue-600">{r.resumeScore}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Right Column: Verification Confirmation + Detailed AI Evaluation Answer */}
        <div className="lg:col-span-7 space-y-6">
          {displayedResult ? (
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-6">
              {/* Verification Confirmation Banner */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      Resume Verification Passed · Valid Resume/CV Confirmed
                    </div>
                    <div className="text-xs text-emerald-800 mt-0.5">
                      File: <strong>{displayedResult.fileName}</strong> · Extracted{' '}
                      <strong>{displayedResult.skillsFound.length} skills</strong> for{' '}
                      <strong>{displayedResult.targetRole}</strong>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-mono font-semibold self-start sm:self-center shrink-0">
                  VERIFIED RESUME
                </span>
              </div>

              {/* Candidate & Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Resume Evaluation Report</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Target Role: {displayedResult.targetRole}
                  </h2>
                  {(displayedResult.candidateName || displayedResult.detectedEducation) && (
                    <div className="text-xs text-slate-600">
                      {displayedResult.candidateName && (
                        <span>
                          <strong className="text-slate-800">Candidate:</strong>{' '}
                          {displayedResult.candidateName}
                        </span>
                      )}
                      {displayedResult.detectedEducation && (
                        <span>
                          {' '}
                          · <strong className="text-slate-800">Education:</strong>{' '}
                          {displayedResult.detectedEducation}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-start">
                  {displayedResult.roleMatchPercentage !== undefined && (
                    <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-center">
                      <div className="text-[11px] text-blue-700 font-medium">Role Match</div>
                      <div className="text-lg font-bold font-mono tabular-nums text-blue-900">
                        {displayedResult.roleMatchPercentage}%
                      </div>
                    </div>
                  )}
                  <div className="px-4 py-2 rounded-xl bg-slate-900 text-white text-center">
                    <div className="text-[11px] text-slate-300">Resume Score</div>
                    <div className="text-xl font-bold font-mono tabular-nums text-blue-400">
                      {displayedResult.resumeScore}/100
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Part Section Breakdown */}
              {displayedResult.sectionBreakdown && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Verified Section-by-Section Score Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'Technical Skills',
                        val: displayedResult.sectionBreakdown.technicalSkillsScore,
                      },
                      {
                        label: 'Projects & Impact',
                        val: displayedResult.sectionBreakdown.projectsScore,
                      },
                      {
                        label: 'Education & CGPA',
                        val: displayedResult.sectionBreakdown.educationScore,
                      },
                      {
                        label: 'ATS Structure',
                        val: displayedResult.sectionBreakdown.structureAndAtsScore,
                      },
                    ].map((sec) => (
                      <div
                        key={sec.label}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">{sec.label}</span>
                          <span className="font-mono font-bold text-slate-900">{sec.val}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sec.val >= 70
                                ? 'bg-emerald-600'
                                : sec.val >= 50
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${sec.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Executive Summary */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-1 text-xs uppercase tracking-wider">
                  AI Evaluation Summary
                </strong>
                {displayedResult.summary}
              </div>

              {/* Extracted Projects from Uploaded Resume */}
              {displayedResult.detectedProjects && displayedResult.detectedProjects.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Projects Verified in Uploaded Resume
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {displayedResult.detectedProjects.map((proj, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {proj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Found vs Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Skills Verified in Resume ({displayedResult.skillsFound.length})
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-emerald-900">
                    {displayedResult.skillsFound.length > 0 ? (
                      displayedResult.skillsFound.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded bg-white border border-emerald-200 font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-600">
                        No technical skills listed in uploaded file.
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-red-200 bg-red-50/40">
                  <h3 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                    Missing Skills for {displayedResult.targetRole} (
                    {displayedResult.missingSkills.length})
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-red-900">
                    {displayedResult.missingSkills.length > 0 ? (
                      displayedResult.missingSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded bg-white border border-red-200 font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-700">
                        All core {displayedResult.targetRole} skills are present!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Areas to Improve */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2.5">Resume Strengths</h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {displayedResult.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2.5">Areas to Improve</h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {displayedResult.areasToImprove.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Improvements */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  AI Recommendations to Improve Your Resume for {displayedResult.targetRole}
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                  {displayedResult.suggestedImprovements.map((imp, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {imp}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-xl border border-dashed border-slate-200 bg-white text-center space-y-3">
              {isNotResumeAlert ? (
                <>
                  <FileWarning className="w-10 h-10 text-red-600 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">
                    Document Verification Failed
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    The uploaded file could not be verified as a candidate Resume/CV. Please upload a valid Resume containing your Education, Technical Skills, and Projects using the upload panel on the left.
                  </p>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">
                    Awaiting Resume Verification & AI Evaluation
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Select your resume file (<strong>.PDF</strong>, <strong>.DOCX</strong>, or <strong>.TXT</strong>) in the left panel and click <strong>Verify Resume & Get AI Analysis</strong>. Once verified, your complete AI evaluation report will appear here.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
