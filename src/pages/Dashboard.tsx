import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronDown, ArrowRight, ChevronUp } from "lucide-react";
import ActivityChart from "@/components/ActivityChart";
import { DiamondIcon, BaseGuildIcon, RoundsGrantIcon, VerificationIcon, BaseLearningIcon, SunIcon } from "@/components/icons";
import { useState, useEffect } from "react";
import CustomConnectWallet from "@/components/CustomConnectWallet";

const Dashboard = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navbar */}
      <div className="bg-black border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="relative">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
              </svg>
            </div>
            <span className="font-bold text-lg">score.sui</span>
          </div>
          {showDropdown && userEmail && (
            <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700">{userEmail}</a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-1">
      <aside className="w-64 p-4 bg-black">
        <div className="p-4">
          {/* Sidebar content will go here */}
        </div>
      </aside>
      <main className="flex-1 p-8 max-w-4xl bg-black">
        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-medium">Activity</h2>
          </div>
          
          <Card className="border rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-gray-500 uppercase">ONCHAIN SCORE</p>
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs">?</span>
                  </div>
                  <p className="text-3xl font-bold">54/100</p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>Less</span>
                  <div className="flex gap-0.5">
                    <span className="inline-block w-4 h-4 bg-blue-200"></span>
                    <span className="inline-block w-4 h-4 bg-blue-400"></span>
                    <span className="inline-block w-4 h-4 bg-blue-600"></span>
                  </div>
                  <span>More</span>
                </div>
              </div>
              
              <ActivityChart />
              
              <div className="flex justify-center mt-4">
                <Button 
                  variant="ghost" 
                  className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? (
                    <>
                      <span>Hide details</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>View details</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </Button>
              </div>
              
              {showDetails && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Activity details will be shown here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 mt-8 mb-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-medium">Builder activity</h2>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 relative">
              <DiamondIcon />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
            </div>
            <p className="text-sm font-medium">Builder Score</p>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <h2 className="text-lg font-medium">Explore ways to build your profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-500 text-white overflow-hidden border-0">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold mb-6 tracking-tight">ONCHAIN SUMMER</div>
                  <Button variant="link" className="text-white p-0 h-auto flex items-center text-sm">
                    Add project to Onchain Registry <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-24 h-24 mb-6">
                    <BaseGuildIcon />
                  </div>
                  <Button variant="link" className="p-0 h-auto flex items-center text-sm">
                    Get roles on Sui Guild <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-yellow-400 border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-24 h-24 mb-6">
                    <RoundsGrantIcon />
                  </div>
                  <Button variant="link" className="p-0 h-auto flex items-center text-sm">
                    Get a Rounds Grant <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-24 h-24 mb-6">
                    <VerificationIcon />
                  </div>
                  <Button variant="link" className="p-0 h-auto flex items-center text-sm">
                    Get a Verification <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-blue-500 text-white overflow-hidden border-0">
                <CardContent className="p-6">
                  <div className="w-24 h-24 mb-6">
                    <BaseLearningIcon />
                  </div>
                  <Button variant="link" className="text-white p-0 h-auto flex items-center text-sm">
                    Go to Sui Learn <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 flex justify-center">
              <CustomConnectWallet />
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default Dashboard;
