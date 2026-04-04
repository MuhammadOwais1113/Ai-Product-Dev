import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Upload,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ShieldAlert,
    FileCheck,
    Loader2,
    RotateCcw,
    X,
    File,
    MapPin,
    ArrowRight,
    ChevronDown,
    Sparkles
} from 'lucide-react';
import './Compliance.css';
import {
    isDemoMode,
    shouldUseDemoForFile,
    runDemoStagedPipeline,
    getDemoPackage,
    DEMO_PIPELINE_STEPS,
} from '../demo/demoValidation.js';

const VALIDATE_URL = import.meta.env.VITE_VALIDATE_URL || 'http://localhost:8000/validate';

const Compliance = () => {
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | processing | success | error
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [demoSession, setDemoSession] = useState(false);
    const [demoStepIndex, setDemoStepIndex] = useState(0);
    const [pipelineProgress, setPipelineProgress] = useState(0);
    const [demoUiMeta, setDemoUiMeta] = useState(null);
    const [animatedScore, setAnimatedScore] = useState(0);
    const fileInputRef = useRef(null);
    const demoRunIdRef = useRef(0);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (file.type !== 'application/pdf') {
            setErrorMessage('Invalid file type. Please upload a PDF document.');
            setUploadStatus('error');
            return;
        }

        if (file.size > 20 * 1024 * 1024) { // 20MB limit
            setErrorMessage('File too large. Maximum size is 20MB.');
            setUploadStatus('error');
            return;
        }

        setSelectedFile(file);
        setErrorMessage('');
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        setErrorMessage('');
        setUploadProgress(0);
        setPipelineProgress(0);
        setDemoStepIndex(0);

        const useDemo = shouldUseDemoForFile(selectedFile);

        if (useDemo) {
            setDemoSession(true);
            setDemoUiMeta(null);
            setUploadStatus('uploading');
            const runId = ++demoRunIdRef.current;
            try {
                await runDemoStagedPipeline({
                    runId,
                    runIdRef: demoRunIdRef,
                    onUploadProgress: setUploadProgress,
                    onActiveStepIndex: (i) => {
                        setDemoStepIndex(i);
                        if (i >= 1) setUploadStatus('processing');
                    },
                    onOverallProgress: setPipelineProgress,
                });
                if (runId !== demoRunIdRef.current) return;
                const { report, meta } = getDemoPackage();
                setValidationResult(report);
                setDemoUiMeta(meta);
                setDemoSession(false);
                setUploadStatus('success');
            } catch (err) {
                setUploadProgress(0);
                setPipelineProgress(0);
                setDemoSession(false);
                setErrorMessage(err.message || 'Demo validation failed.');
                setUploadStatus('error');
            }
            return;
        }

        setDemoSession(false);
        setDemoUiMeta(null);
        setUploadStatus('uploading');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + Math.random() * 15;
                });
            }, 200);

            const response = await fetch(VALIDATE_URL, {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const detail = errorData.detail;
                const detailStr = typeof detail === 'string' ? detail : JSON.stringify(detail ?? '');
                const isQuota =
                    response.status === 503 ||
                    /quota|rate limit|billing|RESOURCE_EXHAUSTED|Gemini API quota/i.test(detailStr);
                const isAuth =
                    response.status === 401 ||
                    /api key|GEMINI_API_KEY|expired|invalid.*key|aistudio\.google/i.test(detailStr);
                const quotaMsg =
                    'The AI validation service is over its usage limit right now. Wait a few minutes and try again, enable billing in Google AI Studio, or ask your admin to set GEMINI_MODEL in backend/.env to a model with available quota. More info: https://ai.google.dev/gemini-api/docs/rate-limits';
                let message;
                if (response.status === 401 || isAuth) {
                    message =
                        detailStr ||
                        'Gemini API key is missing, invalid, or expired. Create a new key at https://aistudio.google.com/apikey and set GEMINI_API_KEY in backend/.env';
                } else if (isQuota) {
                    message = quotaMsg;
                } else {
                    message = detailStr || `Server error (${response.status}). Please try again.`;
                }
                throw new Error(message);
            }

            setUploadStatus('processing');

            const data = await response.json();
            setValidationResult(data);
            setUploadStatus('success');
        } catch (err) {
            setUploadProgress(0);
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                setErrorMessage('Cannot connect to the validation server. Please ensure the backend is running on localhost:8000.');
            } else {
                setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
            }
            setUploadStatus('error');
        }
    };

    const resetUpload = () => {
        demoRunIdRef.current += 1;
        setUploadStatus('idle');
        setSelectedFile(null);
        setErrorMessage('');
        setValidationResult(null);
        setUploadProgress(0);
        setPipelineProgress(0);
        setDemoStepIndex(0);
        setDemoSession(false);
        setDemoUiMeta(null);
        setAnimatedScore(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'score-high';
        if (score >= 50) return 'score-medium';
        return 'score-low';
    };

    const getSeverityClass = (severity) => {
        const s = (severity || '').toLowerCase();
        if (s === 'critical' || s === 'high') return 'severity-critical';
        if (s === 'medium') return 'severity-medium';
        return 'severity-low';
    };

    const getFindingSeverityClass = (severity) => {
        const s = (severity || '').toLowerCase();
        if (s === 'critical') return 'demo-finding-critical';
        if (s === 'moderate' || s === 'medium') return 'demo-finding-moderate';
        return 'demo-finding-low';
    };

    useEffect(() => {
        if (uploadStatus !== 'success' || !validationResult) return;
        const target =
            demoUiMeta?.validationScore ?? validationResult.confidence_score ?? 0;
        setAnimatedScore(0);
        const start = performance.now();
        const duration = 1100;
        let raf = 0;
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const ease = 1 - (1 - t) ** 3;
            setAnimatedScore(Math.round(target * ease));
            if (t < 1) raf = requestAnimationFrame(tick);
            else setAnimatedScore(target);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [uploadStatus, validationResult, demoUiMeta]);

    // ─── IDLE STATE: Upload Zone ───────────────────────────────
    const renderIdleState = () => (
        <div className="upload-section animate-fade-in">
            <div
                className={`dropzone ${isDragOver ? 'dropzone-active' : ''} ${selectedFile ? 'dropzone-has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                id="file-dropzone"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf"
                    hidden
                    id="file-input"
                />

                {!selectedFile ? (
                    <div className="dropzone-content">
                        <div className="dropzone-icon-wrap">
                            <Upload size={32} className="dropzone-icon" />
                        </div>
                        <h3 className="dropzone-title">
                            {isDragOver ? 'Drop your file here' : 'Upload Rental Agreement'}
                        </h3>
                        <p className="dropzone-subtitle">
                            Drag & drop a PDF file here, or <span className="dropzone-link">click to browse</span>
                        </p>
                        <div className="dropzone-formats">
                            <span className="format-badge">
                                <FileText size={14} /> PDF Only
                            </span>
                            <span className="format-badge">
                                Max 20MB
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="selected-file-card" onClick={(e) => e.stopPropagation()}>
                        <div className="file-icon-wrap">
                            <File size={28} className="file-icon" />
                        </div>
                        <div className="file-details">
                            <h4 className="file-name">{selectedFile.name}</h4>
                            <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                            className="file-remove-btn"
                            onClick={(e) => { e.stopPropagation(); removeFile(); }}
                            title="Remove file"
                            id="remove-file-btn"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            {selectedFile && (
                <div className="upload-actions animate-fade-in">
                    <button className="btn btn-outline" onClick={resetUpload} id="cancel-btn">
                        Cancel
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={handleFileUpload} id="validate-btn">
                        <FileCheck size={18} />
                        Validate Agreement
                    </button>
                </div>
            )}
        </div>
    );

    // ─── UPLOADING STATE ───────────────────────────────────────
    const renderUploadingState = () => (
        <div className="processing-section animate-fade-in">
            <div className="processing-card card">
                <div className="processing-icon-wrap uploading">
                    <Loader2 size={40} className="spinner-icon" />
                </div>
                <h3 className="processing-title">Uploading Document</h3>
                <p className="processing-text">
                    Sending <strong>{selectedFile?.name}</strong> to the validation server...
                </p>
                <div className="progress-bar-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                        ></div>
                    </div>
                    <span className="progress-label">{Math.round(Math.min(uploadProgress, 100))}%</span>
                </div>
            </div>
        </div>
    );

    // ─── PROCESSING STATE ──────────────────────────────────────
    const renderProcessingState = () => (
        <div className="processing-section animate-fade-in">
            <div className="processing-card card">
                <div className="processing-icon-wrap analyzing">
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring delay-1"></div>
                    <div className="pulse-ring delay-2"></div>
                    <FileCheck size={36} className="analyzing-icon" />
                </div>
                <h3 className="processing-title">Analyzing Agreement</h3>
                <p className="processing-text">
                    Scanning document against the <strong>Transfer of Property Act</strong> for ghost data and missing clauses...
                </p>
                <div className="scanning-steps">
                    <div className="scan-step active">
                        <Loader2 size={14} className="spinner-icon-sm" />
                        <span>Extracting document text</span>
                    </div>
                    <div className="scan-step">
                        <Loader2 size={14} className="spinner-icon-sm" />
                        <span>Checking mandatory clauses</span>
                    </div>
                    <div className="scan-step">
                        <Loader2 size={14} className="spinner-icon-sm" />
                        <span>Validating statutory compliance</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // ─── DEMO: staged pipeline (upload + analysis) ─────────────
    const renderDemoPipelineState = () => {
        const phaseLabel =
            uploadStatus === 'uploading' ? 'Securing upload' : 'AI compliance pipeline';
        return (
            <div className="processing-section animate-fade-in">
                <div className="processing-card card demo-pipeline-card">
                    <div className="demo-pipeline-badge">
                        <Sparkles size={14} />
                        <span>Demo</span>
                    </div>
                    <div className="processing-icon-wrap analyzing demo-pipeline-icon">
                        <div className="pulse-ring"></div>
                        <div className="pulse-ring delay-1"></div>
                        <FileCheck size={36} className="analyzing-icon" />
                    </div>
                    <h3 className="processing-title">{phaseLabel}</h3>
                    <p className="processing-text">
                        Processing <strong>{selectedFile?.name}</strong> — simulated intelligence layer (no live API).
                    </p>
                    <div className="demo-overall-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-fill demo-progress-fill"
                                style={{ width: `${Math.min(pipelineProgress, 100)}%` }}
                            />
                        </div>
                        <span className="progress-label">{Math.round(Math.min(pipelineProgress, 100))}%</span>
                    </div>
                    <ul className="demo-pipeline-steps" aria-label="Processing steps">
                        {DEMO_PIPELINE_STEPS.map((label, idx) => {
                            const done = idx < demoStepIndex;
                            const active = idx === demoStepIndex;
                            return (
                                <li
                                    key={label}
                                    className={`demo-pipeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                                >
                                    <span className="demo-step-dot" aria-hidden>
                                        {done ? (
                                            <CheckCircle size={16} />
                                        ) : active ? (
                                            <Loader2 size={16} className="spinner-icon-sm demo-step-spin" />
                                        ) : (
                                            <span className="demo-step-pending-dot" />
                                        )}
                                    </span>
                                    <span className="demo-step-label">{label}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    };

    // ─── ERROR STATE ───────────────────────────────────────────
    const renderErrorState = () => (
        <div className="processing-section animate-fade-in">
            <div className="error-card card">
                <div className="error-icon-wrap">
                    <XCircle size={48} className="error-icon" />
                </div>
                <h3 className="error-title">Validation Failed</h3>
                <p className="error-text">{errorMessage}</p>
                <div className="error-actions">
                    <button className="btn btn-outline" onClick={resetUpload} id="back-btn">
                        Upload Different File
                    </button>
                    <button className="btn btn-primary" onClick={handleFileUpload} id="retry-btn">
                        <RotateCcw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );

    // ─── SUCCESS STATE: Results Dashboard ──────────────────────
    const renderSuccessState = () => {
        const apiConfidence = validationResult?.confidence_score ?? 0;
        const scoreForRing = demoUiMeta?.validationScore ?? apiConfidence;
        const contradictions = validationResult?.contradictions ?? [];
        const missingClauses = validationResult?.missing_clauses ?? [];
        const validationIssues = validationResult?.validation_issues ?? [];
        const riskyClauses = validationResult?.risky_clauses ?? [];
        const recommendations = validationResult?.recommendations ?? [];
        const totalIssues =
            contradictions.length +
            missingClauses.length +
            validationIssues.length +
            riskyClauses.length;
        const ringArc = Math.min(100, Math.max(0, animatedScore));

        return (
            <div className={`success-section animate-fade-in${demoUiMeta ? ' success-section--demo' : ''}`}>
                {/* ── Top bar: status + action ─────────────────── */}
                <div className="success-header">
                    <div className="success-header-badges">
                        <div className="success-badge">
                            <CheckCircle size={20} />
                            <span>Validation Complete</span>
                        </div>
                        {demoUiMeta && (
                            <span className={`demo-risk-badge demo-risk-${String(demoUiMeta.riskLevel).toLowerCase()}`}>
                                Overall risk · {demoUiMeta.riskLevel}
                            </span>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={resetUpload} id="new-upload-btn">
                        <RotateCcw size={16} />
                        Start New Validation
                    </button>
                </div>

                {/* ── Confidence Score Hero ────────────────────── */}
                <div className="score-hero card demo-reveal demo-reveal-d0">
                    <div className="score-hero-left">
                        <div className={`score-ring-lg ${getScoreColor(scoreForRing)}`}>
                            <svg viewBox="0 0 120 120" className="score-svg">
                                <circle
                                    cx="60" cy="60" r="52"
                                    fill="none" stroke="var(--border-color)" strokeWidth="8"
                                />
                                <circle
                                    cx="60" cy="60" r="52"
                                    fill="none"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    className="score-arc"
                                    strokeDasharray={`${(ringArc / 100) * 327} 327`}
                                    transform="rotate(-90 60 60)"
                                />
                            </svg>
                            <div className="score-ring-inner">
                                <span className="score-number">{animatedScore}</span>
                                <span className="score-of">/100</span>
                            </div>
                        </div>
                    </div>
                    <div className="score-hero-right">
                        <h2 className="score-hero-title">
                            {demoUiMeta ? 'Validation score' : 'Confidence Score'}
                        </h2>
                        {demoUiMeta && (
                            <p className="score-hero-confidence">
                                Model confidence · <strong>{apiConfidence}%</strong>
                            </p>
                        )}
                        <p className="score-hero-file">
                            <FileText size={14} />
                            {selectedFile?.name}
                        </p>
                        <div className="score-summary-stats">
                            <div className="score-stat">
                                <span className={`score-stat-num ${contradictions.length > 0 ? 'text-danger' : 'text-success'}`}>
                                    {contradictions.length}
                                </span>
                                <span className="score-stat-label">Contradictions</span>
                            </div>
                            <div className="score-stat-divider"></div>
                            <div className="score-stat">
                                <span className={`score-stat-num ${missingClauses.length > 0 ? 'text-warning-dark' : 'text-success'}`}>
                                    {missingClauses.length}
                                </span>
                                <span className="score-stat-label">Missing Clauses</span>
                            </div>
                            <div className="score-stat-divider"></div>
                            <div className="score-stat">
                                <span className="score-stat-num text-primary">{totalIssues}</span>
                                <span className="score-stat-label">Total Issues</span>
                            </div>
                        </div>
                    </div>
                </div>

                {(validationResult?.document_summary ||
                    (validationResult?.processing_notes?.length > 0)) && (
                    <details className="card document-meta-details animate-fade-in" style={{ marginTop: '1rem' }}>
                        <summary className="document-meta-summary" style={{ cursor: 'pointer', fontWeight: 600 }}>
                            Document summary and processing notes
                        </summary>
                        <div style={{ marginTop: '0.75rem' }}>
                            {validationResult?.document_summary && (
                                <p className="processing-text">{validationResult.document_summary}</p>
                            )}
                            {validationResult?.processing_notes?.length > 0 && (
                                <ul className="processing-notes-list">
                                    {validationResult.processing_notes.map((note, i) => (
                                        <li key={i}>{note}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </details>
                )}

                {demoUiMeta && (
                    <>
                        <details className="card demo-expand-card demo-reveal demo-reveal-d1" open>
                            <summary className="demo-expand-summary">
                                <span className="demo-expand-title">Key findings</span>
                                <ChevronDown size={18} className="demo-expand-chevron" aria-hidden />
                            </summary>
                            <ul className="demo-key-findings-list">
                                {demoUiMeta.keyFindings.map((f, i) => (
                                    <li key={i} className={`demo-key-finding ${getFindingSeverityClass(f.severity)}`}>
                                        <span className="demo-key-finding-sev">{f.severity}</span>
                                        <span className="demo-key-finding-text">{f.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </details>

                        <details className="card demo-expand-card demo-reveal demo-reveal-d2">
                            <summary className="demo-expand-summary">
                                <span className="demo-expand-title">Strengths detected</span>
                                <ChevronDown size={18} className="demo-expand-chevron" aria-hidden />
                            </summary>
                            <ul className="demo-strengths-list">
                                {demoUiMeta.positiveFindings.map((t, i) => (
                                    <li key={i}>
                                        <CheckCircle size={16} className="demo-strength-icon" />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </details>

                        <div className="card demo-coverage-card demo-reveal demo-reveal-d3">
                            <h3 className="demo-coverage-heading">Clause coverage summary</h3>
                            <div className="demo-coverage-grid">
                                {demoUiMeta.clauseCoverage.map((row) => (
                                    <div
                                        key={row.name}
                                        className={`demo-coverage-pill ${row.covered ? 'covered' : 'gap'}`}
                                    >
                                        <span className="demo-coverage-name">{row.name}</span>
                                        <span className="demo-coverage-state">{row.covered ? 'Present' : 'Gap'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ── Critical Contradictions (Ghost Data) ─────── */}
                {contradictions.length > 0 && (
                    <div className={`results-section${demoUiMeta ? ' demo-reveal demo-reveal-d4' : ''}`}>
                        <div className="results-section-header">
                            <div className="results-section-title-wrap">
                                <ShieldAlert size={20} className="text-danger" />
                                <h3 className="results-section-title">Critical Contradictions (Ghost Data)</h3>
                            </div>
                            <span className="results-count badge-danger">{contradictions.length} found</span>
                        </div>

                        <div className="results-cards">
                            {contradictions.map((item, idx) => (
                                <div key={idx} className="result-card contradiction-card card" id={`contradiction-${idx}`}>
                                    <div className="result-card-indicator danger"></div>
                                    <div className="result-card-body">
                                        <div className="result-card-header">
                                            <XCircle size={18} className="text-danger" />
                                            <span className="result-card-number">#{idx + 1}</span>
                                        </div>
                                        <p className="result-card-description">{item.description}</p>
                                        <div className="location-badges">
                                            <div className="location-badge location-1">
                                                <MapPin size={12} />
                                                <span>{item.location_1}</span>
                                            </div>
                                            <ArrowRight size={14} className="location-arrow" />
                                            <div className="location-badge location-2">
                                                <MapPin size={12} />
                                                <span>{item.location_2}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Missing Mandatory Clauses ───────────────── */}
                {missingClauses.length > 0 && (
                    <div className={`results-section${demoUiMeta ? ' demo-reveal demo-reveal-d5' : ''}`}>
                        <div className="results-section-header">
                            <div className="results-section-title-wrap">
                                <AlertTriangle size={20} className="text-warning-dark" />
                                <h3 className="results-section-title">Missing Mandatory Clauses</h3>
                            </div>
                            <span className="results-count badge-warning">{missingClauses.length} found</span>
                        </div>

                        <div className="results-cards">
                            {missingClauses.map((item, idx) => (
                                <div key={idx} className="result-card missing-card card" id={`missing-clause-${idx}`}>
                                    <div className="result-card-indicator warning"></div>
                                    <div className="result-card-body">
                                        <div className="result-card-header">
                                            <AlertTriangle size={18} className="text-warning-dark" />
                                            <span className="result-card-clause-name">{item.clause_name}</span>
                                            <span className={`severity-badge ${getSeverityClass(item.severity)}`}>
                                                {item.severity}
                                            </span>
                                        </div>
                                        {item.description && (
                                            <p className="result-card-description">{item.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {validationIssues.length > 0 && (
                    <div className={`results-section${demoUiMeta ? ' demo-reveal demo-reveal-d5' : ''}`}>
                        <div className="results-section-header">
                            <div className="results-section-title-wrap">
                                <AlertTriangle size={20} className="text-warning-dark" />
                                <h3 className="results-section-title">Validation issues (by section)</h3>
                            </div>
                            <span className="results-count badge-warning">{validationIssues.length}</span>
                        </div>
                        <div className="results-cards">
                            {validationIssues.map((item, idx) => (
                                <div key={idx} className="result-card card" id={`val-issue-${idx}`}>
                                    <div className="result-card-body">
                                        <span className={`severity-badge ${getSeverityClass(item.severity)}`}>
                                            {item.severity}
                                        </span>
                                        <p className="result-card-description">{item.description}</p>
                                        <p className="result-card-meta text-muted">
                                            {item.chunk_index >= 0
                                                ? `Chunk ${item.chunk_index}${item.chunk_label ? ` — ${item.chunk_label}` : ''}`
                                                : (item.chunk_label || 'Document-wide')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {riskyClauses.length > 0 && (
                    <div className={`results-section${demoUiMeta ? ' demo-reveal demo-reveal-d6' : ''}`}>
                        <div className="results-section-header">
                            <div className="results-section-title-wrap">
                                <ShieldAlert size={20} className="text-danger" />
                                <h3 className="results-section-title">Risky clauses</h3>
                            </div>
                            <span className="results-count badge-danger">{riskyClauses.length}</span>
                        </div>
                        <div className="results-cards">
                            {riskyClauses.map((item, idx) => (
                                <div key={idx} className="result-card card" id={`risky-${idx}`}>
                                    <div className="result-card-body">
                                        <strong>{item.clause_or_issue}</strong>
                                        <p className="result-card-description">{item.risk_description}</p>
                                        {item.chunk_index >= 0 && (
                                            <p className="result-card-meta text-muted">
                                                Chunk {item.chunk_index}{item.chunk_label ? ` — ${item.chunk_label}` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {recommendations.length > 0 && (
                    <div className={`results-section${demoUiMeta ? ' demo-reveal demo-reveal-d7' : ''}`}>
                        <h3 className="results-section-title">Recommendations</h3>
                        <ul className="recommendations-list">
                            {recommendations.map((r, idx) => (
                                <li key={idx}>{r}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── No issues found state ───────────────────── */}
                {contradictions.length === 0 &&
                    missingClauses.length === 0 &&
                    validationIssues.length === 0 &&
                    riskyClauses.length === 0 && (
                    <div className="no-issues-card card">
                        <CheckCircle size={40} className="text-success" />
                        <h3>No Issues Detected</h3>
                        <p>This rental agreement passed all validation checks successfully.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="compliance-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Validation Engine</h1>
                    <p className="page-subtitle">
                        Upload a rental agreement PDF to scan for regulatory compliance and missing clauses.
                    </p>
                    {isDemoMode() && (
                        <p className="page-demo-banner">
                            <Sparkles size={14} aria-hidden />
                            Demo mode — uploads use the staged mock (no Gemini). In development this is the default;
                            set <code className="page-demo-code">VITE_DEMO_MODE=false</code> to call the live API.
                        </p>
                    )}
                </div>
                {uploadStatus !== 'idle' && uploadStatus !== 'error' && (
                    <button className="btn btn-outline" onClick={resetUpload}>
                        <RotateCcw size={16} /> Reset
                    </button>
                )}
            </div>

            {uploadStatus === 'idle' && renderIdleState()}
            {uploadStatus === 'uploading' && !demoSession && renderUploadingState()}
            {uploadStatus === 'processing' && !demoSession && renderProcessingState()}
            {demoSession && (uploadStatus === 'uploading' || uploadStatus === 'processing') && renderDemoPipelineState()}
            {uploadStatus === 'error' && renderErrorState()}
            {uploadStatus === 'success' && renderSuccessState()}
        </div>
    );
};

export default Compliance;
