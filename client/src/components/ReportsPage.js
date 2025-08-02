// File: src/components/ReportsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../auth/authService';
import './ReportsPage.css';

const ReportsPage = () => {
    // State for the date picker
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    // State for the stall selector
    const [stalls, setStalls] = useState([]);
    const [selectedStall, setSelectedStall] = useState('');
    
    // State to hold the data for EACH report type
    const [dailyReport, setDailyReport] = useState(null);
    const [weeklyReport, setWeeklyReport] = useState(null);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [breakevenReport, setBreakevenReport] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch all stalls when the component loads, to populate the dropdown
    useEffect(() => {
        const fetchStalls = async () => {
            try {
                const token = getToken();
                const response = await axios.get('http://localhost:5000/api/v1/stalls', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStalls(response.data.data.stalls);
                if (response.data.data.stalls.length > 0) {
                    setSelectedStall(response.data.data.stalls[0].stall_id);
                }
            } catch (err) {
                setError('Failed to fetch stalls for analysis.');
            }
        };
        fetchStalls();
    }, []);

    const getSalesReport = async (reportType) => {
        setLoading(true); setError(''); 
        setDailyReport(null); setWeeklyReport(null); setMonthlyReport(null); setBreakevenReport(null);

        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:5000/api/v1/reports/${reportType}-sales`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { date: selectedDate }
            });

            if (reportType === 'daily') setDailyReport(response.data.data.report);
            if (reportType === 'weekly') setWeeklyReport(response.data.data.report);
            if (reportType === 'monthly') setMonthlyReport(response.data.data.report);

        } catch (err) {
            setError(`Failed to fetch ${reportType} report.`);
        } finally {
            setLoading(false);
        }
    };

    const getBreakevenReport = async () => {
        if (!selectedStall) { setError("Please select a stall."); return; }
        setLoading(true); setError('');
        setDailyReport(null); setWeeklyReport(null); setMonthlyReport(null); setBreakevenReport(null);

        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:5000/api/v1/reports/breakeven/${selectedStall}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBreakevenReport(response.data.data.analysis);
        } catch (err) {
            setError(`Failed to fetch breakeven report.`);
        } finally {
            setLoading(false);
        }
    };

    // --- Helper Component for Displaying Cards ---
    const ReportCard = ({ title, data, isBreakeven = false }) => (
        <div className="report-display">
            <h2>{title}</h2>
            {!isBreakeven ? (
                 <div className="report-cards">
                    <div className="report-card"><h4>Total Revenue</h4><span>${data.totalRevenue}</span></div>
                    <div className="report-card"><h4>Number of Orders</h4><span>{data.numberOfOrders}</span></div>
                    <div className="report-card"><h4>Avg. Order Value</h4><span>${data.averageOrderValue}</span></div>
                </div>
            ) : (
                <div className="report-cards breakeven">
                    <div className="report-card"><h4>Monthly Fixed Costs</h4><span>${data.fixedCosts}</span></div>
                    <div className="report-card"><h4>Avg. Sale Per Item</h4><span>${data.avgRevenue}</span></div>
                    <div className="report-card"><h4>Avg. Cost Per Item</h4><span>${data.avgCost}</span></div>
                    <div className="report-card emphasis"><h4>Units to Break Even</h4><span>{data.breakevenUnits}</span></div>
                    <div className="report-card emphasis"><h4>Revenue to Break Even</h4><span>${data.breakevenRevenue}</span></div>
                </div>
            )}
        </div>
    );

    // --- Main JSX Render ---
    return (
        <div className="reports-container">
            <h1>Business Analytics</h1>
            
            <div className="report-section">
                <h2>Sales Reports</h2>
                <div className="report-controls">
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    <button onClick={() => getSalesReport('daily')} disabled={loading}>Daily</button>
                    <button onClick={() => getSalesReport('weekly')} disabled={loading}>Weekly</button>
                    <button onClick={() => getSalesReport('monthly')} disabled={loading}>Monthly</button>
                </div>
                {dailyReport && <ReportCard title={`Report for: ${dailyReport.date}`} data={dailyReport} />}
                {weeklyReport && <ReportCard title={`Report for week: ${weeklyReport.startDate} to ${weeklyReport.endDate}`} data={weeklyReport} />}
                {monthlyReport && <ReportCard title={`Report for month: ${monthlyReport.startDate} to ${monthlyReport.endDate}`} data={monthlyReport} />}
            </div>

            <hr />

            <div className="report-section">
                <h2>Breakeven Analysis</h2>
                <div className="report-controls">
                    <select value={selectedStall} onChange={e => setSelectedStall(e.target.value)}>
                        <option value="">-- Select a Stall --</option>
                        {stalls.map(stall => <option key={stall.stall_id} value={stall.stall_id}>{stall.name}</option>)}
                    </select>
                    <button onClick={getBreakevenReport} disabled={!selectedStall || loading}>Analyze Breakeven</button>
                </div>
                {breakevenReport && <ReportCard title="Breakeven Analysis Results" data={breakevenReport} isBreakeven={true} />}
            </div>

            {loading && <p>Loading report...</p>}
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default ReportsPage;