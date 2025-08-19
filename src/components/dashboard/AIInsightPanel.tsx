import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const TOKENS_PER_ROW = 55;
const MAX_TOKENS = 800000;
const CHUNK_SIZE = Math.floor(MAX_TOKENS / TOKENS_PER_ROW);
const OVERLAP_ROWS = Math.floor(CHUNK_SIZE * 0.1);

interface InsightItem {
  sku_channel: string;
  percent_change_mom?: number;
  direction?: string;
  cagr_6p?: number;
  trend?: string;
  pattern?: string;
  possible_cause?: string;
  likely_drivers?: string[];
  explanation: string;
  planner_action: string;
}

interface Insights {
  biggest_moves: InsightItem[];
  steady_trends: InsightItem[];
  historical_anomalies: InsightItem[];
}

const AIInsightPanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  // Section collapse states
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    biggestMoves: true,
    steadyTrends: true,
    anomalies: true
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx'))) {
      setSelectedFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type === 'text/csv') {
          setCsvContent(e.target?.result as string);
        } else {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            if (!workbook.SheetNames.includes('forecast')) {
              setError('Excel file must contain a sheet named "forecast".');
              setSelectedFile(null);
              setCsvContent('');
              return;
            }
            
            const forecastSheet = workbook.Sheets['forecast'];
            const csvData = XLSX.utils.sheet_to_csv(forecastSheet);
            setCsvContent(csvData);
            
            console.log('✅ Successfully extracted forecast sheet and converted to CSV');
          } catch (error) {
            console.error('Error processing XLSX file:', error);
            setError('Failed to process Excel file. Please ensure it contains a valid "forecast" sheet.');
            setSelectedFile(null);
            setCsvContent('');
          }
        }
      };
      
      if (file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } else {
      setError('Please select a valid CSV or Excel (.xlsx) file.');
      setSelectedFile(null);
      setCsvContent('');
    }
  };

  const countTokensForPrompt = async (prompt: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:countTokens?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data.totalTokens !== undefined) {
        console.log(`Token count for current prompt: ${data.totalTokens}`);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const chunkRowsByFixedSize = (rows: any[]) => {
    const chunks = [];
    let start = 0;
    while (start < rows.length) {
      let end = start + CHUNK_SIZE;
      if (end > rows.length) end = rows.length;
      const chunk = rows.slice(start, end);
      chunks.push(chunk);
      if (end === rows.length) break;
      start = end - OVERLAP_ROWS;
      if (start < 0) start = 0;
    }
    return chunks;
  };

  const processAndChunkCSV = async (csvText: string): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || !results.data.length) {
            reject('CSV parsing failed or file is empty.');
            return;
          }
          const rows = results.data;
          const chunks = chunkRowsByFixedSize(rows);
          resolve(chunks);
        },
        error: (err) => reject(err.message)
      });
    });
  };

  // New function to validate and fix insights
  const validateAndFixInsights = (insights: Insights): Insights => {
    const fixInsightArray = (items: InsightItem[]): InsightItem[] => {
      const fixedItems: InsightItem[] = [];
      
      items.forEach(item => {
        // Check if sku_channel contains multiple SKUs (commas, "Multiple", etc.)
        if (item.sku_channel.includes(',') || 
            item.sku_channel.toLowerCase().includes('multiple') ||
            item.sku_channel.toLowerCase().includes('several')) {
          
          // Try to extract individual SKUs from the explanation or sku_channel
          const skuMatches = item.explanation.match(/([A-Z]+)\s*[-×]\s*([A-Z0-9]+)/g) || [];
          
          if (skuMatches.length > 0) {
            // Create separate insights for each SKU found
            skuMatches.slice(0, 3).forEach(skuMatch => { // Limit to 3 to avoid spam
              const cleanSku = skuMatch.replace(/×/g, '-').trim();
              fixedItems.push({
                ...item,
                sku_channel: cleanSku,
                explanation: `This specific SKU-Channel combination ${cleanSku} shows ${item.percent_change_mom ? 'a ' + item.percent_change_mom.toFixed(1) + '% change' : 'the pattern described'}. ${item.explanation.split('.')[0]}.`,
                planner_action: `For ${cleanSku}: ${item.planner_action}`
              });
            });
          } else {
            // If we can't extract individual SKUs, create a generic one
            fixedItems.push({
              ...item,
              sku_channel: "UNIDENTIFIED - SKU01",
              explanation: "Individual SKU analysis needed. " + item.explanation,
              planner_action: "Analyze individual SKUs: " + item.planner_action
            });
          }
        } else {
          // Keep valid single SKU insights as is
          fixedItems.push(item);
        }
      });
      
      return fixedItems;
    };

    return {
      biggest_moves: fixInsightArray(insights.biggest_moves),
      steady_trends: fixInsightArray(insights.steady_trends),
      historical_anomalies: fixInsightArray(insights.historical_anomalies)
    };
  };

  const generateInsights = async () => {
    if (!selectedFile || !csvContent) {
      setError('Please select a CSV file first.');
      return;
    }
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key not found. Please check your environment configuration.');
      return;
    }
    setLoading(true);
    setError('');
    setInsights(null);
    setProgress(0);
    setProgressText('Parsing and chunking CSV...');
    
    try {
      const allChunks = await processAndChunkCSV(csvContent);
      const totalChunks = allChunks.length;
      const allChunkReports: string[] = [];
      
      for (let i = 0; i < totalChunks; i++) {
        const chunk = allChunks[i];
        setProgress(Math.round(((i + 1) / (totalChunks + 1)) * 100));
        setProgressText(`Processing chunk ${i + 1} of ${totalChunks}...`);
        
        const chunkCsv = Papa.unparse(chunk);
        
        const chunk_prompt = `You are a Senior Supply Chain Business Analyst providing insights for executive decision-making. Analyze this forecast data with a focus on business opportunities and strategic actions.

CRITICAL INSTRUCTIONS:
1. NEVER question the accuracy of forecasts, models, or historical data
2. NEVER suggest there are "model issues" or "data problems" 
3. NEVER use phrases like "misconfigured", "inaccurate data", "model error", or similar
4. Focus on BUSINESS INSIGHTS and MARKET OPPORTUNITIES
5. Provide specific, actionable business explanations

DATA CONTEXT:
- sheet = retail channel/customer where product is sold
- item = product SKU code  
- forecast = predicted sales units for upcoming period
- historic_value = recent actual sales performance

DATA:
${chunkCsv}

ANALYSIS TASK: 
Calculate demand change: (forecast - historic_value) / historic_value * 100 for each sheet-item combination.

Focus on identifying:
1. GROWTH OPPORTUNITIES (significant increases in demand)
2. DECLINE RISKS (significant decreases in demand) 
3. STABLE PERFORMERS (consistent growth/decline trends)
4. MARKET SHIFTS (unusual patterns worth investigating)

For each insight, provide BUSINESS-FOCUSED explanations such as:
- Seasonal demand patterns
- Market expansion opportunities  
- Competitive positioning changes
- Customer preference shifts
- New product adoption
- Category lifecycle stages
- Promotional effectiveness
- Distribution channel performance
- Regional market dynamics
- Economic factor impacts

RESPONSE FORMAT:

SIGNIFICANT DEMAND INCREASES:
- Sheet-Item: [exact sheet] - [exact item]
  Demand Change: [X]% increase
  Analysis: [specific market/business explanation for this product-channel growth]
  Recommended Action: [specific business action to capitalize on this opportunity]

SIGNIFICANT DEMAND DECREASES:
- Sheet-Item: [exact sheet] - [exact item]  
  Demand Change: [X]% decrease
  Analysis: [specific market/business explanation for this decline]
  Recommended Action: [specific business action to address this challenge]

STABLE GROWTH TRENDS:
- Sheet-Item: [exact sheet] - [exact item]
  Growth Pattern: [steady growth/decline] 
  Analysis: [market/business explanation for this consistent performance]
  Recommended Action: [action to maintain or optimize this trend]

MARKET ANOMALIES:
- Sheet-Item: [exact sheet] - [exact item]
  Pattern: [describe the unusual demand pattern]
  Analysis: [market/business explanation for this anomaly]
  Recommended Action: [action to investigate or respond to this pattern]

Remember: Focus on market dynamics, customer behavior, and business strategy. Never question data quality or model performance.`;

        await countTokensForPrompt(chunk_prompt);
        
        let retries = 0;
        let success = false;
        
        while (!success && retries < 3) {
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: chunk_prompt }]
                }]
              })
            });
            
            if (response.status === 429) {
              retries++;
              setProgressText(`Rate limited (429). Waiting 90s before retrying... (Attempt ${retries}/3)`);
              await new Promise(res => setTimeout(res, 90000));
              continue;
            }
            
            if (!response.ok) {
              throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              const content = data.candidates[0].content.parts[0].text;
              allChunkReports.push(content);
              console.log(`✅ Success: Chunk ${i + 1} of ${totalChunks} processed. Text response received.`);
            } else {
              setError('No valid response received from AI service.');
            }
            success = true;
          } catch (err) {
            if (retries >= 2) {
              setError(`Failed to generate insights after 3 attempts. Last error: ${(err as Error).message}`);
            }
            retries++;
            await new Promise(res => setTimeout(res, 90000));
          }
        }
        
        if (i < totalChunks - 1) {
          setProgressText(`Waiting 90s before next chunk...`);
          await new Promise(res => setTimeout(res, 90000));
        }
      }
      
      setProgressText('Waiting 90s before converting to structured format...');
      setProgress(90);
      await new Promise((res) => setTimeout(res, 90000));

      setProgressText('Converting to structured format...');
      setProgress(95);
      
      const joinedReports = allChunkReports.join('\n\n---CHUNK SEPARATOR---\n\n');
      
      // Improved conversion prompt with business focus
      const convert_prompt = `Convert this supply chain business analysis into structured JSON format for executive reporting.

CRITICAL QUALITY STANDARDS:
1. NO references to model issues, data problems, or forecast accuracy
2. Focus on BUSINESS INSIGHTS and MARKET OPPORTUNITIES
3. Use professional, confident language suitable for executive review
4. Provide specific, actionable business explanations
5. Extract only individual sheet-item combinations (never group multiple items)

BUSINESS ANALYSIS TO CONVERT:
${joinedReports}

TARGET JSON STRUCTURE:

{
  "biggest_moves": [
    {
      "sku_channel": "SHEET - ITEM",
      "percent_change_mom": number,
      "direction": "Growth" or "Decline", 
      "likely_drivers": ["business_driver_1", "business_driver_2"],
      "explanation": "Professional business explanation focusing on market dynamics, customer behavior, or strategic positioning for this specific sheet-item",
      "planner_action": "Specific strategic business action to capitalize on opportunity or address challenge"
    }
  ],
  "steady_trends": [
    {
      "sku_channel": "SHEET - ITEM",
      "cagr_6p": number,
      "trend": "Growth" or "Decline",
      "likely_drivers": ["business_driver_1", "business_driver_2"], 
      "explanation": "Professional business explanation of why this sheet-item shows consistent performance",
      "planner_action": "Strategic action to maintain or optimize this stable trend"
    }
  ],
  "historical_anomalies": [
    {
      "sku_channel": "SHEET - ITEM",
      "pattern": "Business-focused description of the demand pattern",
      "possible_cause": "Market-based explanation for the anomaly",
      "explanation": "Professional analysis of market conditions affecting this sheet-item", 
      "planner_action": "Strategic investigation or response action"
    }
  ]
}

BUSINESS DRIVER EXAMPLES (use relevant ones):
- "Seasonal demand peaks"
- "New product introduction"  
- "Market expansion opportunity"
- "Competitive pricing advantage"
- "Customer preference shift"
- "Category lifecycle maturity"
- "Promotional campaign success"
- "Distribution channel optimization"
- "Regional market growth"
- "Economic factor influence"
- "Category consolidation"
- "Brand positioning strength"

CONVERSION RULES:
1. Each sku_channel must be exactly "SHEET - ITEM" format
2. Select top 15 biggest moves, top 10 steady trends, top 8 anomalies  
3. Make all explanations business-focused and confident
4. Ensure all actions are strategic and specific
5. Filter out any model/data quality references from the source analysis`;

      let convertRetries = 0;
      let convertSuccess = false;
      
      while (!convertSuccess && convertRetries < 3) {
        try {
          const convertResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: convert_prompt }]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });
          
          if (convertResponse.status === 429) {
            convertRetries++;
            setProgressText(`Rate limited during conversion (429). Waiting 90s before retrying... (Attempt ${convertRetries}/3)`);
            await new Promise(res => setTimeout(res, 90000));
            continue;
          }
          
          if (!convertResponse.ok) {
            throw new Error(`Convert API request failed: ${convertResponse.status}`);
          }
          
          const convertData = await convertResponse.json();
          if (convertData.candidates && convertData.candidates[0] && convertData.candidates[0].content) {
            const convertContent = convertData.candidates[0].content.parts[0].text;
            try {
              const rawInsights = JSON.parse(convertContent);
              // Apply validation and fixing
              const finalInsights = validateAndFixInsights(rawInsights);
              setInsights(finalInsights);
              console.log('✅ Success: Analysis converted and validated:', finalInsights);
            } catch (parseError) {
              console.error('Failed to parse converted JSON response:', parseError);
              setError('Received invalid conversion response format from AI service.');
            }
          } else {
            setError('No valid conversion response received from AI service.');
          }
          convertSuccess = true;
        } catch (err) {
          if (convertRetries >= 2) {
            setError(`Failed to convert insights after 3 attempts. Error: ${(err as Error).message}`);
          }
          convertRetries++;
          await new Promise(res => setTimeout(res, 90000));
        }
      }
      
      setProgress(100);
      setProgressText('Business insights generated successfully.');
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const resetForm = () => {
    // Stop any ongoing generation process
    setLoading(false);
    setSelectedFile(null);
    setCsvContent('');
    setInsights(null);
    setError('');
    setProgress(0);
    setProgressText('');
    // Reset the file input element
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const renderInsightSection = (title: string, items: InsightItem[], icon: React.ReactNode, colorClass: string, sectionKey: string) => {
    if (!items || items.length === 0) return null;
    
    const isCollapsed = collapsedSections[sectionKey];
    
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div 
            className={`text-lg font-semibold mb-4 flex items-center justify-between cursor-pointer hover:opacity-80 ${colorClass}`}
            onClick={() => toggleSection(sectionKey)}
          >
            <div className="flex items-center">
              {icon}
              {title}
              <span className="ml-2 text-sm font-normal text-muted-foreground">({items.length} items)</span>
            </div>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </div>
          
          {!isCollapsed && (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        colorClass.includes('blue') ? 'bg-blue-500' : 
                        colorClass.includes('green') ? 'bg-green-500' : 
                        colorClass.includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium mb-2 text-primary">
                        {item.sku_channel}
                      </p>
                      {item.percent_change_mom !== undefined && item.percent_change_mom !== null && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Demand Change:</span> 
                          <span className={`ml-1 font-semibold ${item.percent_change_mom > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.percent_change_mom > 0 ? '+' : ''}{item.percent_change_mom.toFixed(1)}% {item.direction}
                          </span>
                        </p>
                      )}
                      {item.cagr_6p !== undefined && item.cagr_6p !== null && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Growth Rate:</span> 
                          <span className={`ml-1 font-semibold ${item.cagr_6p > 0 ? 'text-green-600' : item.cagr_6p < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {item.cagr_6p > 0 ? '+' : ''}{item.cagr_6p.toFixed(1)}%{item.cagr_6p !== 0 && item.trend ? ` (${item.trend})` : ''}
                          </span>
                        </p>
                      )}
                      {item.pattern && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Market Pattern:</span> {item.pattern}
                        </p>
                      )}
                      {item.possible_cause && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Market Factor:</span> {item.possible_cause}
                        </p>
                      )}
                      {item.likely_drivers && item.likely_drivers.length > 0 && 
                       item.likely_drivers.some(driver => !driver.toLowerCase().includes('unknown') && driver.trim() !== '') && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Drivers:</span> {
                            item.likely_drivers
                              .filter(driver => !driver.toLowerCase().includes('unknown') && driver.trim() !== '')
                              .join(', ')
                          }
                        </p>
                      )}
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-2">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Analysis:</span> {item.explanation}
                        </p>
                      </div>
                      <div className="text-sm text-white bg-primary px-3 py-2 rounded-md">
                        <span className="font-medium">Recommended Action:</span> {item.planner_action}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">AI Insights</h3>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Upload Forecast File (CSV or Excel):
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileSelect}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {selectedFile && (
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                {selectedFile.name}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={generateInsights}
          disabled={!selectedFile || loading}
          className="w-full mb-4"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating AI Insights...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Insights
            </>
          )}
        </Button>

        {/* Reset Button */}
        {selectedFile && !loading && (
          <Button
            onClick={resetForm}
            variant="outline"
            className="w-full mb-4"
          >
            Reset Form
          </Button>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        {loading && (
          <div className="mb-4">
            <Progress value={progress} className="mb-2" />
            <div className="text-xs text-muted-foreground text-center">{progressText}</div>
          </div>
        )}

        {/* Insights Display */}
        {insights && (
          <div className="mt-6">
            <h4 className="text-xl font-bold mb-4">Generated Insights Report</h4>
            
            {renderInsightSection(
              "Significant Demand Movements", 
              insights.biggest_moves, 
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />,
              "text-blue-700",
              "biggestMoves"
            )}
            
            {renderInsightSection(
              "Steady Performance Trends", 
              insights.steady_trends, 
              <TrendingDown className="h-5 w-5 text-green-500 mr-2" />,
              "text-green-700",
              "steadyTrends"
            )}
            
            {renderInsightSection(
              "Market Pattern Changes", 
              insights.historical_anomalies, 
              <Eye className="h-5 w-5 text-yellow-500 mr-2" />,
              "text-yellow-700",
              "anomalies"
            )}

            {/* Disclaimer */}
            <div className="flex justify-center mt-4">
                <Alert className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-500 stroke-current flex-shrink-0" />
                <AlertDescription className="text-sm text-yellow-700">
                  <strong>Disclaimer:</strong> This analysis is AI-generated. Supply chain analysts should verify all insights and recommendations before taking action.
                </AlertDescription>
                </Alert>
            </div>
          </div>
        )}

        {!insights && !loading && (
          <div className="text-sm text-muted-foreground">
            Upload your supply chain forecast data to generate AI-powered business insights focused on market opportunities, demand patterns, and strategic recommendations.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightPanel;
