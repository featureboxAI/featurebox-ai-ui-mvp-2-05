import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Eye
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
        const chunk_prompt = `### ROLE You are a meticulous **Supply‑Chain Data Analyst** embedded in our forecasting platform. You have full command of descriptive statistics, time‑series diagnostics, and business‑oriented storytelling. Write for demand planners and business managers who want quick, actionable takeaways.

### GOAL From the **new forecast data** you (the model) just received—*note: this is a **chunked portion** of the full dataset*—surface the **top insights** that help users:
1. Understand material demand swings (biggest MoM jumps & drops) and their likely drivers.
2. Spot SKU × Channel combinations with consistent growth or decline trends.
3. Detect unusual patterns in history (e.g., long zero-demand periods followed by spikes).
4. Explain **why** these trends or patterns likely happened, using statistical or business evidence (e.g., promo_flag, seasonality, historical context).
5. Decide what to act on now (e.g., "stock up", "watch inventory", "investigate promo impact") without forcing them to debug the model.

### INFORMATION ACCESS You are provided with a **chunked slice** of the overall dataset:
${chunkCsv}

Here is a breakdown of each column in the dataset:
- sheet: The company that sells the product.
- item: A unique identifier for the product.
- model: The model used to generate the forecast values.
- ds: The date associated with the forecast.
- forecast: The predicted number of sales for the product on the given date.
- historical_value: The most recent actual number of sales for the product.

Use the historical_value column as a general historical baseline for your insights.
To calculate percent_change_mom, compare the forecast to the historical_value column.

*You will see other chunks separately. Treat your response as self-contained, but precise and consistent in format with earlier chunks so we can later combine them.*

### INSTRUCTIONS
* Work at **SKU–Channel granularity** (e.g., "SKU 12345 – Amazon.com") when citing results.
* Compute month-over-month % change on the *forecast* for each SKU-Channel.
* Identify the **top N (default = 10) largest increases** and **top N largest decreases**.
* Flag SKU-Channels with a **steady CAGR** (≥ tolerance) over the last *k* periods (default = 6).
* Scan historical_data to find patterns:
  - ≥ 3 straight periods of ~0 demand followed by a spike ≥ 5× historical median.
  - Abrupt structural breaks (mean shift, variance jump).
* Link each insight to plausible drivers (promo_flag, seasonality, external_signals) when evidence exists; otherwise say "driver unknown".
* For each insight, include a concise **explanation or root cause** of why the trend or anomaly likely occurred.
* End with **"Planner Actions"**—concise bullets of recommended next steps.

### STYLE Use plain English phrases—avoid jargon. Keep numeric values to one decimal unless integers. Limit each insight to ≤ 40 words.`;

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
                }],
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: "object",
                    properties: {
                      biggest_moves: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            sku_channel: { type: "string" },
                            percent_change_mom: { type: "number" },
                            direction: { type: "string" },
                            likely_drivers: {
                              type: "array",
                              items: { type: "string" }
                            },
                            explanation: { type: "string" },
                            planner_action: { type: "string" }
                          },
                          required: [
                            "sku_channel",
                            "percent_change_mom",
                            "direction",
                            "likely_drivers",
                            "explanation",
                            "planner_action"
                          ]
                        }
                      },
                      steady_trends: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            sku_channel: { type: "string" },
                            cagr_6p: { type: "number" },
                            trend: { type: "string" },
                            likely_drivers: {
                              type: "array",
                              items: { type: "string" }
                            },
                            explanation: { type: "string" },
                            planner_action: { type: "string" }
                          },
                          required: [
                            "sku_channel",
                            "cagr_6p",
                            "trend",
                            "likely_drivers",
                            "explanation",
                            "planner_action"
                          ]
                        }
                      },
                      historical_anomalies: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            sku_channel: { type: "string" },
                            pattern: { type: "string" },
                            possible_cause: { type: "string" },
                            explanation: { type: "string" },
                            planner_action: { type: "string" }
                          },
                          required: [
                            "sku_channel",
                            "pattern",
                            "possible_cause",
                            "explanation",
                            "planner_action"
                          ]
                        }
                      },
                    },
                    required: [
                      "biggest_moves",
                      "steady_trends",
                      "historical_anomalies"
                    ]
                  }
                }
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
              try {
                const parsedInsights = JSON.parse(content);
                allChunkReports.push(JSON.stringify(parsedInsights));
                console.log(`✅ Success: Chunk ${i + 1} of ${totalChunks} processed. Insights received:`, parsedInsights);
              } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
                setError('Received invalid response format from AI service.');
              }
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
      
      setProgressText('Waiting 90s before merging all chunk insights...');
      setProgress(90);
      await new Promise((res) => setTimeout(res, 90000));

      setProgressText('Merging all chunk insights...');
      setProgress(95);
      
      const joinedReports = allChunkReports.join('\n\n---\n\n');
      const merge_prompt = `You are a **Supply‑Chain Data Analyst**. Your job now is to **combine and summarize** the following insight reports into a single, coherent document. Preserve structure, conciseness, and actionable insights.

Here are the reports:
${joinedReports}

### TASK
Summarize the most important trends and anomalies across all reports, removing duplicates, clustering similar insights, and keeping explanations clear and useful.

End with a final **Planner Actions** list.`;

      let mergeRetries = 0;
      let mergeSuccess = false;
      
      while (!mergeSuccess && mergeRetries < 3) {
        try {
          const mergeResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: merge_prompt }]
              }],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "object",
                  properties: {
                    biggest_moves: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          sku_channel: { type: "string" },
                          percent_change_mom: { type: "number" },
                          direction: { type: "string" },
                          likely_drivers: {
                            type: "array",
                            items: { type: "string" }
                          },
                          explanation: { type: "string" },
                          planner_action: { type: "string" }
                        },
                        required: [
                          "sku_channel",
                          "percent_change_mom",
                          "direction",
                          "likely_drivers",
                          "explanation",
                          "planner_action"
                        ]
                      }
                    },
                    steady_trends: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          sku_channel: { type: "string" },
                          cagr_6p: { type: "number" },
                          trend: { type: "string" },
                          likely_drivers: {
                            type: "array",
                            items: { type: "string" }
                          },
                          explanation: { type: "string" },
                          planner_action: { type: "string" }
                        },
                        required: [
                          "sku_channel",
                          "cagr_6p",
                          "trend",
                          "likely_drivers",
                          "explanation",
                          "planner_action"
                        ]
                      }
                    },
                    historical_anomalies: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          sku_channel: { type: "string" },
                          pattern: { type: "string" },
                          possible_cause: { type: "string" },
                          explanation: { type: "string" },
                          planner_action: { type: "string" }
                        },
                        required: [
                          "sku_channel",
                          "pattern",
                          "possible_cause",
                          "explanation",
                          "planner_action"
                        ]
                      }
                    },
                  },
                  required: [
                    "biggest_moves",
                    "steady_trends",
                    "historical_anomalies"
                  ]
                }
              }
            })
          });
          
          if (mergeResponse.status === 429) {
            mergeRetries++;
            setProgressText(`Rate limited during merge (429). Waiting 90s before retrying... (Attempt ${mergeRetries}/3)`);
            await new Promise(res => setTimeout(res, 90000));
            continue;
          }
          
          if (!mergeResponse.ok) {
            throw new Error(`Merge API request failed: ${mergeResponse.status}`);
          }
          
          const mergeData = await mergeResponse.json();
          if (mergeData.candidates && mergeData.candidates[0] && mergeData.candidates[0].content) {
            const mergeContent = mergeData.candidates[0].content.parts[0].text;
            try {
              const finalInsights = JSON.parse(mergeContent);
              setInsights(finalInsights);
              console.log('✅ Success: All chunks merged successfully:', finalInsights);
            } catch (parseError) {
              console.error('Failed to parse merged JSON response:', parseError);
              setError('Received invalid merge response format from AI service.');
            }
          } else {
            setError('No valid merge response received from AI service.');
          }
          mergeSuccess = true;
        } catch (err) {
          if (mergeRetries >= 2) {
            setError(`Failed to merge insights after 3 attempts. Error: ${(err as Error).message}`);
          }
          mergeRetries++;
          await new Promise(res => setTimeout(res, 90000));
        }
      }
      
      setProgress(100);
      setProgressText('All chunks processed and merged.');
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const renderInsightSection = (title: string, items: InsightItem[], icon: React.ReactNode, colorClass: string) => {
    if (!items || items.length === 0) return null;
    
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${colorClass}`}>
            {icon}
            {title}
          </h3>
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
                    <p className="text-sm font-medium mb-2">
                      {item.sku_channel}
                    </p>
                    {item.percent_change_mom !== undefined && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">Change:</span> {item.percent_change_mom.toFixed(1)}% {item.direction}
                      </p>
                    )}
                    {item.cagr_6p !== undefined && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">6-Period CAGR:</span> {item.cagr_6p.toFixed(1)}% ({item.trend})
                      </p>
                    )}
                    {item.pattern && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">Pattern:</span> {item.pattern}
                      </p>
                    )}
                    {item.possible_cause && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">Possible Cause:</span> {item.possible_cause}
                      </p>
                    )}
                    {item.likely_drivers && item.likely_drivers.length > 0 && !item.likely_drivers.some(driver => driver.toLowerCase().includes('unknown')) && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">Drivers:</span> {item.likely_drivers.filter(driver => !driver.toLowerCase().includes('unknown')).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Explanation:</span> {item.explanation}
                    </p>
                    <div className="text-sm text-primary bg-primary/10 px-2 py-1 rounded">
                      <span className="font-medium">Action:</span> {item.planner_action}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">AI Supply Chain Insights</h3>
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
            <h4 className="text-xl font-bold mb-4">Generated Insights</h4>
            
            {renderInsightSection(
              "Biggest Demand Movements", 
              insights.biggest_moves, 
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />,
              "text-blue-700"
            )}
            
            {renderInsightSection(
              "Steady Growth/Decline Trends", 
              insights.steady_trends, 
              <TrendingDown className="h-5 w-5 text-green-500 mr-2" />,
              "text-green-700"
            )}
            
            {renderInsightSection(
              "Historical Anomalies", 
              insights.historical_anomalies, 
              <Eye className="h-5 w-5 text-yellow-500 mr-2" />,
              "text-yellow-700"
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
            Upload your supply chain forecast data to generate AI-powered insights based on pattern analysis of historical data and forecasted results.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightPanel;
