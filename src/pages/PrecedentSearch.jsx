import React, { useState } from 'react';
import {
    Search,
    Filter,
    SlidersHorizontal,
    FileText,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    PlusCircle,
    Zap,
    Bookmark
} from 'lucide-react';
import './PrecedentSearch.css';

const mockResults = [
    {
        id: 1,
        title: "Mst. Fatima Bibi vs. Shahbaz Ali",
        court: "Supreme Court of Pakistan",
        year: "2021",
        citation: "2021 SCMR 1245",
        domain: "Family Law",
        relevance: 96,
        summary: "The apex court held that the right of a wife to claim maintenance is absolute and cannot be defeated by the husband's financial difficulties, clarifying the interpretation of Section 9 of the Muslim Family Laws Ordinance, 1961.",
        reasoning: "The AI matched this precedent because your current case draft involves a claim for past maintenance where the respondent has cited financial insolvency. This judgment directly addresses and overrides the insolvency defense in family maintenance disputes.",
    },
    {
        id: 2,
        title: "Zafar Property Developers vs. CDA",
        court: "Islamabad High Court",
        year: "2019",
        citation: "2019 CLC 892",
        domain: "Civil Property",
        relevance: 88,
        summary: "Established that specific performance of a contract cannot be enforced if the terms are inherently ambiguous regarding the timeline of possession.",
        reasoning: "Matched based on natural language query 'ambiguous timeline in property possession contract'. The ruling provides a strong defense against specific performance claims in such scenarios.",
    },
    {
        id: 3,
        title: "State Bank vs. Al-Rashid Textile Mills",
        court: "Lahore High Court",
        year: "2022",
        citation: "2022 PLD 341",
        domain: "Corporate Law",
        relevance: 82,
        summary: "High Court ruled on the restructuring of corporate debt, stating that mutual consent forms the bedrock of any moratorium agreement under the Companies Act.",
        reasoning: "Relevant to your query about corporate debt restructuring mechanisms and mutual consent clauses.",
    }
];

const PrecedentSearch = () => {
    const [expandedId, setExpandedId] = useState(1);
    const [query, setQuery] = useState('maintenance claim defense financial insolvency');

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="precedent-container animate-fade-in">
            <div className="search-header-area">
                <h1 className="page-title">Legal Research & Precedents</h1>
                <p className="page-subtitle">Search across Pakistan's civil judgments using natural language.</p>

                <div className="search-bar-wrapper">
                    <div className="main-search-input">
                        <Zap className="ai-search-icon" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Describe your legal issue, e.g., 'breach of contract due to act of god'"
                        />
                        <button className="btn btn-primary search-btn">
                            <Search size={18} /> Deep Search
                        </button>
                    </div>
                </div>

                <div className="filter-bar">
                    <div className="filter-group">
                        <Filter size={16} className="text-muted" />
                        <span className="filter-label">Filters:</span>
                    </div>
                    <select className="filter-select">
                        <option>All Courts</option>
                        <option>Supreme Court</option>
                        <option>Lahore High Court</option>
                        <option>Sindh High Court</option>
                        <option>Islamabad High Court</option>
                    </select>
                    <select className="filter-select">
                        <option>All Domains</option>
                        <option>Family Law</option>
                        <option>Corporate Law</option>
                        <option>Property Law</option>
                    </select>
                    <select className="filter-select">
                        <option>Any Year</option>
                        <option>Last 5 Years</option>
                        <option>Last 10 Years</option>
                        <option>Before 2010</option>
                    </select>
                    <button className="btn btn-outline btn-sm ml-auto">
                        <SlidersHorizontal size={16} /> Advanced
                    </button>
                </div>
            </div>

            <div className="results-container">
                <div className="results-header">
                    <p>Found <strong>1,245</strong> results for <span className="query-highlight">"{query}"</span></p>
                    <div className="sort-by">
                        <span>Sort by:</span>
                        <select className="sort-select">
                            <option>AI Relevance</option>
                            <option>Date (Newest)</option>
                            <option>Most Cited</option>
                        </select>
                    </div>
                </div>

                <div className="results-list">
                    {mockResults.map((result) => (
                        <div key={result.id} className={`result-card card ${expandedId === result.id ? 'expanded' : ''}`}>
                            <div className="result-main" onClick={() => toggleExpand(result.id)}>
                                <div className="result-meta">
                                    <span className="result-citation">{result.citation}</span>
                                    <span className="dot-separator">•</span>
                                    <span className="result-court">{result.court}</span>
                                    <span className="dot-separator">•</span>
                                    <span className="result-year">{result.year}</span>
                                    <span className="dot-separator">•</span>
                                    <span className="result-domain">{result.domain}</span>
                                </div>

                                <div className="result-title-row">
                                    <h3 className="result-title">{result.title}</h3>
                                    <div className="relevance-score" title="AI Relevance Score">
                                        <Zap size={14} className="text-accent" />
                                        <span className={result.relevance > 90 ? 'text-success' : 'text-primary'}>
                                            {result.relevance}% Match
                                        </span>
                                    </div>
                                </div>

                                <p className="result-summary">{result.summary}</p>

                                <div className="result-actions-compact">
                                    <button className="expand-toggle text-muted">
                                        {expandedId === result.id ? <><ChevronUp size={16} /> Less detail</> : <><ChevronDown size={16} /> AI Reasoning</>}
                                    </button>
                                </div>
                            </div>

                            {expandedId === result.id && (
                                <div className="result-expanded animate-fade-in">
                                    <div className="ai-reasoning-box">
                                        <h4 className="reasoning-title"><Zap size={16} className="text-accent" /> Why this is relevant</h4>
                                        <p className="reasoning-text">{result.reasoning}</p>
                                    </div>

                                    <div className="expanded-actions">
                                        <button className="btn btn-outline btn-sm">
                                            <ExternalLink size={16} /> View Full Text
                                        </button>
                                        <button className="btn btn-outline btn-sm">
                                            <Bookmark size={16} /> Save to Case
                                        </button>
                                        <button className="btn btn-accent btn-sm">
                                            <PlusCircle size={16} /> Use in Draft
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="pagination">
                        <button className="btn btn-outline btn-sm" disabled>Previous</button>
                        <span className="page-info">Page 1 of 42</span>
                        <button className="btn btn-outline btn-sm">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrecedentSearch;
