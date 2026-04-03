import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }

    api.get(`/auth/verify-email?token=${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.'); });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <><Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Verifying your email...</p></>
        )}
        {status === 'success' && (
          <><div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" /></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Email Verified! ✅</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-300 mb-6">
            <p className="font-semibold mb-1">Waiting for Admin Approval</p>
            <p>An admin is reviewing your College ID. You'll get an email once approved.</p>
          </div>
          <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">Go to Login</Link></>
        )}
        {status === 'error' && (
          <><div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" /></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verification Failed</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <Link to="/register" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">Register Again</Link></>
        )}
      </div>
    </div>
  );
}
