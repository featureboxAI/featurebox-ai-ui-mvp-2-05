import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AIInsightPanelProps {
  insights: string[];
}

const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ insights }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">AI Insights</h3>
        </div>
        
        <div className="grid gap-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-sm">{insight}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          These insights are generated based on pattern analysis of your historical data and forecasted results.
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightPanel;
