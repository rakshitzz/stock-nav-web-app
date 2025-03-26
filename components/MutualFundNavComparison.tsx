"use client";

import { useState, useEffect } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle, Loader2, Plus, RefreshCw, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartContainer } from "@/components/ui/chart";
import { fetchMutualFundData } from "@/lib/mutual-fund-actions";

// Chart colors
const chartColors = [
	"hsl(210, 80%, 50%)", // Blue
	"hsl(120, 60%, 50%)", // Green
	"hsl(349, 70%, 56%)", // Red
	"hsl(39, 100%, 50%)", // Orange
	"hsl(280, 70%, 60%)", // Purple
	"hsl(160, 60%, 50%)", // Teal
	"hsl(30, 90%, 50%)", // Coral
	"hsl(195, 80%, 50%)", // Cyan
	"hsl(270, 70%, 60%)", // Indigo
	"hsl(50, 100%, 50%)", // Yellow
];

// Time period options
const timePeriods = [
	{ value: "1M", label: "1 Month" },
	{ value: "3M", label: "3 Months" },
	{ value: "6M", label: "6 Months" },
	{ value: "YTD", label: "Year to Date" },
	{ value: "1Y", label: "1 Year" },
	{ value: "3Y", label: "3 Years" },
	{ value: "5Y", label: "5 Years" },
	{ value: "MAX", label: "Max" },
];

// Sample mutual fund codes to get started
const sampleFundCodes = [
	"153330", // Angel One Nifty Total Market Index Fund
	"120503", // SBI Nifty Index Fund
	"118989", // HDFC Index Fund-NIFTY 50 Plan
	"120716", // UTI Nifty Index Fund
	"125497", // Nippon India Index Fund - Nifty Plan
	"148617", // Motilal Oswal Nifty 500 Index Fund
	"147020", // ICICI Prudential Nifty Index Fund
	"125354", // Tata Index Fund Nifty Plan
	"118560", // Franklin India Index Fund - NSE Nifty Plan
	"119598", // Aditya Birla Sun Life Index Fund
];

// Filter data based on selected time period
const filterDataByPeriod = (data, period) => {
	if (!data || data.length === 0) return [];

	const today = new Date();
	let startDate = new Date(today);

	switch (period) {
		case "1M":
			startDate.setMonth(today.getMonth() - 1);
			break;
		case "3M":
			startDate.setMonth(today.getMonth() - 3);
			break;
		case "6M":
			startDate.setMonth(today.getMonth() - 6);
			break;
		case "YTD":
			startDate = new Date(today.getFullYear(), 0, 1);
			break;
		case "1Y":
			startDate.setFullYear(today.getFullYear() - 1);
			break;
		case "3Y":
			startDate.setFullYear(today.getFullYear() - 3);
			break;
		case "5Y":
			startDate.setFullYear(today.getFullYear() - 5);
			break;
		case "MAX":
			return data;
		default:
			startDate.setMonth(today.getMonth() - 1);
	}

	return data.filter((item) => {
		const itemDate = new Date(item.date.split("-").reverse().join("-"));
		return itemDate >= startDate;
	});
};

// Calculate performance metrics
const calculatePerformance = (data, fundId) => {
	if (!data || data.length < 2) return { change: 0, percentChange: 0, currentNav: 0 };

	const earliest = Number.parseFloat(data[0].nav);
	const latest = Number.parseFloat(data[data.length - 1].nav);

	const change = latest - earliest;
	const percentChange = (latest / earliest - 1) * 100;

	return {
		change: Number.parseFloat(change.toFixed(2)),
		percentChange: Number.parseFloat(percentChange.toFixed(2)),
		currentNav: latest,
	};
};

// Format date from DD-MM-YYYY to YYYY-MM-DD for sorting
const formatDateForSorting = (dateString) => {
	const [day, month, year] = dateString.split("-");
	return `${year}-${month}-${day}`;
};

