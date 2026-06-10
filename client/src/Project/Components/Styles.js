import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';
import Button from 'shared/components/Button';
import Form from 'shared/components/Form';

export const Page = styled.div`
  padding: 25px 32px 50px;
  width: 100%;
  max-width: 1000px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  ${font.bold}
  ${font.size(24)}
  color: ${color.textDark};
`;

export const Empty = styled.div`
  padding: 40px;
  text-align: center;
  ${font.size(15)}
  color: ${color.textMedium};
  border: 1px dashed ${color.borderLight};
  border-radius: 4px;
`;

export const List = styled.div`
  border: 1px solid ${color.borderLightest};
  border-radius: 4px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 18px;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${color.borderLightest};
  }
`;

export const Main = styled.div`
  flex: 1;
  min-width: 0;
`;

export const Name = styled.div`
  ${font.medium}
  ${font.size(16)}
  color: ${color.textDark};
`;

export const Description = styled.div`
  margin-top: 3px;
  ${font.size(13.5)}
  color: ${color.textMedium};
  ${mixin.truncateText}
`;

export const CountBadge = styled.div`
  margin: 0 22px;
  padding: 3px 10px;
  border-radius: 4px;
  ${font.medium}
  ${font.size(12.5)}
  color: ${color.textMedium};
  background: ${color.backgroundMedium};
  white-space: nowrap;
`;

export const RowActions = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 6px;
  }
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

export const ActionButton = styled(Button)`
  margin-right: 10px;
`;
