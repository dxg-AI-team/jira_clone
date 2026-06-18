import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

import { color, font, mixin } from 'shared/utils/styles';
import { Avatar } from 'shared/components';

export const IssueLink = styled(Link)`
  display: block;
  margin-bottom: 5px;
`;

export const Issue = styled.div`
  padding: 10px;
  border-radius: 3px;
  background: #fff;
  box-shadow: 0px 1px 2px 0px rgba(9, 30, 66, 0.25);
  transition: background 0.1s;
  ${mixin.clickable}
  @media (max-width: 1100px) {
    padding: 10px 8px;
  }
  &:hover {
    background: ${color.backgroundLight};
  }
  ${props =>
    props.isBeingDragged &&
    css`
      transform: rotate(3deg);
      box-shadow: 5px 10px 30px 0px rgba(9, 30, 66, 0.15);
    `}
`;

export const Title = styled.p`
  padding-bottom: 11px;
  ${font.size(15)}
  @media (max-width: 1100px) {
    ${font.size(14.5)}
  }
`;

export const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ParentChip = styled.div`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  margin-bottom: 7px;
  padding: 2px 7px;
  border-radius: 3px;
  background: ${color.backgroundLightest};
  ${font.size(11.5)}
  color: ${color.textMedium};
  ${mixin.truncateText}
`;

export const SubtaskBadge = styled.div`
  display: inline-flex;
  align-items: center;
  height: 20px;
  margin-left: 8px;
  padding: 0 7px;
  border-radius: 10px;
  ${font.size(11.5)}
  ${font.medium}
  color: ${color.textMedium};
  background: ${color.backgroundMedium};
`;

export const LeftMeta = styled.div`
  display: flex;
  align-items: center;
`;

export const IssueKey = styled.span`
  margin-left: 6px;
  ${font.size(12.5)}
  ${font.medium}
  color: ${color.textMedium};
  text-transform: uppercase;
`;

export const Assignees = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-left: 2px;
`;

export const AssigneeAvatar = styled(Avatar)`
  margin-left: -2px;
  box-shadow: 0 0 0 2px #fff;
`;
