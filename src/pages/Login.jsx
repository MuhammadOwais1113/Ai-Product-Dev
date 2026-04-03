import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Scale,
    Lock,
    User,
    Mail,
    ShieldCheck,
    ArrowRight,
    Eye,
    EyeOff,
    Building2,
    Phone
} from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        barCouncilNo: '',
        role: 'agent'
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call for auth
        setTimeout(() => {
            setIsLoading(false);
            // In a real app, you would set auth context/tokens here
            console.log(isLogin ? "Logged in with:" : "Signed up with:", formData);
            // Default to agent for demo layout purposes, or whatever was selected
            navigate('/');
        }, 1200);
    };

    return (
        <div className="login-container">
            {/* Left Panel: Branding & Trust */}
            <div className="login-brand-panel">
                <div className="brand-content">
                    <div className="brand-logo">
                        <Scale size={48} className="text-gold" />
                        <h1>LegalDraft</h1>
                    </div>

                    <div className="brand-message">
                        <h2>Smart Rental Agreement Validation & Drafting.</h2>
                        <p>Secure, compliant, and precision-driven tools designed exclusively for Real Estate Agents and Property Managers in Pakistan.</p>
                    </div>

                    <div className="trust-indicators">
                        <div className="indicator">
                            <ShieldCheck size={24} className="text-success" />
                            <div>
                                <h4>Bank-Grade Encryption</h4>
                                <span>AES-256 bit data protection</span>
                            </div>
                        </div>
                        <div className="indicator mt-4">
                            <Lock size={24} className="text-info" />
                            <div>
                                <h4>Strict Privacy Standards</h4>
                                <span>Client confidentiality guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Working Authentication Form */}
            <div className="login-form-panel">
                <div className="login-form-wrapper">
                    <div className="auth-header">
                        <h2>{isLogin ? "Welcome Back" : "Create an Account"}</h2>
                        <p className="text-muted">
                            {isLogin
                                ? "Enter your credentials to access your secure workspace."
                                : "Join LegalDraft to streamline your rental agreements."
                            }
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form animate-fade-in">
                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <div className="input-with-icon">
                                        <User size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            className="input-field icon-pad"
                                            placeholder="Your Full Name"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <div className="input-with-icon">
                                            <Phone size={18} className="input-icon" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="input-field icon-pad"
                                                placeholder="+92 3XX XXXXXXX"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Agency License No.</label>
                                        <div className="input-with-icon">
                                            <Building2 size={18} className="input-icon" />
                                            <input
                                                type="text"
                                                name="barCouncilNo"
                                                className="input-field icon-pad"
                                                placeholder="e.g. REA-XXXX"
                                                value={formData.barCouncilNo}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Account Role</label>
                                    <select
                                        name="role"
                                        className="input-field"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="agent">Real Estate Agent</option>
                                        <option value="property_manager">Property Manager</option>
                                        <option value="admin">Agency Admin</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    className="input-field icon-pad"
                                    placeholder="your@firm.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label flex-between">
                                Password
                                {isLogin && <a href="#" className="text-link text-xs">Forgot Password?</a>}
                            </label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="input-field icon-pad"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    minLength="8"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {!isLogin && <p className="text-xs text-muted mt-1">Must be at least 8 characters long.</p>}
                        </div>

                        {isLogin && (
                            <label className="checkbox-row mt-4 cursor-pointer">
                                <input type="checkbox" className="custom-checkbox" />
                                <span className="text-sm">Remember this device for 30 days</span>
                            </label>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-full mt-6 login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="auth-loader">Authenticating...</span>
                            ) : (
                                <>
                                    {isLogin ? "Secure Login" : "Create Account"} <ArrowRight size={18} className="ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-toggle-section">
                        <p>
                            {isLogin ? "Don't have an account yet?" : "Already registered?"}
                            <button className="text-link ml-1 font-semibold" onClick={toggleMode}>
                                {isLogin ? "Request Access" : "Sign in here"}
                            </button>
                        </p>
                    </div>

                    <div className="compliance-footer">
                        <p>By proceeding, you agree to LegalDraft's <a href="#" className="text-link">Terms of Service</a> & <a href="#" className="text-link">Data Privacy Policy</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
