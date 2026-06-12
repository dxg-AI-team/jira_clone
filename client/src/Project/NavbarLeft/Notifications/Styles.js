import styled from 'styled-components';

import { color, font, mixin, zIndexValues } from 'shared/utils/styles';

export const Badge = styled.div`
  position: absolute;
  top: 6px;
  left: 30px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: ${color.danger};
  color: #fff;
  text-align: center;
  line-height: 16px;
  ${font.bold}
  ${font.size(10)}
`;

export const Panel = styled.div`
  position: fixed;
  z-index: ${zIndexValues.dropdown};
  left: 70px;
  bottom: 20px;
  width: 360px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 5px;
  ${mixin.boxShadowDropdown}
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid ${color.borderLightest};
  ${font.medium}
  ${font.size(15)}
  color: ${color.textDark};
`;

export const MarkAll = styled.div`
  ${mixin.link()}
  ${font.size(12.5)}
`;

export const List = styled.div`
  overflow-y: auto;
  ${mixin.customScrollbar()}
`;

export const NotifRow = styled.div`
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid ${color.borderLightest};
  cursor: pointer;
  background: ${props => (props.unread ? '#deebff44' : 'transparent')};
  &:hover {
    background: ${color.backgroundLight};
  }
`;

export const Dot = styled.div`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin: 6px 10px 0 0;
  border-radius: 50%;
  background: ${props => (props.unread ? color.primary : 'transparent')};
`;

export const NotifBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const NotifText = styled.div`
  ${font.size(13.5)}
  color: ${color.textDarkest};
`;

export const NotifTime = styled.div`
  margin-top: 3px;
  ${font.size(12)}
  color: ${color.textLight};
`;

export const Empty = styled.div`
  padding: 30px 16px;
  text-align: center;
  ${font.size(13.5)}
  color: ${color.textMedium};
`;
