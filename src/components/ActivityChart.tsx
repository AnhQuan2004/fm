import React from "react";

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const ActivityChart = () => {
  // Sample data - one activity in June
  const activityData = months.map(month => ({
    month,
    activity: month === "Jun" ? 1 : 0
  }));

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {months.map((month, index) => (
          <div key={index} className="text-xs text-gray-500 flex-1 text-center">
            {month}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-1 h-24">
        {activityData.map((data, index) => (
          <div key={index} className="flex flex-col justify-end h-full">
            <div 
              className={`w-full ${data.activity > 0 ? 'bg-blue-400' : 'bg-gray-200'} rounded-sm`}
              style={{ 
                height: data.activity > 0 ? '30%' : '10%',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityChart;