// Merge data from multiple funds into a single dataset for the chart
const mergeDataForChart = (fundsData) => {
	if (!fundsData || Object.keys(fundsData).length === 0) return [];

	// Create a map of all dates across all funds
	const dateMap = new Map();

	Object.entries(fundsData).forEach(([fundId, fundData]) => {
		if (!fundData || !fundData.data) return;

		fundData.data.forEach((item) => {
			const formattedDate = formatDateForSorting(item.date);
			if (!dateMap.has(formattedDate)) {
				dateMap.set(formattedDate, { date: formattedDate });
			}

			const entry = dateMap.get(formattedDate);
			entry[`fund${fundId}`] = Number.parseFloat(item.nav);
		});
	});

	// Convert map to array and sort by date from earliest to latest
	return Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
};

export default function MutualFundNavComparison() {
	const [fundCodes, setFundCodes] = useState([]);
	const [newFundCode, setNewFundCode] = useState("");
	const [fundsData, setFundsData] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [timePeriod, setTimePeriod] = useState("1Y");
	const [viewMode, setViewMode] = useState("combined");
	const [showAddFund, setShowAddFund] = useState(false);

	// Load sample funds on initial render
	useEffect(() => {
		if (fundCodes.length === 0) {
			// Start with 3 sample funds
			const initialFunds = sampleFundCodes.slice(0, 3);
			setFundCodes(initialFunds);

			// Fetch data for initial funds
			initialFunds.forEach(fetchFundData);
		}
	}, []);

	// Fetch data for a specific fund
	const fetchFundData = async (fundCode) => {
		setLoading(true);
		setError("");

		try {
			const data = await fetchMutualFundData(fundCode);

			if (data.status === "SUCCESS") {
				setFundsData((prev) => ({
					...prev,
					[fundCode]: data,
				}));
			} else {
				setError(`Failed to fetch data for fund code ${fundCode}`);
			}
		} catch (err) {
			setError(`Error fetching data: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	// Add a new fund
	const addFund = () => {
		if (!newFundCode) return;

		if (fundCodes.includes(newFundCode)) {
			setError("This fund is already in your comparison");
			return;
		}

		if (fundCodes.length >= 10) {
			setError("You can compare a maximum of 10 funds at once");
			return;
		}

		setFundCodes((prev) => [...prev, newFundCode]);
		fetchFundData(newFundCode);
		setNewFundCode("");
		setShowAddFund(false);
	};

	// Remove a fund
	const removeFund = (fundCode) => {
		setFundCodes((prev) => prev.filter((code) => code !== fundCode));

		// Remove from fundsData
		setFundsData((prev) => {
			const newData = { ...prev };
			delete newData[fundCode];
			return newData;
		});
	};

	// Refresh all fund data
	const refreshAllData = () => {
		fundCodes.forEach(fetchFundData);
	};

	// Prepare chart data
	const mergedData = mergeDataForChart(fundsData);
	const filteredData = filterDataByPeriod(mergedData, timePeriod);

	// Create chart config for ChartContainer
	const chartConfig = fundCodes.reduce((config, fundCode, index) => {
		const fund = fundsData[fundCode];
		if (fund) {
			config[`fund${fundCode}`] = {
				label: fund.meta?.scheme_name?.split(" ").slice(0, 3).join(" ") || `Fund ${fundCode}`,
				color: chartColors[index % chartColors.length],
			};
		}
		return config;
	}, {});

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<header className="sticky top-0 z-10 w-full border-b bg-background">
				<div className="container flex h-16 items-center px-4 sm:px-6">
					<h1 className="text-lg font-semibold">Mutual Fund NAV Comparison</h1>
					<div className="ml-auto flex items-center space-x-2">
						<Popover
							open={showAddFund}
							onOpenChange={setShowAddFund}
						>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="sm"
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Fund
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80">
								<div className="grid gap-4">
									<div className="space-y-2">
										<h4 className="font-medium leading-none">Add Mutual Fund</h4>
										<p className="text-sm text-muted-foreground">
											Enter the scheme code of the mutual fund you want to add
										</p>
									</div>
									<div className="grid gap-2">
										<Input
											id="fundCode"
											placeholder="e.g. 153330"
											value={newFundCode}
											onChange={(e) => setNewFundCode(e.target.value)}
										/>
										<Button onClick={addFund}>Add to Comparison</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
						<Button
							variant="outline"
							size="icon"
							onClick={refreshAllData}
							disabled={loading}
						>
							{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
							<span className="sr-only">Refresh</span>
						</Button>
					</div>
				</div>
			</header>

			<main className="flex-1 container py-6 px-4 sm:px-6">
				{error && (
					<Alert
						variant="destructive"
						className="mb-6"
					>
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="grid gap-6">
					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
						<div className="flex flex-wrap gap-2">
							<Select
								value={timePeriod}
								onValueChange={setTimePeriod}
							>
								<SelectTrigger className="w-[120px]">
									<SelectValue placeholder="Time Period" />
								</SelectTrigger>
								<SelectContent>
									{timePeriods.map((period) => (
										<SelectItem
											key={period.value}
											value={period.value}
										>
											{period.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Tabs
								value={viewMode}
								onValueChange={setViewMode}
								className="w-auto"
							>
								<TabsList className="grid w-[200px] grid-cols-2">
									<TabsTrigger value="combined">Combined</TabsTrigger>
									<TabsTrigger value="individual">Individual</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						<div className="flex flex-wrap gap-2">
							{fundCodes.map((fundCode, index) => {
								const fund = fundsData[fundCode];
								if (!fund) return null;

								const fundData = filterDataByPeriod(fund.data, timePeriod);
								const performance = calculatePerformance(fundData, fundCode);

								return (
									<Badge
										key={fundCode}
										variant="outline"
										className="flex items-center gap-2 py-1.5 px-3"
										style={{ borderColor: chartColors[index % chartColors.length] }}
									>
										<span className="font-medium">{fund.meta?.scheme_code}</span>
										<span className={performance.percentChange >= 0 ? "text-green-600" : "text-red-600"}>
											{performance.percentChange >= 0 ? "+" : ""}
											{performance.percentChange.toFixed(2)}%
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-5 w-5 ml-1 p-0"
											onClick={() => removeFund(fundCode)}
										>
											<X className="h-3 w-3" />
											<span className="sr-only">Remove</span>
										</Button>
									</Badge>
								);
							})}
						</div>
					</div>

					{/* Combined View */}
					{viewMode === "combined" && (
						<Card>
							<CardHeader className="pb-2">
								<CardTitle>NAV Comparison</CardTitle>
								<CardDescription>Compare NAV trends across selected mutual funds</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[500px]">
									{loading && fundCodes.length === 0 ? (
										<div className="h-full flex items-center justify-center">
											<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
										</div>
									) : fundCodes.length === 0 ? (
										<div className="h-full flex items-center justify-center">
											<div className="text-center">
												<p className="text-muted-foreground mb-4">No funds selected for comparison</p>
												<Button
													variant="outline"
													onClick={() => {
														const initialFunds = sampleFundCodes.slice(0, 3);
														setFundCodes(initialFunds);
														initialFunds.forEach(fetchFundData);
													}}
												>
													Add Sample Funds
												</Button>
											</div>
										</div>
									) : filteredData.length === 0 ? (
										<div className="h-full flex items-center justify-center">
											<div className="text-center">
												<p className="text-muted-foreground mb-4">No data available for the selected time period</p>
											</div>
										</div>
									) : (
										<ChartContainer config={chartConfig}>
											<ResponsiveContainer
												width="100%"
												height="100%"
											>
												<LineChart
													// className="bg-blue-500"
													data={filteredData}
													margin={{ top: 10, right: 30, left: 0, bottom: 300 }}
												>
													<CartesianGrid
														strokeDasharray="3 3"
														vertical={false}
													/>
													<XAxis
														dataKey="date"
														tickFormatter={(date) => {
															const d = new Date(date);
															return `${d.getMonth() + 1}/${d.getDate()}`;
														}}
														tick={{ fontSize: 12 }}
													/>
													<YAxis
														tickFormatter={(value) => `₹${value}`}
														tick={{ fontSize: 12 }}
														domain={["auto", "auto"]}
													/>
													<Tooltip
														formatter={(value) => [`₹${value}`, ""]}
														labelFormatter={(label) => {
															const date = new Date(label);
															return date.toLocaleDateString("en-US", {
																year: "numeric",
																month: "short",
																day: "numeric",
															});
														}}
													/>
													<Legend />
													{fundCodes.map((fundCode, index) => (
														<Line
															key={fundCode}
															type="monotone"
															dataKey={`fund${fundCode}`}
															name={
																fundsData[fundCode]?.meta?.scheme_name?.split(" ").slice(0, 3).join(" ") ||
																`Fund ${fundCode}`
															}
															stroke={chartColors[index % chartColors.length]}
															strokeWidth={2}
															dot={false}
															activeDot={{ r: 6 }}
														/>
													))}
												</LineChart>
											</ResponsiveContainer>
										</ChartContainer>
									)}
								</div>
							</CardContent>
							<CardFooter className="flex justify-between">
								<div className="text-sm text-muted-foreground">
									Data shown for {timePeriods.find((p) => p.value === timePeriod)?.label}
								</div>
								<div className="text-sm text-muted-foreground">
									Past performance is not indicative of future results
								</div>
							</CardFooter>
						</Card>
					)}

					{/* Individual View */}
					{viewMode === "individual" && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{loading && fundCodes.length === 0 ? (
								<div className="md:col-span-2 h-[300px] flex items-center justify-center">
									<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
								</div>
							) : fundCodes.length === 0 ? (
								<div className="md:col-span-2 h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
									<div className="text-center">
										<p className="text-muted-foreground mb-4">No funds selected for comparison</p>
										<Button
											variant="outline"
											onClick={() => {
												const initialFunds = sampleFundCodes.slice(0, 3);
												setFundCodes(initialFunds);
												initialFunds.forEach(fetchFundData);
											}}
										>
											Add Sample Funds
										</Button>
									</div>
								</div>
							) : (
								fundCodes.map((fundCode, index) => {
									const fund = fundsData[fundCode];
									if (!fund) return null;

									const fundData = filterDataByPeriod(fund.data, timePeriod);
									const performance = calculatePerformance(fundData, fundCode);

									return (
										<Card key={fundCode}>
											<CardHeader className="pb-2">
												<div className="flex justify-between items-start">
													<div>
														<CardTitle className="flex items-center gap-2">
															{fund.meta?.scheme_code}
															<Badge
																variant="outline"
																className={
																	performance.percentChange >= 0
																		? "text-green-600 border-green-200"
																		: "text-red-600 border-red-200"
																}
															>
																{performance.percentChange >= 0 ? "+" : ""}
																{performance.percentChange.toFixed(2)}%
															</Badge>
														</CardTitle>
														<CardDescription className="line-clamp-2">{fund.meta?.scheme_name}</CardDescription>
													</div>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={() => removeFund(fundCode)}
													>
														<X className="h-4 w-4" />
														<span className="sr-only">Remove</span>
													</Button>
												</div>
											</CardHeader>
											<CardContent>
												{fundData.length === 0 ? (
													<div className="h-[200px] flex items-center justify-center">
														<p className="text-muted-foreground">No data available for the selected time period</p>
													</div>
												) : (
													<div className="h-[200px]">
														<ResponsiveContainer
															width="100%"
															height="100%"
														>
															<LineChart
																data={fundData.map((item) => ({
																	date: formatDateForSorting(item.date),
																	nav: Number.parseFloat(item.nav),
																}))}
																margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
															>
																<CartesianGrid
																	strokeDasharray="3 3"
																	vertical={false}
																/>
																<XAxis
																	dataKey="date"
																	tickFormatter={(date) => {
																		const d = new Date(date);
																		return `${d.getMonth() + 1}/${d.getDate()}`;
																	}}
																	tick={{ fontSize: 10 }}
																/>
																<YAxis
																	tickFormatter={(value) => `₹${value}`}
																	tick={{ fontSize: 10 }}
																	domain={["auto", "auto"]}
																/>
																<Tooltip
																	formatter={(value) => [`₹${value}`, "NAV"]}
																	labelFormatter={(label) => {
																		const date = new Date(label);
																		return date.toLocaleDateString("en-US", {
																			year: "numeric",
																			month: "short",
																			day: "numeric",
																		});
																	}}
																/>
																<Line
																	type="monotone"
																	dataKey="nav"
																	stroke={chartColors[index % chartColors.length]}
																	strokeWidth={2}
																	dot={false}
																	activeDot={{ r: 5 }}
																/>
															</LineChart>
														</ResponsiveContainer>
													</div>
												)}
												<div className="mt-4 grid grid-cols-2 gap-4">
													<div>
														<div className="text-sm text-muted-foreground">Current NAV</div>
														<div className="text-lg font-medium">₹{performance.currentNav.toFixed(2)}</div>
													</div>
													<div>
														<div className="text-sm text-muted-foreground">Change</div>
														<div
															className={`text-lg font-medium ${
																performance.change >= 0 ? "text-green-600" : "text-red-600"
															}`}
														>
															{performance.change >= 0 ? "+" : ""}₹{performance.change.toFixed(2)} (
															{performance.percentChange >= 0 ? "+" : ""}
															{performance.percentChange.toFixed(2)}%)
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									);
								})
							)}
						</div>
					)}

					{/* Fund Details Table */}
					{fundCodes.length > 0 && Object.keys(fundsData).length > 0 && (
						<Card className="mt-4">
							<CardHeader className="pb-2">
								<CardTitle>Fund Details</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left py-3 px-4 font-medium">Fund</th>
												<th className="text-left py-3 px-4 font-medium">Fund House</th>
												<th className="text-left py-3 px-4 font-medium">Category</th>
												<th className="text-right py-3 px-4 font-medium">Current NAV</th>
												<th className="text-right py-3 px-4 font-medium">Change</th>
											</tr>
										</thead>
										<tbody>
											{fundCodes.map((fundCode) => {
												const fund = fundsData[fundCode];
												if (!fund) return null;

												const fundData = filterDataByPeriod(fund.data, timePeriod);
												const performance = calculatePerformance(fundData, fundCode);

												return (
													<tr
														key={fundCode}
														className="border-b"
													>
														<td className="py-3 px-4">
															<div>
																<div className="font-medium">{fund.meta?.scheme_code}</div>
																<div className="text-sm text-muted-foreground line-clamp-1">
																	{fund.meta?.scheme_name}
																</div>
															</div>
														</td>
														<td className="py-3 px-4">{fund.meta?.fund_house}</td>
														<td className="py-3 px-4">
															<Badge variant="outline">{fund.meta?.scheme_category}</Badge>
														</td>
														<td className="py-3 px-4 text-right">₹{performance.currentNav.toFixed(2)}</td>
														<td
															className={`py-3 px-4 text-right ${
																performance.percentChange >= 0 ? "text-green-600" : "text-red-600"
															}`}
														>
															{performance.percentChange >= 0 ? "+" : ""}
															{performance.percentChange.toFixed(2)}%
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</main>
		</div>
	);
}
