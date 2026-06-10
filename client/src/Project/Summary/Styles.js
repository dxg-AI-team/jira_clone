import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';

export const Page = styled.div`
  padding: 22px 32px 60px;
  width: 100%;
  max-width: 1280px;
`;

export const Title = styled.h1`
  margin: 6px 0 20px;
  ${font.bold}
  ${font.size(24)}
  color: ${color.textDark};
`;

export const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
`;

export const StatCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 18px;
  border: 1px solid ${color.borderLightest};
  border-radius: 6px;
  background: #fff;
`;

export const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 14px;
  border-radius: 8px;
  color: #fff;
  background: ${props => props.bg || color.primary};
`;

export const StatBody = styled.div``;

export const StatValue = styled.div`
  ${font.bold}
  ${font.size(22)}
  color: ${color.textDarkest};
`;

export const StatLabel = styled.div`
  margin-top: 2px;
  ${font.size(13)}
  color: ${color.textMedium};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
`;

export const Card = styled.div`
  padding: 20px 22px 24px;
  border: 1px solid ${color.borderLightest};
  border-radius: 6px;
  background: #fff;
`;

export const CardTitle = styled.h2`
  margin-bottom: 18px;
  ${font.medium}
  ${font.size(17)}
  color: ${color.textDark};
`;

export const Empty = styled.div`
  padding: 24px 0 4px;
  ${font.size(14)}
  color: ${color.textMedium};
`;

/* Donut */
export const DonutLayout = styled.div`
  display: flex;
  align-items: center;
`;

export const DonutWrap = styled.div`
  position: relative;
  width: 170px;
  height: 170px;
  flex-shrink: 0;
`;

export const Donut = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${props => props.gradient};
`;

export const DonutHole = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const DonutTotal = styled.div`
  ${font.bold}
  ${font.size(26)}
  color: ${color.textDarkest};
`;

export const DonutTotalLabel = styled.div`
  margin-top: 2px;
  ${font.size(11.5)}
  color: ${color.textMedium};
`;

export const Legend = styled.div`
  flex: 1;
  margin-left: 28px;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 0;
  ${font.size(13.5)}
`;

export const LegendDot = styled.span`
  width: 11px;
  height: 11px;
  border-radius: 3px;
  margin-right: 9px;
  flex-shrink: 0;
  background: ${props => props.dotColor};
`;

export const LegendLabel = styled.span`
  flex: 1;
  color: ${color.textMedium};
  ${mixin.truncateText}
`;

export const LegendCount = styled.span`
  ${font.medium}
  color: ${color.textDark};
`;

/* Bar charts */
export const ChartRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const RowLabel = styled.div`
  width: 120px;
  flex-shrink: 0;
  ${font.size(13.5)}
  color: ${color.textMedium};
  ${mixin.truncateText}
`;

export const BarTrack = styled.div`
  flex: 1;
  height: 16px;
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
  width: 38px;
  flex-shrink: 0;
  text-align: right;
  ${font.medium}
  ${font.size(13.5)}
  color: ${color.textDark};
`;

/* Recent activity */
export const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 9px 0;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${color.borderLightest};
  }
`;

export const ActivityMain = styled.div`
  flex: 1;
  min-width: 0;
  margin-right: 12px;
`;

export const ActivityTitle = styled.div`
  ${font.size(14)}
  color: ${color.textDark};
  ${mixin.truncateText}
`;

export const ActivityMeta = styled.div`
  margin-top: 2px;
  ${font.size(12)}
  color: ${color.textLight};
`;

export const StatusTag = styled.span`
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  ${font.medium}
  ${font.size(11.5)}
  color: ${props => props.textColor};
  background: ${props => props.bg};
`;
