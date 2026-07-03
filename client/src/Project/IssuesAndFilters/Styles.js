import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';

export const Page = styled.div`
  padding: 25px 32px 50px;
  width: 100%;
  max-width: 1100px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

export const Title = styled.h1`
  ${font.bold}
  ${font.size(24)}
  color: ${color.textDark};
`;

export const ResultCount = styled.div`
  ${font.size(14)}
  color: ${color.textMedium};
`;

export const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 18px;
`;

export const RowSubMeta = styled.div`
  margin-top: 2px;
  ${font.size(12)}
  color: ${color.textLight};
`;

export const SavedBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
`;

export const SavedLabel = styled.div`
  ${font.medium}
  ${font.size(13)}
  color: ${color.textMedium};
`;

export const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 4px 0 11px;
  border-radius: 14px;
  background: ${props => (props.isActive ? color.primary : color.backgroundMedium)};
  ${font.size(13)}
  color: ${props => (props.isActive ? '#fff' : color.textDark)};
  cursor: pointer;
  &:hover {
    background: ${props => (props.isActive ? color.primary : color.backgroundLight)};
  }
`;

export const ChipDelete = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 5px;
  border-radius: 50%;
  ${font.size(15)}
  color: ${color.textMedium};
  &:hover {
    background: rgba(0, 0, 0, 0.12);
    color: ${color.textDarkest};
  }
`;

export const SaveBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
`;

export const SaveInput = styled.input`
  height: 30px;
  width: 160px;
  padding: 0 8px;
  border: 1px solid ${color.borderLight};
  border-radius: 4px;
  ${font.size(13.5)}
  &:focus {
    border-color: ${color.borderInputFocus};
    outline: none;
  }
`;

export const SearchBox = styled.div`
  width: 220px;
`;

export const FilterItem = styled.div`
  min-width: 150px;
`;

export const ClearButton = styled.div`
  margin-top: 6px;
  padding: 6px 4px;
  cursor: pointer;
  ${font.medium}
  ${font.size(14)}
  color: ${color.textMedium};
  &:hover {
    color: ${color.textDark};
  }
`;

export const Table = styled.div`
  border: 1px solid ${color.borderLightest};
  border-radius: 4px;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid ${color.borderLightest};
  background: ${color.backgroundLightest};
  ${font.medium}
  ${font.size(12.5)}
  text-transform: uppercase;
  color: ${color.textMedium};
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 11px 16px;
  text-decoration: none;
  cursor: pointer;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${color.borderLightest};
  }
  &:hover {
    background: ${color.backgroundLight};
  }
`;

export const ColType = styled.div`
  width: 34px;
  flex-shrink: 0;
`;

export const ColTitle = styled.div`
  flex: 1;
  min-width: 0;
  padding-right: 12px;
  ${font.regular}
  ${font.size(15)}
  color: ${color.textDarkest};
  ${mixin.truncateText}
`;

export const ColStatus = styled.div`
  width: 130px;
  flex-shrink: 0;
`;

export const ColPriority = styled.div`
  width: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

export const ColVersion = styled.div`
  width: 150px;
  flex-shrink: 0;
  ${font.size(13.5)}
  color: ${color.textMedium};
  ${mixin.truncateText}
`;

export const ColAssignees = styled.div`
  width: 96px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  > * + * {
    margin-left: -6px;
  }
`;

export const StatusBadge = styled.div`
  display: inline-block;
  padding: 2px 9px;
  border-radius: 4px;
  ${font.medium}
  ${font.size(12)}
  text-transform: uppercase;
  color: ${props => props.textColor};
  background: ${props => props.bg};
`;

export const Empty = styled.div`
  padding: 40px;
  text-align: center;
  ${font.size(15)}
  color: ${color.textMedium};
`;
