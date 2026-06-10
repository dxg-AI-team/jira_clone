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
