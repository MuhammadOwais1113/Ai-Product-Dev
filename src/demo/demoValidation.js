/**
 * Demo-mode validation: no backend/Gemini. Staged pipeline + mock FullValidationReport.
 *
 * Env:
 * - VITE_DEMO_MODE: explicit on (true/1) or off (false/0). If unset: ON in `vite` dev, OFF in production build.
 * - VITE_DEMO_ALL_PDFS: if true, any PDF uses the mock. If false, only VITE_DEMO_FILENAME. If unset in dev: any PDF.
 * - VITE_DEMO_DURATION_MS (5000–60000), VITE_DEMO_FILENAME
 */

function envTriState(key) {
    const v = import.meta.env[key];
    if (v === 'true' || v === '1') return true;
    if (v === 'false' || v === '0') return false;
    return null;
}

export const DEMO_PIPELINE_STEPS = [
    'Uploading document',
    'Extracting text',
    'Detecting clauses',
    'Checking compliance',
    'Resolving contradictions',
    'Finalizing validation report',
];

const DEFAULT_DEMO_MS = 6400;
const MIN_DEMO_MS = 5000;
const MAX_DEMO_MS = 60000;

export function isDemoMode() {
    const explicit = envTriState('VITE_DEMO_MODE');
    if (explicit !== null) return explicit;
    return import.meta.env.DEV;
}

export function getDemoDurationMs() {
    const raw = Number(import.meta.env.VITE_DEMO_DURATION_MS);
    if (Number.isFinite(raw) && raw >= MIN_DEMO_MS && raw <= MAX_DEMO_MS) {
        return Math.floor(raw);
    }
    return DEFAULT_DEMO_MS;
}

function demoFilenameMatch(file) {
    const expected = (import.meta.env.VITE_DEMO_FILENAME || 'test_agreement.pdf')
        .trim()
        .toLowerCase();
    return file.name.trim().toLowerCase() === expected;
}

