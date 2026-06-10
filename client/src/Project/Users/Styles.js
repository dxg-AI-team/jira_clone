import styled from 'styled-components';

import { color, font } from 'shared/utils/styles';
import Button from 'shared/components/Button';

export const Page = styled.div`
  padding: 25px 32px 50px;
  width: 100%;
  max-width: 900px;
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

export const UserList = styled.div`
  border: 1px solid ${color.borderLightest};
  border-radius: 4px;
`;

export const UserRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${color.borderLightest};
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

export const UserMeta = styled.div`
  margin-left: 14px;
  min-width: 0;
`;

export const UserName = styled.div`
  ${font.medium}
  ${font.size(15)}
  color: ${color.textDark};
`;

export const UserEmail = styled.div`
  ${font.size(13)}
  color: ${color.textMedium};
`;

export const RoleBadge = styled.div`
  margin: 0 18px;
  padding: 2px 10px;
  border-radius: 4px;
  ${font.medium}
  ${font.size(12.5)}
  color: ${props => (props.isAdmin ? '#fff' : color.textMedium)};
  background: ${props => (props.isAdmin ? color.primary : color.backgroundMedium)};
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

export const FormElement = styled.div`
  padding: 5px 0 20px;
`;

export const Actions = styled.div`
  display: flex;
  padding-top: 28px;
`;

export const ActionButton = styled(Button)`
  margin-right: 10px;
`;
