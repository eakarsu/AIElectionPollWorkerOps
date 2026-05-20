import React from 'react';
import AIPage from '../components/AIPage';
import { aiLineWaitForecast } from '../services/api';

export default function AILineWaitForecastPage() {
  return (
    <AIPage
      title="AI · Line Wait Forecast"
      feature="line-wait-forecast"
      subtitle="Forecast peak voter wait times by precinct from current line data and operational notes."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. heavy rain expected 4-7pm; bias toward downtown precincts.' },
      ]}
      run={(v) => aiLineWaitForecast({ notes: v.notes })}
    />
  );
}
