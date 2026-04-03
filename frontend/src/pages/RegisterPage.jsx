import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Building, CheckCircle, ShieldCheck, ArrowRight, Loader } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    university: '', phone: '', location: '', otp: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSendOTP = async () => {
    if (!form.email) return toast.error('Please enter your email first');
    setOtpLoading(true);
    try {
      await api.post('/auth/send-otp', { email: form.email });
      setOtpSent(true);
      toast.success('Verification code sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!form.otp) { toast.error('Please verify your email with OTP'); return; }

    setLoading(true);
    try {
      await register(form);
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-12 max-w-md w-full text-center border border-slate-100 dark:border-slate-800">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Welcome aboard!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Your account has been created successfully. You can now access the full campus marketplace.
          </p>
          <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95">
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30 mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Join CampsMart</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Create your secure student account</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 border border-slate-100 dark:border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Name */}
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 mb-2 block">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input name="name" value={form.name} onChange={handleChange} required 
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none text-slate-900 dark:text-white font-bold transition-all" />
              </div>
            </div>

            {/* Email & OTP */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 mb-2 block">College Email</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input name="email" type="email" value={form.email} onChange={handleChange} required 
                      placeholder="you@college.edu"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none text-slate-900 dark:text-white font-bold transition-all" />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleSendOTP} 
                    disabled={otpLoading || otpSent}
                    className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-[10px] rounded-2xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 uppercase tracking-widest"
                  >
                    {otpLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : otpSent ? 'Resend' : 'Get OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="animate-enter">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1 mb-2 block">Enter 6-Digit Code</label>
                  <input 
                    name="otp" 
                    value={form.otp} 
                    onChange={handleChange} 
                    required 
                    maxLength="6"
                    placeholder="000000"
                    className="w-full px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl outline-none text-center text-2xl font-black tracking-[0.8em] text-blue-600 dark:text-blue-400 transition-all placeholder:text-blue-200" 
                  />
                </div>
              )}
            </div>

            {/* University */}
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 mb-2 block">University</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input name="university" value={form.university} onChange={handleChange} required 
                  placeholder="Campus Name"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none text-slate-900 dark:text-white font-bold transition-all" />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 mb-2 block">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required 
                    placeholder="••••••"
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none text-slate-900 dark:text-white font-bold transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 mb-2 block">Confirm</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required 
                  placeholder="••••••"
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none text-slate-900 dark:text-white font-bold transition-all" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !otpSent}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-500">
            Already a member?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
