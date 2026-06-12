import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';

export const ParentBanner = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  padding: 7px 10px;
  border-radius: 4px;
  background: ${color.backgroundLightest};
  ${font.size(13.5)}
  color: ${color.textMedium};
`;

export const ParentLink = styled.span`
  margin-left: 6px;
  color: ${color.textLink};
  cursor: pointer;
  ${mixin.truncateText}
  &:hover {
    text-decoration: underline;
  }
`;

export const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

export const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  margin-right: 10px;
  border-radius: 4px;
  background: ${color.backgroundMedium};
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  border-radius: 4px;
  background: ${color.success};
  width: ${props => props.percent}%;
  transition: width 0.2s;
`;

export const ProgressText = styled.div`
  flex-shrink: 0;
  ${font.size(12.5)}
  color: ${color.textMedium};
`;

export const List = styled.div`
  margin-bottom: 8px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 7px 8px;
  border: 1px solid ${color.borderLightest};
  border-radius: 3px;
  margin-bottom: 5px;
  &:hover {
    background: ${color.backgroundLight};
  }
`;

export const RowTitle = styled.div`
  flex: 1;
  min-width: 0;
  margin: 0 8px;
  ${font.size(14)}
  color: ${color.textDarkest};
  cursor: pointer;
  ${mixin.truncateText}
  text-decoration: ${props => (props.done ? 'line-through' : 'none')};
  opacity: ${props => (props.done ? 0.6 : 1)};
  &:hover {
    text-decoration: underline;
  }
`;

export const StatusTag = styled.span`
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 3px;
  ${font.size(11)}
  color: #fff;
  background: ${props => props.bg};
`;

export const AddRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

export const AddInput = styled.input`
  flex: 1;
  height: 32px;
  padding: 0 9px;
  border: 1px solid ${color.borderLight};
  border-radius: 4px;
  ${font.size(14)}
  &:focus {
    border-color: ${color.borderInputFocus};
    outline: none;
  }
`;
