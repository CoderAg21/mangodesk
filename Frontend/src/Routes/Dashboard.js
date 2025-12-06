import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { Moon, Sun, Users, TrendingUp, DollarSign, Building2, Activity, Sparkles } from 'lucide-react';

// Floating particles background
const FloatingParticles = ({ darkMode }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-300/20'}`}
        style={{
          width: Math.random() * 100 + 50,
          height: Math.random() * 100 + 50,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          x: [0, Math.random() * 100 - 50, 0],
          y: [0, Math.random() * 100 - 50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Animated stat card
const StatCard = ({ icon: Icon, label, value, color, delay, darkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className={`relative overflow-hidden rounded-2xl p-6 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
        : 'bg-white/80 border border-gray-100'
    } backdrop-blur-xl shadow-2xl`}
  >
    <motion.div
      className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${color} opacity-20 blur-2xl`}
      animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    <div className="relative z-10">
      <div className={`inline-flex p-3 rounded-xl ${color} bg-opacity-20 mb-4`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <motion.p 
        className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
      >
        {value}
      </motion.p>
      <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
    </div>
  </motion.div>
);

// Chart card with animations
const ChartCard = ({ title, children, fullWidth = false, delay = 0, darkMode, icon: Icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, delay, type: "spring", stiffness: 80 }}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className={`relative overflow-hidden rounded-3xl p-6 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50' 
        : 'bg-white/90 border border-gray-100/50'
    } backdrop-blur-xl shadow-2xl ${fullWidth ? 'col-span-full lg:col-span-4' : 'col-span-full sm:col-span-2'}`}
    style={{ minHeight: '360px' }}
  >
    <motion.div
      className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
        backgroundSize: '200% 100%',
      }}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
    
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
            className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}
          >
            <Icon className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </motion.div>
        )}
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h3>
      </div>
      <div className="relative flex-1 min-h-[250px]">
        {children}
      </div>
    </div>
  </motion.div>
);

// Loading skeleton
const LoadingSkeleton = ({ darkMode }) => (
  <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} flex items-center justify-center`}>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}
      >
        Processing Dataset...
      </motion.div>
      <motion.div className="flex justify-center gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-indigo-500"
          />
        ))}
      </motion.div>
    </motion.div>
  </div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-xl shadow-xl border ${
        darkMode 
          ? 'bg-slate-800 border-slate-700 text-white' 
          : 'bg-white border-gray-200 text-gray-800'
      }`}>
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (!response.ok) throw new Error('Network response was not ok');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Color palettes
  const colors = {
    primary: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
    success: ['#10b981', '#34d399', '#6ee7b7'],
    warning: ['#f59e0b', '#fbbf24', '#fcd34d'],
    danger: ['#ef4444', '#f87171', '#fca5a5'],
    info: ['#3b82f6', '#60a5fa', '#93c5fd'],
    gradient: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'],
  };

  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  const demographics = useMemo(() => {
    if (!data.length) return {};
    const genderCount = { Male: 0, Female: 0 };
    const eduCount = {};
    const ageBins = { '20-30': 0, '30-40': 0, '40-50': 0, '50+': 0 };
    
    data.forEach(e => {
      if (genderCount[e.gender] !== undefined) genderCount[e.gender]++;
      eduCount[e.education] = (eduCount[e.education] || 0) + 1;
      if (e.age < 30) ageBins['20-30']++;
      else if (e.age < 40) ageBins['30-40']++;
      else if (e.age < 50) ageBins['40-50']++;
      else ageBins['50+']++;
    });

    return { 
      genderData: Object.entries(genderCount).map(([name, value]) => ({ name, value })),
      eduData: Object.entries(eduCount).map(([name, value]) => ({ name, value })),
      ageData: Object.entries(ageBins).map(([name, value]) => ({ name, value }))
    };
  }, [data]);

  const hrStats = useMemo(() => {
    if (!data.length) return {};
    const deptCount = {};
    const deptPerf = {};
    const attritionDept = {};
    
    data.forEach(e => {
      deptCount[e.department] = (deptCount[e.department] || 0) + 1;
      if (!deptPerf[e.department]) deptPerf[e.department] = { sum: 0, count: 0 };
      deptPerf[e.department].sum += e.performance_score;
      deptPerf[e.department].count++;
      if (e.termination_date) {
        attritionDept[e.department] = (attritionDept[e.department] || 0) + 1;
      }
    });

    return { 
      deptData: Object.entries(deptCount).map(([name, value]) => ({ name, value })),
      perfData: Object.entries(deptPerf).map(([name, { sum, count }]) => ({ 
        name, 
        value: Math.round((sum / count) * 100) / 100,
        fullMark: 5
      })),
      attritionData: Object.entries(attritionDept).map(([name, value]) => ({ name, value }))
    };
  }, [data]);

  const financeStats = useMemo(() => {
    if (!data.length) return {};
    const salaryBins = { '<50k': 0, '50k-100k': 0, '100k-150k': 0, '150k+': 0 };
    const ctcByDept = {};

    data.forEach(e => {
      if (e.salary_usd < 50000) salaryBins['<50k']++;
      else if (e.salary_usd < 100000) salaryBins['50k-100k']++;
      else if (e.salary_usd < 150000) salaryBins['100k-150k']++;
      else salaryBins['150k+']++;
      const ctc = e.salary_usd + e.bonus_usd;
      ctcByDept[e.department] = (ctcByDept[e.department] || 0) + ctc;
    });

    return { 
      salaryData: Object.entries(salaryBins).map(([name, value]) => ({ name, value })),
      ctcData: Object.entries(ctcByDept).map(([name, value]) => ({ name, value }))
    };
  }, [data]);

  const timelineStats = useMemo(() => {
    if (!data.length) return { data: [] };
    const hiring = {};
    const attrition = {};

    data.forEach(e => {
      const hYear = e.hire_date ? e.hire_date.substring(0, 4) : 'Unknown';
      hiring[hYear] = (hiring[hYear] || 0) + 1;
      if (e.termination_date) {
        const tYear = e.termination_date.substring(0, 4);
        attrition[tYear] = (attrition[tYear] || 0) + 1;
      }
    });

    const years = Object.keys(hiring).sort();
    return { 
      data: years.map(year => ({
        name: year,
        hires: hiring[year],
        attrition: attrition[year] || 0
      }))
    };
  }, [data]);

  const remoteStats = useMemo(() => {
    if (!data.length) return [];
    return [0, 20, 40, 60, 80, 100].map(p => ({
      name: `${p}%`,
      value: data.filter(d => d.remote_percentage === p).length
    }));
  }, [data]);

  const scatterStats = useMemo(() => {
    return data.slice(0, 300).map(e => ({
      experience: e.experience_years,
      salary: e.salary_usd,
      performance: e.performance_score
    }));
  }, [data]);

  const promotionStats = useMemo(() => {
    if (!data.length) return [];
    return ['0', '1', '2', '3', '4+'].map((label, c) => ({
      name: label,
      value: data.filter(d => c === 4 ? d.promotion_count >= 4 : d.promotion_count === c).length
    }));
  }, [data]);

  const avgPerformance = useMemo(() => {
    if (!hrStats.perfData?.length) return 0;
    return (hrStats.perfData.reduce((a, b) => a + b.value, 0) / hrStats.perfData.length).toFixed(1);
  }, [hrStats]);

  const totalCTC = useMemo(() => {
    if (!financeStats.ctcData?.length) return 0;
    return financeStats.ctcData.reduce((a, b) => a + b.value, 0);
  }, [financeStats]);

  if (loading) return <LoadingSkeleton darkMode={darkMode} />;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-indigo-50'
    }`}>
      <FloatingParticles darkMode={darkMode} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-10 lg:mb-16"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-2"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}
                >
                  <Sparkles className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </motion.div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  darkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  Live Analytics
                </span>
              </motion.div>
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Executive HR Dashboard
              </h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`mt-2 text-lg ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Real-time analytics for{' '}
                <motion.span 
                  className={`font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  {data.length.toLocaleString()}
                </motion.span>
                {' '}employees
              </motion.p>
            </div>
            
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                  : 'bg-white text-slate-700 hover:bg-gray-100 shadow-lg'
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={darkMode ? 'moon' : 'sun'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10 lg:mb-16">
          <StatCard icon={Users} label="Total Employees" value={data.length.toLocaleString()} color="bg-indigo-500" delay={0} darkMode={darkMode} />
          <StatCard icon={Building2} label="Departments" value={hrStats.deptData?.length || 0} color="bg-emerald-500" delay={0.1} darkMode={darkMode} />
          <StatCard icon={TrendingUp} label="Avg Performance" value={avgPerformance} color="bg-amber-500" delay={0.2} darkMode={darkMode} />
          <StatCard icon={DollarSign} label="Total CTC" value={`$${(totalCTC / 1000000).toFixed(1)}M`} color="bg-rose-500" delay={0.3} darkMode={darkMode} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Gender Ratio */}
          <ChartCard title="Gender Ratio" delay={0} darkMode={darkMode} icon={Users}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographics.genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {demographics.genderData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[colors.info[0], colors.danger[0]][index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Legend wrapperStyle={{ color: textColor }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Age Demographics */}
          <ChartCard title="Age Demographics" delay={0.1} darkMode={darkMode} icon={Users}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics.ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor }} />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Bar dataKey="value" fill={colors.success[0]} radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Education Levels */}
          <ChartCard title="Education Levels" delay={0.2} darkMode={darkMode} icon={Activity}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographics.eduData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {demographics.eduData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors.gradient[index % colors.gradient.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Legend wrapperStyle={{ color: textColor }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Remote Work */}
          <ChartCard title="Remote Work %" delay={0.3} darkMode={darkMode} icon={Building2}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={remoteStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor }} />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Bar dataKey="value" fill={colors.primary[1]} radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Headcount by Dept */}
          <ChartCard title="Headcount by Department" fullWidth delay={0.4} darkMode={darkMode} icon={Building2}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hrStats.deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" tick={{ fill: textColor }} />
                <YAxis dataKey="name" type="category" tick={{ fill: textColor }} width={120} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Bar dataKey="value" fill={colors.primary[0]} radius={[0, 8, 8, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Performance by Dept */}
          <ChartCard title="Performance by Dept" delay={0.5} darkMode={darkMode} icon={TrendingUp}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={hrStats.perfData}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="name" tick={{ fill: textColor, fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: textColor }} domain={[0, 5]} />
                <Radar name="Score" dataKey="value" stroke={colors.danger[0]} fill={colors.danger[0]} fillOpacity={0.3} animationDuration={1500} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Attrition by Dept */}
          <ChartCard title="Attrition by Dept" delay={0.6} darkMode={darkMode} icon={Users}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hrStats.attritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Bar dataKey="value" fill={colors.danger[0]} radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Salary Ranges */}
          <ChartCard title="Salary Ranges" delay={0.7} darkMode={darkMode} icon={DollarSign}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeStats.salaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor }} />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Bar dataKey="value" fill={colors.warning[0]} radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* CTC by Dept */}
          <ChartCard title="Total CTC by Dept" delay={0.8} darkMode={darkMode} icon={DollarSign}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeStats.ctcData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: textColor }} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Bar dataKey="value" fill={colors.success[0]} radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Growth vs Attrition */}
          <ChartCard title="Company Growth vs Attrition" fullWidth delay={0.9} darkMode={darkMode} icon={TrendingUp}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineStats.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor }} />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Legend wrapperStyle={{ color: textColor }} />
                <Area type="monotone" dataKey="hires" name="Hiring" stroke={colors.success[0]} fill={colors.success[0]} fillOpacity={0.2} strokeWidth={2} animationDuration={1500} />
                <Line type="monotone" dataKey="attrition" name="Attrition" stroke={colors.danger[0]} strokeDasharray="8 4" strokeWidth={2} dot={{ fill: colors.danger[0] }} animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Salary vs Experience */}
          <ChartCard title="Salary vs Experience" delay={1} darkMode={darkMode} icon={Activity}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="experience" name="Years" tick={{ fill: textColor }} label={{ value: 'Years Experience', position: 'bottom', fill: textColor }} />
                <YAxis dataKey="salary" name="Salary" tick={{ fill: textColor }} tickFormatter={(v) => `$${(v/1000)}k`} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Employees" data={scatterStats} fill={colors.info[0]} fillOpacity={0.6} animationDuration={1500} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Salary vs Performance */}
          <ChartCard title="Salary vs Performance" delay={1.1} darkMode={darkMode} icon={Activity}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="performance" name="Score" tick={{ fill: textColor }} label={{ value: 'Performance Score', position: 'bottom', fill: textColor }} />
                <YAxis dataKey="salary" name="Salary" tick={{ fill: textColor }} tickFormatter={(v) => `$${(v/1000)}k`} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Employees" data={scatterStats} fill={colors.warning[0]} fillOpacity={0.6} animationDuration={1500} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Promotion Distribution */}
          <ChartCard title="Promotion Distribution" delay={1.2} darkMode={darkMode} icon={TrendingUp}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={promotionStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor }} />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Bar dataKey="value" fill={colors.primary[2]} radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className={`mt-16 text-center py-8 border-t ${
            darkMode ? 'border-slate-800 text-slate-500' : 'border-gray-200 text-gray-400'
          }`}
        >
          <p className="text-sm">Executive HR Dashboard • Real-time analytics</p>
        </motion.footer>
      </div>
    </div>
  );
}