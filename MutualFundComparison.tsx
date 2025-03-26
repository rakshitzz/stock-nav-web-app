"use client";

import { useState } from "react";
import { Filter, Info, Plus, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Sample mutual fund data
const mutualFunds = [
	{
		id: "1",
		name: "Vanguard Total Stock Market Index Fund",
		ticker: "VTSAX",
		category: "Large Blend",
		expenseRatio: 0.04,
		aum: 1300.5, // in billions
		ytdReturn: 12.8,
		oneYearReturn: 15.2,
		threeYearReturn: 9.7,
		fiveYearReturn: 11.3,
		tenYearReturn: 12.1,
		risk: "Average",
		riskRating: 3,
		morningstarRating: 5,
		minInvestment: 3000,
		turnoverRate: 2.8,
		dividendYield: 1.35,
	},
	{
		id: "2",
		name: "Fidelity 500 Index Fund",
		ticker: "FXAIX",
		category: "Large Blend",
		expenseRatio: 0.015,
		aum: 425.7,
		ytdReturn: 13.1,
		oneYearReturn: 16.4,
		threeYearReturn: 10.2,
		fiveYearReturn: 11.8,
		tenYearReturn: 12.3,
		risk: "Average",
		riskRating: 3,
		morningstarRating: 5,
		minInvestment: 0,
		turnoverRate: 2.1,
		dividendYield: 1.42,
	},
	{
		id: "3",
		name: "T. Rowe Price Blue Chip Growth Fund",
		ticker: "TRBCX",
		category: "Large Growth",
		expenseRatio: 0.69,
		aum: 89.3,
		ytdReturn: 14.5,
		oneYearReturn: 18.7,
		threeYearReturn: 8.9,
		fiveYearReturn: 12.5,
		tenYearReturn: 13.8,
		risk: "Above Average",
		riskRating: 4,
		morningstarRating: 4,
		minInvestment: 2500,
		turnoverRate: 37.2,
		dividendYield: 0.12,
	},
	{
		id: "4",
		name: "American Funds Washington Mutual Investors Fund",
		ticker: "AWSHX",
		category: "Large Value",
		expenseRatio: 0.58,
		aum: 145.2,
		ytdReturn: 9.8,
		oneYearReturn: 12.3,
		threeYearReturn: 7.5,
		fiveYearReturn: 9.1,
		tenYearReturn: 10.2,
		risk: "Below Average",
		riskRating: 2,
		morningstarRating: 4,
		minInvestment: 250,
		turnoverRate: 22.5,
		dividendYield: 2.05,
	},
	{
		id: "5",
		name: "Vanguard Mid-Cap Index Fund",
		ticker: "VIMAX",
		category: "Mid-Cap Blend",
		expenseRatio: 0.05,
		aum: 152.8,
		ytdReturn: 10.2,
		oneYearReturn: 11.8,
		threeYearReturn: 8.3,
		fiveYearReturn: 9.7,
		tenYearReturn: 10.5,
		risk: "Average",
		riskRating: 3,
		morningstarRating: 4,
		minInvestment: 3000,
		turnoverRate: 15.8,
		dividendYield: 1.48,
	},
];

export default function MutualFundComparison() {
	const [selectedFunds, setSelectedFunds] = useState<string[]>(["1", "2"]);
	const [searchTerm, setSearchTerm] = useState("");
	const [visibleMetrics, setVisibleMetrics] = useState({
		expenseRatio: true,
		aum: true,
		ytdReturn: true,
		oneYearReturn: true,
		threeYearReturn: true,
		fiveYearReturn: true,
		tenYearReturn: true,
		risk: true,
		morningstarRating: true,
		minInvestment: true,
		turnoverRate: false,
		dividendYield: false,
	});

	const filteredFunds = mutualFunds.filter(
		(fund) =>
			fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			fund.ticker.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const selectedFundsData = mutualFunds.filter((fund) => selectedFunds.includes(fund.id));

	const toggleMetric = (metric: keyof typeof visibleMetrics) => {
		setVisibleMetrics((prev) => ({
			...prev,
			[metric]: !prev[metric],
		}));
	};

	const addFund = (id: string) => {
		if (!selectedFunds.includes(id)) {
			setSelectedFunds([...selectedFunds, id]);
		}
	};

	const removeFund = (id: string) => {
		setSelectedFunds(selectedFunds.filter((fundId) => fundId !== id));
	};

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<header className="sticky top-0 z-10 w-full border-b bg-background">
				<div className="container flex h-16 items-center px-4 sm:px-6">
					<h1 className="text-lg font-semibold">Mutual Fund Comparison</h1>
					<div className="ml-auto flex items-center space-x-4">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
									>
										<Info className="h-4 w-4" />
										<span className="sr-only">Help</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Compare mutual funds side by side</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</header>
			<main className="flex-1 container py-6 px-4 sm:px-6">
				<div className="grid gap-6">
					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
						<div className="flex-1 max-w-md">
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search funds by name or ticker..."
									className="pl-8"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="h-9"
									>
										<Filter className="mr-2 h-4 w-4" />
										Customize View
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-72"
									align="end"
								>
									<div className="grid gap-4">
										<div className="space-y-2">
											<h4 className="font-medium leading-none">Displayed Metrics</h4>
											<p className="text-sm text-muted-foreground">
												Select which metrics to display in the comparison table
											</p>
										</div>
										<div className="grid gap-2">
											{Object.entries(visibleMetrics).map(([key, value]) => (
												<div
													key={key}
													className="flex items-center space-x-2"
												>
													<Checkbox
														id={key}
														checked={value}
														onCheckedChange={() => toggleMetric(key as keyof typeof visibleMetrics)}
													/>
													<label
														htmlFor={key}
														className="text-sm capitalize"
													>
														{key === "aum"
															? "AUM (Assets Under Management)"
															: key === "ytdReturn"
															? "YTD Return"
															: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
													</label>
												</div>
											))}
										</div>
									</div>
								</PopoverContent>
							</Popover>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="h-9"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Fund
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-56"
								>
									{filteredFunds.map((fund) => (
										<DropdownMenuCheckboxItem
											key={fund.id}
											checked={selectedFunds.includes(fund.id)}
											onCheckedChange={() => (selectedFunds.includes(fund.id) ? removeFund(fund.id) : addFund(fund.id))}
										>
											{fund.name} ({fund.ticker})
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					<Tabs
						defaultValue="comparison"
						className="w-full"
					>
						<TabsList className="grid w-full max-w-md grid-cols-2">
							<TabsTrigger value="comparison">Comparison</TabsTrigger>
							<TabsTrigger value="performance">Performance</TabsTrigger>
						</TabsList>
						<TabsContent
							value="comparison"
							className="mt-4"
						>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle>Fund Comparison</CardTitle>
									<CardDescription>Compare key metrics across selected mutual funds</CardDescription>
								</CardHeader>
								<CardContent>
									{selectedFundsData.length === 0 ? (
										<div className="text-center py-8">
											<p className="text-muted-foreground">No funds selected for comparison</p>
											<Button
												variant="outline"
												className="mt-4"
												onClick={() => setSelectedFunds(["1", "2"])}
											>
												Add Default Funds
											</Button>
										</div>
									) : (
										<div className="overflow-x-auto">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead className="w-[200px]">Metric</TableHead>
														{selectedFundsData.map((fund) => (
															<TableHead
																key={fund.id}
																className="min-w-[180px]"
															>
																<div className="flex flex-col">
																	<div className="flex items-center justify-between">
																		<span className="font-bold">{fund.ticker}</span>
																		<Button
																			variant="ghost"
																			size="icon"
																			className="h-6 w-6"
																			onClick={() => removeFund(fund.id)}
																		>
																			<X className="h-4 w-4" />
																			<span className="sr-only">Remove</span>
																		</Button>
																	</div>
																	<span className="text-xs font-normal text-muted-foreground line-clamp-1">
																		{fund.name}
																	</span>
																</div>
															</TableHead>
														))}
													</TableRow>
												</TableHeader>
												<TableBody>
													<TableRow>
														<TableCell className="font-medium">Category</TableCell>
														{selectedFundsData.map((fund) => (
															<TableCell key={fund.id}>
																<Badge variant="outline">{fund.category}</Badge>
															</TableCell>
														))}
													</TableRow>

													{visibleMetrics.expenseRatio && (
														<TableRow>
															<TableCell className="font-medium">
																<div className="flex items-center gap-1">
																	Expense Ratio
																	<TooltipProvider>
																		<Tooltip>
																			<TooltipTrigger asChild>
																				<Info className="h-3.5 w-3.5 text-muted-foreground" />
																			</TooltipTrigger>
																			<TooltipContent>
																				<p className="max-w-xs">
																					Annual fee charged by the fund as a percentage of assets
																				</p>
																			</TooltipContent>
																		</Tooltip>
																	</TooltipProvider>
																</div>
															</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell key={fund.id}>{fund.expenseRatio}%</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.aum && (
														<TableRow>
															<TableCell className="font-medium">AUM ($ Billions)</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell key={fund.id}>${fund.aum.toFixed(1)}B</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.ytdReturn && (
														<TableRow>
															<TableCell className="font-medium">YTD Return</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell
																	key={fund.id}
																	className={fund.ytdReturn >= 0 ? "text-green-600" : "text-red-600"}
																>
																	{fund.ytdReturn >= 0 ? "+" : ""}
																	{fund.ytdReturn}%
																</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.oneYearReturn && (
														<TableRow>
															<TableCell className="font-medium">1-Year Return</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell
																	key={fund.id}
																	className={fund.oneYearReturn >= 0 ? "text-green-600" : "text-red-600"}
																>
																	{fund.oneYearReturn >= 0 ? "+" : ""}
																	{fund.oneYearReturn}%
																</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.threeYearReturn && (
														<TableRow>
															<TableCell className="font-medium">3-Year Return (Annualized)</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell
																	key={fund.id}
																	className={fund.threeYearReturn >= 0 ? "text-green-600" : "text-red-600"}
																>
																	{fund.threeYearReturn >= 0 ? "+" : ""}
																	{fund.threeYearReturn}%
																</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.fiveYearReturn && (
														<TableRow>
															<TableCell className="font-medium">5-Year Return (Annualized)</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell
																	key={fund.id}
																	className={fund.fiveYearReturn >= 0 ? "text-green-600" : "text-red-600"}
																>
																	{fund.fiveYearReturn >= 0 ? "+" : ""}
																	{fund.fiveYearReturn}%
																</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.tenYearReturn && (
														<TableRow>
															<TableCell className="font-medium">10-Year Return (Annualized)</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell
																	key={fund.id}
																	className={fund.tenYearReturn >= 0 ? "text-green-600" : "text-red-600"}
																>
																	{fund.tenYearReturn >= 0 ? "+" : ""}
																	{fund.tenYearReturn}%
																</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.risk && (
														<TableRow>
															<TableCell className="font-medium">Risk Level</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell key={fund.id}>
																	<div className="flex items-center gap-2">
																		<div className="flex">
																			{[...Array(5)].map((_, i) => (
																				<div
																					key={i}
																					className={`w-2 h-6 mx-0.5 rounded-sm ${
																						i < fund.riskRating ? "bg-primary" : "bg-muted"
																					}`}
																				/>
																			))}
																		</div>
																		<span className="text-xs">{fund.risk}</span>
																	</div>
																</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.morningstarRating && (
														<TableRow>
															<TableCell className="font-medium">Morningstar Rating</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell key={fund.id}>
																	<div className="flex">
																		{[...Array(5)].map((_, i) => (
																			<svg
																				key={i}
																				xmlns="http://www.w3.org/2000/svg"
																				viewBox="0 0 24 24"
																				fill={i < fund.morningstarRating ? "currentColor" : "none"}
																				stroke={i < fund.morningstarRating ? "none" : "currentColor"}
																				className={`w-4 h-4 ${
																					i < fund.morningstarRating ? "text-yellow-500" : "text-muted-foreground"
																				}`}
																			>
																				<path
																					strokeLinecap="round"
																					strokeLinejoin="round"
																					strokeWidth={2}
																					d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
																				/>
																			</svg>
																		))}
																	</div>
																</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.minInvestment && (
														<TableRow>
															<TableCell className="font-medium">Minimum Investment</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell key={fund.id}>
																	{fund.minInvestment === 0 ? "None" : `$${fund.minInvestment.toLocaleString()}`}
																</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.turnoverRate && (
														<TableRow>
															<TableCell className="font-medium">
																<div className="flex items-center gap-1">
																	Turnover Rate
																	<TooltipProvider>
																		<Tooltip>
																			<TooltipTrigger asChild>
																				<Info className="h-3.5 w-3.5 text-muted-foreground" />
																			</TooltipTrigger>
																			<TooltipContent>
																				<p className="max-w-xs">
																					Percentage of a fund&apos;s holdings that have been replaced in a given year
																				</p>
																			</TooltipContent>
																		</Tooltip>
																	</TooltipProvider>
																</div>
															</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell key={fund.id}>{fund.turnoverRate}%</TableCell>
															))}
														</TableRow>
													)}

													{visibleMetrics.dividendYield && (
														<TableRow>
															<TableCell className="font-medium">Dividend Yield</TableCell>
															{selectedFundsData.map((fund) => (
																<TableCell key={fund.id}>{fund.dividendYield}%</TableCell>
															))}
														</TableRow>
													)}
												</TableBody>
											</Table>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>
						<TabsContent
							value="performance"
							className="mt-4"
						>
							<Card>
								<CardHeader>
									<CardTitle>Performance Comparison</CardTitle>
									<CardDescription>Historical performance of selected mutual funds</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-[400px] flex items-center justify-center bg-muted/40 rounded-md">
										<p className="text-muted-foreground">Performance chart would be displayed here</p>
									</div>
									<div className="mt-6 grid gap-4">
										<h3 className="text-lg font-medium">Performance Summary</h3>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Fund</TableHead>
													<TableHead>YTD</TableHead>
													<TableHead>1 Year</TableHead>
													<TableHead>3 Year</TableHead>
													<TableHead>5 Year</TableHead>
													<TableHead>10 Year</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{selectedFundsData.map((fund) => (
													<TableRow key={fund.id}>
														<TableCell className="font-medium">{fund.ticker}</TableCell>
														<TableCell className={fund.ytdReturn >= 0 ? "text-green-600" : "text-red-600"}>
															{fund.ytdReturn >= 0 ? "+" : ""}
															{fund.ytdReturn}%
														</TableCell>
														<TableCell className={fund.oneYearReturn >= 0 ? "text-green-600" : "text-red-600"}>
															{fund.oneYearReturn >= 0 ? "+" : ""}
															{fund.oneYearReturn}%
														</TableCell>
														<TableCell className={fund.threeYearReturn >= 0 ? "text-green-600" : "text-red-600"}>
															{fund.threeYearReturn >= 0 ? "+" : ""}
															{fund.threeYearReturn}%
														</TableCell>
														<TableCell className={fund.fiveYearReturn >= 0 ? "text-green-600" : "text-red-600"}>
															{fund.fiveYearReturn >= 0 ? "+" : ""}
															{fund.fiveYearReturn}%
														</TableCell>
														<TableCell className={fund.tenYearReturn >= 0 ? "text-green-600" : "text-red-600"}>
															{fund.tenYearReturn >= 0 ? "+" : ""}
															{fund.tenYearReturn}%
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	);
}
