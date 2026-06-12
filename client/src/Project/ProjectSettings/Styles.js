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

export const WorkflowCont = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid ${color.borderLightest};
`;

export const WorkflowInner = styled.div`
  width: 100%;
  max-width: 640px;
`;

export const WorkflowHint = styled.div`
  margin: -8px 0 16px;
  ${font.size(13.5)}
  color: ${color.textMedium};
`;

export const WorkflowRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

export const WorkflowStatus = styled.div`
  width: 120px;
  flex-shrink: 0;
  ${font.medium}
  ${font.size(14)}
  color: ${color.textDark};
`;

export const WorkflowInput = styled.input`
  height: 34px;
  padding: 0 9px;
  border: 1px solid ${color.borderLight};
  border-radius: 4px;
  ${font.size(14)}
  &:focus {
    border-color: ${color.borderInputFocus};
    outline: none;
  }
`;

export const WipInput = styled(WorkflowInput)`
  width: 90px;
`;
