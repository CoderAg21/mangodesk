import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { 
  Moon, Sun, Users, TrendingUp, DollarSign, Building2, 
  Activity, Sparkles, Globe, Clock, Award, Briefcase 
} from 'lucide-react';

// --- ANIMATION VARIANTS & BACKGROUND ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

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

// --- UI COMPONENTS ---

// Animated stat card with glassmorphism
const StatCard = ({ icon: Icon, label, value, subValue, color, darkMode }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, y: -5 }}
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
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </h3>
        <p className={`text-sm mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
        {subValue && (
            <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    {subValue}
                </span>
            </div>
        )}
      </motion.div>
    </div>
  </motion.div>
);

// Chart card with sophisticated animations
const ChartCard = ({ title, children, fullWidth = false, darkMode, icon: Icon }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ y: -4, transition: { duration: 0.3 } }}
    className={`relative flex flex-col overflow-hidden rounded-3xl p-6 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50' 
        : 'bg-white/90 border border-gray-100/50'
    } backdrop-blur-xl shadow-xl ${fullWidth ? 'col-span-full lg:col-span-4' : 'col-span-full sm:col-span-2'}`}
    style={{ minHeight: '400px' }}
  >
     <motion.div
      className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.05), transparent)',
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
            transition={{ type: "spring", delay: 0.2 }}
            className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}
            >
            <Icon className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </motion.div>
        )}
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {title}
        </h3>
        </div>
        <div className="relative flex-1 min-h-[300px] w-full">
        {children}
        </div>
    </div>
  </motion.div>
);

// Enhanced Loading Skeleton (Graph Loading)
const LoadingSkeleton = ({ darkMode }) => (
  <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} flex items-center justify-center`}>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center flex flex-col items-center"
    >
      <div className="relative w-24 h-24 mb-8">
        {/* Spinning Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500"
        />
        {/* Inner Pulsing Circle */}
        <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full bg-indigo-500/20"
        />
        <Activity className="absolute inset-0 m-auto text-indigo-500 w-8 h-8" />
      </div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}
      >
        Analyzing Employee Data...
      </motion.div>
      
      {/* Simulated Graph Loading Animation */}
      <div className="flex items-end gap-1 mt-6 h-12">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2 rounded-t bg-indigo-500"
            animate={{ height: [10, 30, 15, 40, 10] }}
            transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.1,
                repeatType: "reverse" 
            }}
          />
        ))}
      </div>
    </motion.div>
  </div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-4 rounded-xl shadow-2xl border backdrop-blur-md ${
        darkMode 
          ? 'bg-slate-800/95 border-slate-700 text-white' 
          : 'bg-white/95 border-gray-200 text-gray-800'
      }`}>
        <p className="font-semibold mb-2 text-sm opacity-80">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-medium">
              {entry.name}: {
                typeof entry.value === 'number' 
                  ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) 
                  : entry.value
              }
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- MAIN DASHBOARD COMPONENT ---

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
        // Artificial delay to show the nice loading animation
        setTimeout(() => {
             setData(jsonData);
             setLoading(false);
        }, 1500); 
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- COMPLEX LOGIC IMPLEMENTATION (From "Above Code") ---
  const stats = useMemo(() => {
    if (!data.length) return null;

    // 1. Geography Stats
    const countryCount = {};
    data.forEach(e => countryCount[e.country] = (countryCount[e.country] || 0) + 1);
    const countryData = Object.entries(countryCount).map(([name, value]) => ({ name, value }));

    // 2. Department Stats (Headcount & Salary)
    const deptStats = {};
    data.forEach(e => {
      if (!deptStats[e.department]) deptStats[e.department] = { name: e.department, count: 0, totalSalary: 0, performance: 0 };
      deptStats[e.department].count += 1;
      deptStats[e.department].totalSalary += e.salary_usd;
      deptStats[e.department].performance += e.performance_score;
    });
    const deptData = Object.values(deptStats).map(d => ({
      ...d,
      avgSalary: Math.round(d.totalSalary / d.count),
      avgPerformance: parseFloat((d.performance / d.count).toFixed(2))
    }));

    // 3. Work Culture (Remote vs Hours vs Performance)
    const workCultureData = data.slice(0, 100).map(e => ({
      hours: e.work_hours,
      performance: e.performance_score,
      remote: e.remote_percentage,
      salary: e.salary_usd // Used for Z-axis size
    }));

    // 4. Sales Analysis (Deals vs Value)
    const salesData = data
      .filter(e => e.deals_closed > 0)
      .map(e => ({
        name: e.name,
        deals: e.deals_closed,
        value: e.avg_deal_size,
        totalRevenue: e.deals_closed * e.avg_deal_size,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 30); // Top 30 Salespeople

    // 5. Tenure vs Compensation
    const retentionData = data.map(e => ({
      tenure: e.tenure_years,
      comp: e.total_comp,
    })).filter(e => e.tenure > 0).slice(0, 200); // Limit points for performance

    // 6. Global Aggregates
    const totalPayroll = data.reduce((acc, curr) => acc + curr.total_comp, 0);
    const avgTenure = data.reduce((acc, curr) => acc + curr.tenure_years, 0) / data.length;
    const avgRating = data.reduce((acc, curr) => acc + curr.performance_score, 0) / data.length;

    return { countryData, deptData, workCultureData, salesData, retentionData, totalPayroll, avgTenure, avgRating };
  }, [data]);

  // Design Constants
  const colors = {
    primary: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
    success: ['#10b981', '#34d399', '#6ee7b7'],
    warning: ['#f59e0b', '#fbbf24', '#fcd34d'],
    danger: ['#ef4444', '#f87171', '#fca5a5'],
    info: ['#3b82f6', '#60a5fa', '#93c5fd'],
  };
  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  if (loading) return <LoadingSkeleton darkMode={darkMode} />;
  if (!stats) return null;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${
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
                HR Analytics Core
              </h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`mt-2 text-lg ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Deep dive into <span className={`font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{data.length}</span> employee records
              </motion.p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-lg shadow-indigo-500/10' 
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

        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard 
                    icon={Users} 
                    label="Total Headcount" 
                    value={data.length} 
                    color="bg-indigo-500" 
                    darkMode={darkMode} 
                />
                <StatCard 
                    icon={DollarSign} 
                    label="Total Payroll" 
                    value={`$${(stats.totalPayroll / 1000000).toFixed(1)}M`} 
                    color="bg-emerald-500" 
                    darkMode={darkMode} 
                />
                <StatCard 
                    icon={Clock} 
                    label="Avg Tenure" 
                    value={`${stats.avgTenure.toFixed(1)} Yrs`} 
                    color="bg-blue-500" 
                    darkMode={darkMode} 
                />
                <StatCard 
                    icon={Award} 
                    label="Avg Performance" 
                    value={stats.avgRating.toFixed(2)} 
                    subValue="/ 5.0"
                    color="bg-amber-500" 
                    darkMode={darkMode} 
                />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
                {/* 1. Global Distribution */}
                <ChartCard title="Global Distribution" darkMode={darkMode} icon={Globe}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.countryData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fill: textColor, fontSize: 12}} />
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{fill: gridColor}} />
                            <Bar dataKey="value" fill={colors.primary[0]} radius={[0, 4, 4, 0]} animationDuration={1500}>
                                {stats.countryData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors.primary[index % colors.primary.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 2. Department Breakdown */}
                <ChartCard title="Department Size" darkMode={darkMode} icon={Building2}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={stats.deptData} 
                                innerRadius={60} 
                                outerRadius={90} 
                                paddingAngle={5} 
                                dataKey="count"
                                animationDuration={1500}
                            >
                                {stats.deptData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors.info[index % colors.info.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                            <Legend wrapperStyle={{fontSize: '11px', color: textColor}} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 3. Salary by Department */}
                <ChartCard title="Avg Salary by Dept" fullWidth={false} darkMode={darkMode} icon={DollarSign}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.deptData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" tick={{fill: textColor, fontSize: 10}} />
                            <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{fill: textColor, fontSize: 10}} />
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{fill: gridColor}} />
                            <Bar dataKey="avgSalary" fill={colors.danger[1]} radius={[6, 6, 0, 0]} animationDuration={1500} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 4. Remote vs Work Hours vs Perf */}
                <ChartCard title="Productivity Matrix" fullWidth darkMode={darkMode} icon={Activity}>
                    <div className="absolute top-6 right-6 text-xs opacity-50 text-right hidden sm:block">
                        X: Hours Worked | Y: Score | Size: Salary
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis type="number" dataKey="hours" name="Weekly Hours" unit="h" domain={['auto', 'auto']} tick={{fill: textColor}} />
                            <YAxis type="number" dataKey="performance" name="Score" domain={[0, 5]} tick={{fill: textColor}} />
                            <ZAxis type="number" dataKey="salary" range={[50, 400]} name="Salary" />
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{strokeDasharray: '3 3'}} />
                            <Scatter name="Employee" data={stats.workCultureData} fill={colors.warning[0]} fillOpacity={0.7} animationDuration={1500} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 5. Sales Performance */}
                <ChartCard title="Sales: Deals vs Value" fullWidth darkMode={darkMode} icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="deals" name="Deals Closed" tick={{fill: textColor}} />
                            <YAxis dataKey="value" name="Avg Value" tickFormatter={(v) => `$${v/1000}k`} tick={{fill: textColor}} />
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{strokeDasharray: '3 3'}} />
                            <Scatter name="Sales Rep" data={stats.salesData} fill={colors.success[0]} animationDuration={1500} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 6. Tenure vs Compensation */}
                <ChartCard title="Retention Cost (Tenure vs Comp)" fullWidth darkMode={darkMode} icon={Briefcase}>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.retentionData.sort((a,b) => a.tenure - b.tenure)}>
                             <defs>
                                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors.primary[0]} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={colors.primary[0]} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="tenure" tick={{fill: textColor}} unit=" yrs" />
                            <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{fill: textColor}} />
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                            <Area type="monotone" dataKey="comp" stroke={colors.primary[0]} fillOpacity={1} fill="url(#colorComp)" animationDuration={2000} />
                        </AreaChart>
                     </ResponsiveContainer>
                </ChartCard>

                 {/* 7. Performance Radar */}
                 <ChartCard title="Performance by Dept" darkMode={darkMode} icon={Award}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={90} data={stats.deptData}>
                            <PolarGrid stroke={gridColor} />
                            <PolarAngleAxis dataKey="name" tick={{fill: textColor, fontSize: 10}} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} />
                            <Radar name="Avg Score" dataKey="avgPerformance" stroke={colors.success[0]} fill={colors.success[0]} fillOpacity={0.4} animationDuration={1500} />
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartCard>

                 {/* 8. Top Sales Reps Revenue */}
                 <ChartCard title="Top Sales Revenue" darkMode={darkMode} icon={DollarSign}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.salesData.slice(0, 5)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fill: textColor, fontSize: 10}} />
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{fill: gridColor}} />
                            <Bar dataKey="totalRevenue" fill={colors.warning[0]} radius={[0, 4, 4, 0]} animationDuration={1500} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

            </div>
        </motion.div>

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
          <p className="text-sm">Executive HR Analytics Dashboard • Data updated real-time</p>
        </motion.footer>
      </div>
    </div>
  );
}