import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';
import Form from 'shared/components/Form';

export const Page = styled.div`
  min-height: 100vh;
  padding: 40px 24px 80px;
  background: ${color.backgroundLightest};
`;

export const Container = styled.div`
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
`;

export const Title = styled.h1`
  ${font.bold}
  ${font.size(28)}
  color: ${color.textDarkest};
`;

export const TopActions = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 12px;
  }
`;

export const LinkText = styled.div`
  cursor: pointer;
  ${font.size(14)}
  color: ${color.textMedium};
  &:hover {
    color: ${color.textDark};
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const Card = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid ${color.borderLightest};
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.1s;
  &:hover {
    box-shadow: rgba(9, 30, 66, 0.13) 0px 0px 1px, rgba(9, 30, 66, 0.13) 0px 4px 8px -2px;
  }
`;

export const CardMeta = styled.div`
  margin-left: 14px;
  min-width: 0;
`;

export const CardName = styled.div`
  ${font.medium}
  ${font.size(17)}
  color: ${color.textDark};
  ${mixin.truncateText}
`;

export const CardSub = styled.div`
  ${font.size(13)}
  color: ${color.textMedium};
`;

export const DeleteButton = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`;

export const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  ${font.size(15)}
  color: ${color.textMedium};
  border: 1px dashed ${color.borderLight};
  border-radius: 8px;
`;

export const FormHeading = styled.h1`
  padding-bottom: 15px;
  ${font.medium}
  ${font.size(21)}
  color: ${color.textDark};
`;

export const FormElement = styled(Form.Element)`
  padding: 5px 0 20px;
`;

export const Actions = styled.div`
  display: flex;
  padding-top: 28px;
`;

export const IconChoices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0 16px;
`;

export const IconChoice = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  ${font.size(20)}
  background: ${color.backgroundLightest};
  border: 2px solid ${props => (props.isSelected ? color.primary : 'transparent')};
  &:hover {
    background: ${color.backgroundLight};
  }
`;