export function shouldUseDemoForFile(file) {
    if (!isDemoMode() || !file?.name) return false;
    const all = envTriState('VITE_DEMO_ALL_PDFS');
    if (all === true) return true;
    if (all === false) return demoFilenameMatch(file);
    // Unset: in local dev, any PDF uses the mock so demos work without renaming files.
    if (import.meta.env.DEV) return true;
    return demoFilenameMatch(file);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function aborted(runId, runIdRef) {
    return runId !== runIdRef.current;
}

/**
 * Smooth upload progress (rAF), then step through analysis indices 1..5.
 * Step 0 = upload phase. Calls onActiveStepIndex(0) during upload.
 */
export async function runDemoStagedPipeline({
    runId,
    runIdRef,
    onUploadProgress,
    onActiveStepIndex,
    onOverallProgress,
}) {
    const total = getDemoDurationMs();
    const uploadMs = Math.round(total * 0.16);
    const rest = Math.max(0, total - uploadMs);
    const n = DEMO_PIPELINE_STEPS.length;
    const perStep = Math.max(280, Math.floor(rest / Math.max(1, n - 1)));

    onActiveStepIndex(0);
    onOverallProgress?.(0);

    const uploadStart = performance.now();
    await new Promise((resolve) => {
        let raf = 0;
        const tick = () => {
            if (aborted(runId, runIdRef)) {
                cancelAnimationFrame(raf);
                resolve();
                return;
            }
            const elapsed = performance.now() - uploadStart;
            const p = Math.min(100, (elapsed / uploadMs) * 100);
            onUploadProgress(p);
            onOverallProgress?.(p * 0.14);
            if (elapsed < uploadMs) {
                raf = requestAnimationFrame(tick);
            } else {
                onUploadProgress(100);
                onOverallProgress?.(14);
                resolve();
            }
        };
        raf = requestAnimationFrame(tick);
    });

    if (aborted(runId, runIdRef)) return;

    for (let i = 1; i < n; i++) {
        if (aborted(runId, runIdRef)) return;
        onActiveStepIndex(i);
        const seg = 14 + ((i - 1) / (n - 1)) * 86;
        onOverallProgress?.(Math.min(100, seg));
        await sleep(perStep);
    }
    if (!aborted(runId, runIdRef)) {
        onOverallProgress?.(100);
    }
}

/** Matches backend FullValidationReport shape for Compliance.jsx */
export function getDemoValidationReport() {
    return {
        document_summary:
            'Residential tenancy agreement (Lahore) between landlord and tenant. Lease term, security deposit, utility split, maintenance duties, and guarantor are referenced. Critical inconsistency: stated monthly rent differs between the main body and Appendix A.',
        extracted_sections: [
            {
                title: 'Parties & identification',
                chunk_indices: [0],
                summary:
                    'Landlord and tenant named with CNIC references; property address and unit described.',
            },
            {
                title: 'Term & rent',
                chunk_indices: [0, 1],
                summary:
                    'Fixed lease period stated. Monthly rent appears as Rs. 45,000 in the main agreement and Rs. 55,000 in Appendix A — requires reconciliation.',
            },
            {
                title: 'Deposit & utilities',
                chunk_indices: [1],
                summary:
                    'Security deposit amount specified. Allocation of utility charges (electricity, gas, water) between parties is outlined.',
            },
            {
                title: 'Maintenance & guarantor',
                chunk_indices: [1],
                summary:
                    'Routine maintenance vs structural repairs partially allocated. Personal guarantor details and undertaking referenced.',
            },
        ],
        validation_issues: [
            {
                description:
                    'No standalone termination or early-exit procedure detected; end-of-term behavior relies on general clauses only.',
                severity: 'Medium',
                chunk_index: -1,
                chunk_label: 'Tenancy duration',
            },
            {
                description:
                    'Dispute resolution path (courts, arbitration, or mediation) not clearly isolated in a dedicated clause.',
                severity: 'Medium',
                chunk_index: -1,
                chunk_label: 'Governance',
            },
        ],
        missing_clauses: [
            {
                clause_name: 'Termination / early exit',
                severity: 'Medium',
                description:
                    'A dedicated clause for notice, break fees, or early termination would reduce ambiguity if either party needs to exit before term end.',
            },
            {
                clause_name: 'Dispute resolution',
                severity: 'Medium',
                description:
                    'Explicit forum (e.g. arbitration under applicable rules) or escalation steps are commonly expected in commercial-grade leases.',
            },
            {
                clause_name: 'Notice period',
                severity: 'Medium',
                description:
                    'Formal notice periods for rent revision, access for repairs, or non-renewal are not clearly codified in one place.',
            },
            {
                clause_name: 'Renewal terms',
                severity: 'Low',
                description:
                    'Renewal option, term, or rent adjustment mechanics at expiry are absent or only implied.',
            },
            {
                clause_name: 'Late payment penalty',
                severity: 'Low',
                description:
                    'No explicit late fee, grace period, or interest language tied to delayed rent payments.',
            },
            {
                clause_name: 'Property use restrictions',
                severity: 'Low',
                description:
                    'Subletting, commercial use, pets, and alteration rules are not consolidated in a single enforceable section.',
            },
            {
                clause_name: 'Default consequences',
                severity: 'Low',
                description:
                    'Event-of-default remedies (forfeiture of deposit, eviction timeline) could be spelled out more clearly.',
            },
        ],
        risky_clauses: [
            {
                clause_or_issue: 'Conflicting monthly rent figures',
                risk_description:
                    'The operative rent is ambiguous: the main agreement cites Rs. 45,000 per month while Appendix A schedules Rs. 55,000. This exposes both parties to payment disputes and enforcement risk until amended or clarified.',
                chunk_index: -1,
                chunk_label: 'Rent schedule',
            },
        ],
        recommendations: [
            'Execute a single rent schedule: align Appendix A with the main clause or add an amendment stating which figure controls and from which date.',
            'Add a termination / early-exit article with notice length, any exit fee, and handover checklist.',
            'Insert dispute resolution (e.g. mediation step, then arbitration or designated courts) and governing law references.',
            'Define late rent grace period, penalty or markup, and how notices of default are delivered.',
            'Consolidate renewal, rent review, and notice rules so expiry and continuation are predictable.',
        ],
        processing_notes: [
            'Demo mode: validation was simulated locally; no live AI API was called.',
            'Structured output follows the same schema as production /validate responses.',
            'Priority review: reconcile rent amounts before execution or registration.',
        ],
        confidence_score: 91,
        contradictions: [
            {
                description:
                    'Monthly rent is stated as Rs. 45,000 in the main agreement body, but Appendix A (payment schedule) lists Rs. 55,000 for the same tenancy. These figures cannot both be correct without an explicit overriding clause.',
                location_1: 'Page 1 — Main rent clause',
                location_2: 'Appendix A — Payment schedule',
            },
        ],
    };
}

/** UI-only meta (not sent by real API); used for validation score, risk, coverage, findings lists */
export const DEMO_UI_META = {
    validationScore: 78,
    riskLevel: 'Medium',
    keyFindings: [
        {
            severity: 'Critical',
            text: 'Inconsistent monthly rent: Rs. 45,000 in the main agreement vs Rs. 55,000 in Appendix A.',
        },
        {
            severity: 'Moderate',
            text: 'No dedicated termination / early-exit clause found.',
        },
        {
            severity: 'Moderate',
            text: 'No standalone dispute resolution clause found.',
        },
        {
            severity: 'Low',
            text: 'Renewal and late-payment terms are weak or absent.',
        },
    ],
    positiveFindings: [
        'Parties and identification details present',
        'Property / premises described',
        'Lease period defined',
        'Security deposit defined',
        'Utility responsibilities stated',
        'Maintenance responsibilities addressed',
        'Guarantor details referenced',
    ],
    clauseCoverage: [
        { name: 'Parties identification', covered: true },
        { name: 'Property description', covered: true },
        { name: 'Lease duration', covered: true },
        { name: 'Rent amount (consistent)', covered: false },
        { name: 'Security deposit', covered: true },
        { name: 'Utilities', covered: true },
        { name: 'Maintenance', covered: true },
        { name: 'Guarantor', covered: true },
        { name: 'Termination / exit', covered: false },
        { name: 'Dispute resolution', covered: false },
        { name: 'Notice period', covered: false },
        { name: 'Renewal terms', covered: false },
    ],
};

export function getDemoPackage() {
    return {
        report: getDemoValidationReport(),
        meta: DEMO_UI_META,
    };
}
