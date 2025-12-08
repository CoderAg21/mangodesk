import {Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Send, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
const InputField = ({ label, id, type, value, onChange, icon: Icon }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block text-sm font-medium mb-2 text-gray-300">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-violet-400" />
      )}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        required
        className="w-full p-3 pl-10 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600 transition duration-200"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
  </div>
);

const SocialButton = ({ icon: Icon, text }) => (
  <button className="flex items-center justify-center w-full py-3 mt-4 border border-gray-700 bg-gray-800 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 transition duration-200">
    <Icon className="w-5 h-5 mr-3 text-red-500" />
    {text}
  </button>
);

const GoogleIcon = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path fill="#FFC107" d="M43.61 20.087H42V20H24v8h11.346c-1.66 2.478-4.32 4.18-7.346 4.18-5.7 0-10.32-4.62-10.32-10.32s4.62-10.32 10.32-10.32c3.08 0 5.75 1.3 7.64 3.01l5.85-5.85C34.72 6.847 29.84 5 24 5c-10.45 0-19 8.55-19 19s8.55 19 19 19c10.45 0 18.36-7.55 18.36-18.72 0-1.12-.13-1.92-.35-2.5zm-19.61 14.913c-3.18 0-6.22-1.3-8.4-3.48-2.18-2.18-3.48-5.22-3.48-8.4s1.3-6.22 3.48-8.4c2.18-2.18 5.22-3.48 8.4-3.48s6.22 1.3 8.4 3.48c2.18 2.18 3.48 5.22 3.48 8.4s-1.3 6.22-3.48 8.4c-2.18 2.18-5.22 3.48-8.4 3.48z" />
    <path fill="#FF3D00" d="M5 24c0-2.3 0.46-4.43 1.25-6.38L2.05 14C3.88 10.15 8.65 5 19 5v3c-4.95 0-8.9 2.05-11.77 5.37L5 15.617v8.383z" />
    <path fill="#4CAF50" d="M43.61 20.087H24V28h11.346c-1.66 2.478-4.32 4.18-7.346 4.18-5.7 0-10.32-4.62-10.32-10.32s4.62-10.32 10.32-10.32c3.08 0 5.75 1.3 7.64 3.01l5.85-5.85C34.72 6.847 29.84 5 24 5c-10.45 0-19 8.55-19 19h19V20.087z" />
    <path fill="#1976D2" d="M24 43c-6.87 0-12.72-3.49-16.14-8.75l5.85-5.85c2.47 3.84 6.94 6.5 10.29 6.5s6.82-2.15 9.17-5.34l5.85 5.85C36.72 40.51 30.63 43 24 43z" />
  </svg>
);

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    console.log('Attempting Sign Up with:', { name, email, password });
    // Add logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 font-sans p-4">
      <div className="w-full max-w-md p-10 bg-gray-900 rounded-xl shadow-2xl shadow-black/50 relative">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition duration-200 flex items-center gap-2 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="text-4xl text-violet-600 flex items-center justify-center mb-6 mt-4">
          <UserPlus className="w-8 h-8 mr-2"/>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
        </div>
        <p className="text-center text-gray-400 mb-8">
          Join MangoDeskAI to unlock your potential.
        </p>

        <form onSubmit={handleSignUp}>
          <InputField label="Full Name" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} icon={User} />
          <InputField label="Email Address" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} />
          <InputField label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={Lock} />

          <button type="submit" className="w-full py-3 mt-4 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition duration-200 shadow-md shadow-violet-900/50 flex items-center justify-center">
            <Send className="w-5 h-5 mr-2" />
            Create Account
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <SocialButton icon={GoogleIcon} text="Continue with Google" />

          <p className="text-center mt-8 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 font-semibold hover:text-white transition duration-200">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};


export default function Signup() {
  return (
   <SignUpPage/>
  )
}
