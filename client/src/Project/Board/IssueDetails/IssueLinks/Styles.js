import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';

export const LinkGroup = styled.div`
  margin-bottom: 10px;
`;

export const GroupLabel = styled.div`
  margin-bottom: 4px;
  ${font.size(12.5)}
  color: ${color.textMedium};
`;

export const LinkRow = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border: 1px solid ${color.borderLightest};
  border-radius: 3px;
  margin-bottom: 5px;
  &:hover {
    background: ${color.backgroundLight};
  }
`;

export const LinkTitle = styled.div`
  flex: 1;
  min-width: 0;
  margin: 0 8px;
  ${font.size(14)}
  color: ${color.textLink};
  cursor: pointer;
  ${mixin.truncateText}
  &:hover {
    text-decoration: underline;
  }
`;

export const StatusTag = styled.span`
  flex-shrink: 0;
  margin-right: 6px;
  padding: 1px 6px;
  border-radius: 3px;
  ${font.size(11)}
  color: #fff;
  background: ${props => props.bg || color.textMedium};
`;

export const AddForm = styled.div`
  margin-top: 8px;
  padding: 10px;
  border: 1px solid ${color.borderLightest};
  border-radius: 4px;
  background: ${color.backgroundLightest};
`;

export const FieldRow = styled.div`
  margin-bottom: 8px;
`;

export const Actions = styled.div`
  display: flex;
  > * + * {
    margin-left: 6px;
  }
`;
