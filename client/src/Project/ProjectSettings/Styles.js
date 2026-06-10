import styled from 'styled-components';

import { color, font } from 'shared/utils/styles';
import { Button, Form } from 'shared/components';

export const FormCont = styled.div`
  display: flex;
  justify-content: center;
`;

export const FormElement = styled(Form.Element)`
  width: 100%;
  max-width: 640px;
`;

export const FormHeading = styled.h1`
  padding: 6px 0 15px;
  ${font.size(24)}
  ${font.medium}
`;

export const ActionButton = styled(Button)`
  margin-top: 30px;
`;

export const IconFieldLabel = styled.div`
  padding-bottom: 6px;
  ${font.size(15)}
  ${font.medium}
  color: ${color.textMedium};
`;

export const IconChoices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

export const IconChoice = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  cursor: pointer;
  ${font.size(22)}
  background: ${color.backgroundLightest};
  border: 2px solid ${props => (props.isSelected ? color.primary : 'transparent')};
  &:hover {
    background: ${color.backgroundLight};
  }
`;
