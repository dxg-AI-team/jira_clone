import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';

export const Page = styled.div`
  padding: 25px 32px 50px;
  width: 100%;
  max-width: 1100px;
`;

export const Title = styled.h1`
  margin-bottom: 20px;
  ${font.bold}
  ${font.size(24)}
  color: ${color.textDark};
`;

export const SummaryRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 26px;
`;

export const SummaryCard = styled.div`
  flex: 1;
  padding: 18px 20px;
  border: 1px solid ${color.borderLightest};
  border-radius: 6px;
  background: #fff;
`;

export const SummaryValue = styled.div`
  ${font.bold}
  ${font.size(30)}
  color: ${color.textDarkest};
`;

export const SummaryLabel = styled.div`
  margin-top: 4px;
  ${font.size(14)}
  color: ${color.textMedium};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
`;

export const DonutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 18px;
  margin-bottom: 26px;
`;

export const Card = styled.div`
  padding: 20px 22px 24px;
  border: 1px solid ${color.borderLightest};
  border-radius: 6px;
  background: #fff;
`;

export const CardTitle = styled.h2`
  margin-bottom: 16px;
  ${font.medium}
  ${font.size(17)}
  color: ${color.textDark};
`;

export const ChartRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const RowLabel = styled.div`
  width: 110px;
  flex-shrink: 0;
  ${font.size(13.5)}
  color: ${color.textMedium};
  ${mixin.truncateText}
`;

export const BarTrack = styled.div`
  flex: 1;
  height: 18px;
  margin: 0 10px;
  border-radius: 4px;
  background: ${color.backgroundLightest};
  overflow: hidden;
`;

export const BarFill = styled.div`
  height: 100%;
  border-radius: 4px;
  width: ${props => props.percent}%;
  min-width: ${props => (props.count > 0 ? '4px' : '0')};
  background: ${props => props.barColor};
  transition: width 0.2s;
`;

export const RowCount = styled.div`
  width: 32px;
  flex-shrink: 0;
  text-align: right;
  ${font.medium}
  ${font.size(13.5)}
  color: ${color.textDark};
`;

export const Empty = styled.div`
  padding: 30px 0 4px;
  ${font.size(14)}
  color: ${color.textMedium};
`;

export const BurndownCard = styled.div`
  margin-bottom: 26px;
  padding: 20px 22px 24px;
  border: 1px solid ${color.borderLightest};
  border-radius: 6px;
  background: #fff;
`;

export const BurndownHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
`;

export const BurndownMeta = styled.div`
  ${font.size(13)}
  color: ${color.textMedium};
`;

export const Legend = styled.div`
  display: flex;
  gap: 18px;
  margin: 6px 0 14px;
  ${font.size(13)}
  color: ${color.textMedium};
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

export const LegendSwatch = styled.span`
  display: inline-block;
  width: 22px;
  height: 0;
  margin-right: 7px;
  border-top: ${props => (props.dashed ? '2px dashed' : '3px solid')} ${props => props.swatch};
`;

/* Donuts */
export const DonutWrap = styled.div`
  display: flex;
  align-items: center;
`;

export const DonutLegend = styled.div`
  flex: 1;
  min-width: 0;
  margin-left: 18px;
`;

export const DonutLegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  ${font.size(13)}
  color: ${color.textMedium};
  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const DonutSwatch = styled.span`
  flex-shrink: 0;
  width: 11px;
  height: 11px;
  margin-right: 8px;
  border-radius: 2px;
  background: ${props => props.swatch};
`;

export const DonutLegendLabel = styled.span`
  flex: 1;
  min-width: 0;
  ${mixin.truncateText}
`;

export const DonutLegendValue = styled.span`
  ${font.medium}
  color: ${color.textDark};
`;

/* Stacked bar chart */
export const StackChart = styled.div`
  display: flex;
  align-items: flex-end;
  height: 220px;
  padding-top: 10px;
  border-bottom: 1px solid ${color.borderLightest};
`;

export const StackColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
  padding: 0 3px;
`;

export const StackBar = styled.div`
  display: flex;
  flex-direction: column-reverse;
  width: 70%;
  max-width: 34px;
  border-radius: 3px 3px 0 0;
  overflow: hidden;
`;

export const StackSegment = styled.div`
  width: 100%;
  background: ${props => props.segColor};
  height: ${props => props.h}px;
`;

export const StackAxis = styled.div`
  display: flex;
  margin-top: 6px;
`;

export const StackTick = styled.div`
  flex: 1;
  text-align: center;
  ${font.size(11)}
  color: ${color.textLight};
`;

/* Detail table */
export const TableWrap = styled.div`
  border: 1px solid ${color.borderLightest};
  border-radius: 6px;
  overflow: hidden;
`;

export const TRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  ${font.size(14)}
  border-bottom: 1px solid ${color.borderLightest};
  cursor: ${props => (props.head ? 'default' : 'pointer')};
  color: ${props => (props.head ? color.textMedium : color.textDarkest)};
  ${props => props.head && font.medium};
  background: ${props => (props.head ? color.backgroundLightest : '#fff')};
  &:hover {
    background: ${props => (props.head ? color.backgroundLightest : color.backgroundLight)};
  }
  &:last-of-type {
    border-bottom: none;
  }
`;

export const TKey = styled.div`
  width: 90px;
  flex-shrink: 0;
  ${font.medium}
  color: ${color.textLink};
`;

export const TType = styled.div`
  width: 110px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

export const TPriority = styled.div`
  width: 90px;
  flex-shrink: 0;
`;

export const TSummary = styled.div`
  flex: 1;
  min-width: 0;
  ${mixin.truncateText}
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
`;

export const PageButton = styled.button`
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid ${color.borderLightest};
  border-radius: 4px;
  cursor: pointer;
  ${font.size(13.5)}
  color: ${props => (props.active ? '#fff' : color.textDark)};
  background: ${props => (props.active ? color.primary : '#fff')};
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
  &:hover:not(:disabled) {
    border-color: ${color.borderInputFocus};
  }
`;

export const PageInfo = styled.div`
  margin-left: auto;
  ${font.size(13)}
  color: ${color.textMedium};
`;
