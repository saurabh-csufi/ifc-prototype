import { StateSelector } from '../selectors/StateSelector';
import { ThemeSelector } from '../selectors/ThemeSelector';
import { IndicatorMultiSelect } from '../selectors/IndicatorMultiSelect';

export function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar-title">
        <h1>State Profile Dashboard</h1>
        <p className="top-bar-subtitle">Education Indicators</p>
      </div>
      <div className="top-bar-controls">
        <StateSelector />
        <ThemeSelector />
        <IndicatorMultiSelect />
      </div>
    </header>
  );
}
