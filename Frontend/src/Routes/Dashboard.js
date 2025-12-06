// Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, RadialLinearScale, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, Radar, Scatter } from 'react-chartjs-2';

// 1. Register ChartJS components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  ArcElement, RadialLinearScale, Tooltip, Legend, Filler
);

// 2. Reusable Card Component with Animation
const ChartCard = ({ title, children, fullWidth = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      gridColumn: fullWidth ? 'span 4' : 'span 2',
      minHeight: '320px',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <h3 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '1.1rem', fontWeight: '700' }}>{title}</h3>
    <div style={{ position: 'relative', flex: 1, width: '100%', minHeight: '250px' }}>
      {children}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. Fetch Data using native fetch() instead of Axios
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

  // 4. Data Processing (Memoized for performance)
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

    return { genderCount, eduCount, ageBins };
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

    const avgPerf = Object.keys(deptPerf).map(k => deptPerf[k].sum / deptPerf[k].count);
    return { 
      deptLabels: Object.keys(deptCount),
      deptData: Object.values(deptCount),
      avgPerfLabels: Object.keys(deptPerf), 
      avgPerfData: avgPerf, 
      attritionLabels: Object.keys(attritionDept),
      attritionData: Object.values(attritionDept)
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

    return { salaryBins, ctcByDept };
  }, [data]);

  const timelineStats = useMemo(() => {
    if (!data.length) return {};
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
      years, 
      hires: years.map(y => hiring[y]), 
      left: years.map(y => attrition[y] || 0) 
    };
  }, [data]);

  // Sample data for scatter plots to improve rendering performance
  const scatterStats = useMemo(() => {
    return data.slice(0, 300).map(e => ({
      salExp: { x: e.experience_years, y: e.salary_usd },
      salPerf: { x: e.performance_score, y: e.salary_usd }
    }));
  }, [data]);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f8f9fa' }}>
      <h2 style={{color: '#555'}}>Processing Dataset...</h2>
    </div>
  );

  // 5. Render Dashboard
  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ color: '#1a1a1a', fontSize: '2.5rem', fontWeight: '800' }}>Executive HR Dashboard</h1>
          <p style={{ color: '#666' }}>Real-time analytics for {data.length.toLocaleString()} employees</p>
        </header>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px' 
        }}>
          
          {/* --- DEMOGRAPHICS --- */}
          <ChartCard title="Gender Ratio">
            <Pie data={{
              labels: Object.keys(demographics.genderCount),
              datasets: [{ 
                data: Object.values(demographics.genderCount), 
                backgroundColor: ['#3498db', '#e74c3c'],
                borderWidth: 1
              }]
            }} options={{ maintainAspectRatio: false }} />
          </ChartCard>

          <ChartCard title="Age Demographics">
            <Bar data={{
              labels: Object.keys(demographics.ageBins),
              datasets: [{ 
                label: 'Employees', 
                data: Object.values(demographics.ageBins), 
                backgroundColor: '#1abc9c',
                borderRadius: 4
              }]
            }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </ChartCard>

          <ChartCard title="Education Levels">
            <Doughnut data={{
              labels: Object.keys(demographics.eduCount),
              datasets: [{ 
                data: Object.values(demographics.eduCount), 
                backgroundColor: ['#f1c40f', '#e67e22', '#16a085', '#2980b9', '#8e44ad'],
                borderWidth: 0
              }]
            }} options={{ maintainAspectRatio: false }} />
          </ChartCard>

          <ChartCard title="Remote Work %">
             <Bar data={{
              labels: ['0%', '20%', '40%', '60%', '80%', '100%'],
              datasets: [{ 
                label: 'Count', 
                data: [0,20,40,60,80,100].map(p => data.filter(d => d.remote_percentage === p).length),
                backgroundColor: '#9b59b6',
                borderRadius: 4
              }]
            }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </ChartCard>

          {/* --- DEPARTMENT & PERFORMANCE --- */}
          <ChartCard title="Headcount by Dept" fullWidth>
            <Bar options={{ indexAxis: 'y', maintainAspectRatio: false }} data={{
              labels: hrStats.deptLabels,
              datasets: [{ 
                label: 'Headcount', 
                data: hrStats.deptData, 
                backgroundColor: '#34495e',
                borderRadius: 4
              }]
            }} />
          </ChartCard>

          <ChartCard title="Performance (Avg) by Dept">
            <Radar data={{
              labels: hrStats.avgPerfLabels,
              datasets: [{ 
                label: 'Score (1-5)', 
                data: hrStats.avgPerfData, 
                borderColor: '#e74c3c', 
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                pointBackgroundColor: '#e74c3c'
              }]
            }} options={{ maintainAspectRatio: false }} />
          </ChartCard>

          <ChartCard title="Attrition by Dept">
            <Bar data={{
              labels: hrStats.attritionLabels,
              datasets: [{ 
                label: 'Exits', 
                data: hrStats.attritionData, 
                backgroundColor: '#c0392b',
                borderRadius: 4
              }]
            }} options={{ maintainAspectRatio: false }} />
          </ChartCard>

          {/* --- FINANCE --- */}
          <ChartCard title="Salary Ranges">
            <Bar data={{
              labels: Object.keys(financeStats.salaryBins),
              datasets: [{ 
                label: 'Count', 
                data: Object.values(financeStats.salaryBins), 
                backgroundColor: '#f39c12',
                borderRadius: 4
              }]
            }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </ChartCard>

          <ChartCard title="Total CTC Cost by Dept">
            <Bar data={{
              labels: Object.keys(financeStats.ctcByDept),
              datasets: [{ 
                label: 'Cost ($)', 
                data: Object.values(financeStats.ctcByDept), 
                backgroundColor: '#27ae60',
                borderRadius: 4
              }]
            }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </ChartCard>

          {/* --- TIMELINE --- */}
          <ChartCard title="Company Growth vs Attrition" fullWidth>
            <Line data={{
              labels: timelineStats.years,
              datasets: [
                { 
                  label: 'Hiring', 
                  data: timelineStats.hires, 
                  borderColor: '#2ecc71', 
                  backgroundColor: 'rgba(46, 204, 113, 0.1)',
                  fill: true,
                  tension: 0.4 
                },
                { 
                  label: 'Attrition', 
                  data: timelineStats.left, 
                  borderColor: '#e74c3c', 
                  borderDash: [5, 5],
                  tension: 0.4 
                }
              ]
            }} options={{ maintainAspectRatio: false }} />
          </ChartCard>

          {/* --- SCATTER PLOTS --- */}
          <ChartCard title="Salary vs Experience">
            <Scatter options={{ 
              maintainAspectRatio: false,
              scales: { x: { title: { display: true, text: 'Years Experience' } } } 
            }} data={{
              datasets: [{ 
                label: 'Employee', 
                data: scatterStats.map(s => s.salExp), 
                backgroundColor: 'rgba(52, 152, 219, 0.6)' 
              }]
            }} />
          </ChartCard>

          <ChartCard title="Salary vs Performance">
            <Scatter options={{ 
              maintainAspectRatio: false,
              scales: { x: { title: { display: true, text: 'Performance Score' } } } 
            }} data={{
              datasets: [{ 
                label: 'Employee', 
                data: scatterStats.map(s => s.salPerf), 
                backgroundColor: 'rgba(230, 126, 34, 0.6)' 
              }]
            }} />
          </ChartCard>

          <ChartCard title="Promotion Distribution">
             <Bar data={{
              labels: ['0', '1', '2', '3', '4+'],
              datasets: [{ 
                label: 'Promotions Received', 
                data: [0,1,2,3,4].map(c => data.filter(d => d.promotion_count >= c && (c===4 ? true : d.promotion_count === c)).length),
                backgroundColor: '#8e44ad',
                borderRadius: 4
              }]
            }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </ChartCard>

        </div>
      </div>
    </div>
  );
}