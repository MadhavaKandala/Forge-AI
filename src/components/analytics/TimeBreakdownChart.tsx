import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryTimeData } from '../../services/analyticsService';

interface TimeBreakdownChartProps {
    data: CategoryTimeData[];
}

const COLORS = {
    coding: '#0088FE',
    gym: '#00C49F',
    diet: '#FFBB28',
    personal: '#FF8042',
    work: '#A259FF',
    other: '#8884d8'
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 p-2 rounded border border-white/10 text-xs">
                <p className="font-bold capitalize">{payload[0].name}</p>
                <p>{payload[0].value} mins</p>
            </div>
        );
    }
    return null;
};

export const TimeBreakdownChart: React.FC<TimeBreakdownChartProps> = ({ data }) => {
    if (data.length === 0) {
        return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data for this period</div>;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="totalMinutes"
                        nameKey="category"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.category] || COLORS.other} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
