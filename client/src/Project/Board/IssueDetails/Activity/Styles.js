import styled from 'styled-components';

import { color, font } from 'shared/utils/styles';

export const List = styled.div`
  margin-top: 8px;
`;

export const Row = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${color.borderLightest};
  }
`;

export const Body = styled.div`
  flex: 1;
  min-width: 0;
  margin-left: 10px;
  padding-top: 2px;
`;

export const Line = styled.div`
  ${font.size(14)}
  color: ${color.textDarkest};
`;

export const Actor = styled.span`
  ${font.medium}
`;

export const Time = styled.div`
  margin-top: 2px;
  ${font.size(12.5)}
  color: ${color.textLight};
`;

export const Empty = styled.div`
  padding: 10px 0;
  ${font.size(14)}
  color: ${color.textMedium};
`;
