import styled, { css } from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';

export const Status = styled.div`
  text-transform: uppercase;
  transition: all 0.1s;
  ${props => mixin.tag(props.bg, '#fff')}
  ${props =>
    props.isValue &&
    css`
      padding: 0 12px;
      height: 32px;
      &:hover {
        transform: scale(1.05);
      }
    `}
`;

export const ResolutionModal = styled.div`
  padding: 28px 32px 32px;
`;

export const ModalTitle = styled.h1`
  padding-bottom: 12px;
  ${font.size(21)}
  ${font.medium}
  color: ${color.textDarkest};
`;

export const ModalHint = styled.p`
  margin-bottom: 12px;
  ${font.size(14.5)}
  color: ${color.textMedium};
`;

export const ModalActions = styled.div`
  display: flex;
  padding-top: 20px;
  & > button:first-child {
    margin-right: 10px;
  }
`;

export const Resolution = styled.div`
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 3px;
  background: ${color.backgroundLightest};
  ${font.size(14)}
  color: ${color.textDark};
  white-space: pre-wrap;
`;

export const ResolutionLabel = styled.div`
  margin-top: 14px;
  ${font.size(12.5)}
  text-transform: uppercase;
  color: ${color.textMedium};
`;
