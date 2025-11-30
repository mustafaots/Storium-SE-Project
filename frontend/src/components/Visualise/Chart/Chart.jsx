import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Chart.module.css';

function Chart() {
  // Sample data - replace with actual database data
  const data = [
    { date: 'Jan 1', stockLevel: 1200 },
    { date: 'Jan 8', stockLevel: 1800 },
    { date: 'Jan 15', stockLevel: 1400 },
    { date: 'Jan 22', stockLevel: 2200 },
    { date: 'Jan 29', stockLevel: 1800 },
    { date: 'Feb 5', stockLevel: 2400 },
  ];

  return (
    <div className={styles.chartContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Stock Levels Over Time</h3>
        <div className={styles.headerInfo}>
          <p className={styles.value}>2.4M Units</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404246" />
          <XAxis dataKey="date" stroke="#b9bbbe" />
          <YAxis stroke="#b9bbbe" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#2f3136', border: '1px solid #ffbb00' }}
            labelStyle={{ color: '#f0f0f0' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="stockLevel" 
            stroke="#ffbb00" 
            strokeWidth={3}
            dot={{ fill: '#ffbb00' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Chart;