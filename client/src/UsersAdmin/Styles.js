import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';

export const Page = styled.div`
  min-height: 100vh;
  padding: 36px 24px 80px;
  background: ${color.backgroundLightest};
`;

export const Container = styled.div`
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
`;

export const BackLink = styled.div`
  display: inline-block;
  margin-bottom: 10px;
  ${font.size(13.5)}
  color: ${color.textMedium};
  cursor: pointer;
  &:hover {
    color: ${color.textDark};
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Title = styled.h1`
  ${font.bold}
  ${font.size(24)}
  color: ${color.textDark};
`;

export const Hint = styled.div`
  margin: 8px 0 20px;
  ${font.size(14)}
  color: ${color.textMedium};
`;

export const UserList = styled.div`
  background: #fff;
  border: 1px solid ${color.borderLightest};
  border-radius: 6px;
`;

export const UserRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${color.borderLightest};
  }
`;

export const UserMeta = styled.div`
  flex: 1;
  min-width: 0;
  margin-left: 12px;
`;

export const UserName = styled.div`
  ${font.medium}
  ${font.size(14.5)}
  color: ${color.textDark};
  ${mixin.truncateText}
`;

export const UserEmail = styled.div`
  ${font.size(13)}
  color: ${color.textMedium};
  ${mixin.truncateText}
`;

export const RoleBadge = styled.span`
  margin-right: 14px;
  padding: 2px 9px;
  border-radius: 11px;
  ${font.size(12)}
  ${font.medium}
  color: ${props => (props.admin ? '#fff' : color.textMedium)};
  background: ${props => (props.admin ? color.primary : color.backgroundMedium)};
`;

export const PermCell = styled.div`
  flex-shrink: 0;
  ${font.size(13)}
  color: ${color.textMedium};
`;
