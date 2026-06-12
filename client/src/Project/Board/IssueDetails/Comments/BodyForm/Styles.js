import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';
import { Button } from 'shared/components';

export const Actions = styled.div`
  display: flex;
  padding-top: 10px;
`;

export const FormButton = styled(Button)`
  margin-right: 6px;
`;

export const MentionWrap = styled.div`
  position: relative;
`;

export const MentionList = styled.div`
  position: absolute;
  z-index: 10;
  left: 0;
  right: 0;
  top: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border-radius: 4px;
  ${mixin.boxShadowDropdown}
  ${mixin.customScrollbar()}
`;

export const MentionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  ${font.size(14)}
  color: ${color.textDarkest};
  background: ${props => (props.active ? color.backgroundLight : 'transparent')};
  &:hover {
    background: ${color.backgroundLight};
  }
`;

export const MentionName = styled.span`
  margin-left: 9px;
`;
