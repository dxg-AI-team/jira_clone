import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';

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

export const Name = styled.div`
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

export const Size = styled.div`
  flex-shrink: 0;
  margin-right: 6px;
  ${font.size(12)}
  color: ${color.textMedium};
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const Hint = styled.div`
  margin-top: 4px;
  ${font.size(12.5)}
  color: ${color.textMedium};
`;
